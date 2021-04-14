// ------------------------------------------------------------------------------------------------

// ResourceGanttFilterControl.js
// Dependencies:
// Requires: ResourceGanttFilterControl.config.js -- load this file first
// Optional: ResourceGanttFilterControl.config.override.js -- if present, load this file after ResourceGanttFilterControl.config.js
// Requires: GanttViewPage.data.ganttViewControl.id
// Requires: GanttViewPage.data.filterControlIds
// Uses: GanttViewControl.js gantt_loaded event ($(document).trigger("gantt_loaded");)

// ------------------------------------------------------------------------------------------------

// JS Closure IIFE to contain all ResourceGanttFilterControl functions
/// <signature>
///     <param name='args.page.data.ganttViewControl.id' type='string' description='ID of the jQuery Gantt control' />
///     <param name='args.page.data.filterControlIds' type='object' description='IDs of the Gantt Filter controls' />
///     <param name='args.filterPopupSettings' type='object' description='Attributes of the Gantt Filter popup' />
///     <param name='args.config' type='object' description='Filter configuration coming from ResourceGanttFilterControl.config.js' />
///     <param name='args.configOverride' type='object' description='Additional filter configuration coming from ResourceGanttFilterControl.config.override.js' />
///     <returns type='object'/>
/// </signature>
// Values for the parameters are passed at the end of the IIFE

function GetResourceGanttFilterControl(args) {

    // args = {page.data.ganttViewControl.id, page.data.filterControlIds, filterPopupSettings, config}

    // ------------------------------------------------------------------------------------------------

    //#region PRIVATE-VARIABLES

    var _filterPopupPanel = null;
    var _filterPopupDialog = null;
    var _isFilterFieldsReady = false;

    var _$ganttContainer = null;
    var _ganttControl = null;
    var _ganttDatasource = null;
    var _ganttDataColumnStore = {};

    var config = $.extend(true, args.config, args.configOverride);

    //#endregion PRIVATE-VARIABLES

    // ------------------------------------------------------------------------------------------------

    //#region PRIVATE-METHODS

    function _initFilter() {
        _captureGanttDetails();
        _prepareFilterFieldPlan();
        _constructFilterPopupPanelDialog();
        _setupFilterAccessRibbonControls();
    }

    function _captureGanttDetails() {
        _$ganttContainer = $(args.page.data.ganttViewControl.id);
        _ganttControl = _$ganttContainer.data("FlexyGantt");
        _ganttDatasource = _ganttControl.options.DataSource;
    }

    function _prepareFilterFieldPlan() {

        _ganttDataColumnStore.columns = [];
        $.each(config.plan.fields, function (title, field) {
            __prepareColumn(title, field);
        });

        function __prepareColumn(title, field) {
            if (field.filter) {
                _ganttDataColumnStore.columns.push(__prepareFieldObject(title, field));
                if (field.child) {
                    __prepareColumn(title, field.child);
                }
            }
        }

        function __prepareFieldObject(title, field) {
            var defaultFilterValueOptions = config.actions.GetDefaultFilterValueOptions(field.filtertype);
            title = field.label ? field.label : title;
            return $.fuse({
                id: _getIDFromTitle(title),
                title: title,
                filterValueInitial: field.filterValueInitial ? field.filterValueInitial : defaultFilterValueOptions.filterValueInitial,
                filterValueList: field.filterValueList ? field.filterValueList : defaultFilterValueOptions.filterValueList,
                filterValue: {} // filterValue will be replaced and filled in when _applyFilter() happens; filterValue will be {"value": ""} for single-valued fields; {"in": []} for mutli-valued fields; {"from": "","to": ""} for ranged fields;
            }, field);
        }

        // Prepare an index lookup for ease of retrieval of filter field data
        _ganttDataColumnStore.lookup = _prepareArrayLookup(_ganttDataColumnStore.columns, "id");

        // Expose a function to use the lookup to return the column by column id
        _ganttDataColumnStore.GetColumnByID = function (id) {
            return _ganttDataColumnStore.columns[_ganttDataColumnStore.lookup[id]];
        };

        // Keep a record of fields being filtered by to provide for setting the state of Remove Filter button to enabled/disabled
        _ganttDataColumnStore.filteredFields = []; // this will be filled in by _setFilterFieldValues and erased by _resetFilterFieldValues

        _prepareAutoCompleteDatasources();




    }

    function _getIDFromTitle(title) {
        return title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, "_");
    }

    function _prepareArrayLookup(array, idfield) {
        var lookup = {};
        $.each(array, function (index, item) {
            lookup[item[idfield]] = index;
        });
        return lookup;
    }

    function _prepareAutoCompleteDatasources() {

        var ds = ko.mapping.toJS(_ganttDatasource);

        var departments = _ganttDataColumnStore.GetColumnByID(_getIDFromTitle("Department(s)"));
        var persons = _ganttDataColumnStore.GetColumnByID(_getIDFromTitle("Person(s)"));
        var titles = _ganttDataColumnStore.GetColumnByID(_getIDFromTitle("Title(s)"));
        var tasks = _ganttDataColumnStore.GetColumnByID(_getIDFromTitle("Task(s)")) || _ganttDataColumnStore.GetColumnByID(_getIDFromTitle("Project(s)"));

        departments.datasource =
            $.map(ds, function (v) {
                return v.Name;
            });

        persons.datasource =
            $.map(ds, function (v) {
                var ds = v.ResUsers;
                return $.map(ds, function (v) {
                    return v.Name;
                });
            });

        titles.datasource =
            $.map(ds, function (v) {
                var ds = v.ResUsers;
                return $.map(ds, function (v) {
                    var ds = v.ResTitles;
                    return $.map(ds, function (v) {
                        return v.Name;
                    });
                });
            });

        tasks.datasource =
            $.map(ds, function (v) {
                var ds = v.ResUsers;
                return $.map(ds, function (v) {
                    var ds = v.ResTitles;
                    return $.map(ds, function (v) {
                        var ds = v.Tasks;
                        return $.map(ds, function (v) {
                            return v.Name;
                        });
                    });
                });
            });
    }

    function _constructFilterPopupPanelDialog() {
        if (_filterPopupDialog == null) {

            var filterPanelTemplate = config.actions.GetFilterPanelTemplate();
            _filterPopupPanel = $(filterPanelTemplate.template).appendTo("body").hide();

            _filterPopupDialog =
                $(_filterPopupPanel).dialog({
                    title: args.filterPopupSettings.title,
                    height: args.filterPopupSettings.height,
                    width: args.filterPopupSettings.width,
                    modal: true,
                    autoOpen: false,
                    autoReposition: true,
                    open: function (type, data) {
                        $(this).parent().appendTo("form");
                        $(this).css("max-height", ($(window).height() - 10) + "px");
                        $(this).css("max-width", args.filterPopupSettings.maxWidth);
                        $(this).css("min-width", args.filterPopupSettings.minWidth);
                    },
                    close: function (event, ui) {
                        $(args.page.data.filterControlIds.showFilter).blur(); // remove the highlighting of the ShowFilter Ribbon button on filter panel closure
                        _undoFilterFieldValueEdits();
                    }
                });

            $(_filterPopupPanel).dialog("widget").attr("id", $(_filterPopupPanel).attr("id"));

            $(".ui-dialog-title").attr("role", "heading");

            _setupFilterPopupPanelEvents(filterPanelTemplate.buttons);
        }
    }

    function _setupFilterPopupPanelEvents(buttons) {
        var filterPopupDialogButtons = {};
        filterPopupDialogButtons[buttons.OK] = function () { _applyFilter() };
        filterPopupDialogButtons[buttons.RESET] = function () { _clearFilterPanel() };
        filterPopupDialogButtons[buttons.CANCEL] = function () { _cancelFilterPanel() };

        _filterPopupDialog.dialog({ buttons: filterPopupDialogButtons });
    }

    function _setupFilterAccessRibbonControls() {
        $(args.page.data.filterControlIds.showFilter).on("click", function () {
            _showFilter();
        });

        $(args.page.data.filterControlIds.removeFilter).on("click", function () {
            if ($(this).attr("disabled") != true) {
                _removeFilter();
            }
        });

        _disableRemoveFilter();
    }

    function _setGanttDataSource(datasource) {
        _$ganttContainer.FlexyGantt("option", "DataSource", datasource);
    }

    function _showFilter() {
        _renderFilterFields();
        _filterPopupDialog.dialog("open");
    }

    function _removeFilter() {
        _disableRemoveFilter();
        _resetFilterFieldValues();
        _clearFilterPanel();

        _setGanttDataSource(_ganttDatasource);
    }

    function _enableRemoveFilter() {
        try {
            var $removeFilter = $(args.page.data.filterControlIds.removeFilter);
            if ($removeFilter.attr("disabled")) {
                var icon = $removeFilter.find("img").attr("src");
                $removeFilter
                    .attr("disabled", false)
                    .css("pointer-events", "")
                    .find("img").attr("src", icon.replace("_disable.", "."));
            }
        }
        catch (e) {
            //avoid console errors
        }
    }

    function _disableRemoveFilter() {
        try {
            var $removeFilter = $(args.page.data.filterControlIds.removeFilter);
            if (!$removeFilter.attr("disabled")) {
                var icon = $removeFilter.find("img").attr("src");
                $removeFilter
                    .attr("disabled", true)
                    .css("pointer-events", "none")
                    .find("img").attr("src", icon.replace(".", "_disable."));
            }

        }
        catch (e) {
            //avoid console errors
        }
    }

    function _applyFilter() {
        var allFilterData = $(_filterPopupPanel).find('select, textarea, input').serializeArray();
        _setFilterFieldValues(allFilterData);

        _ganttDataColumnStore.filteredFields.length > 0 ? _enableRemoveFilter() : _disableRemoveFilter();

        _setGanttDataSource(_getFilteredDatasource());

        _cancelFilterPanel();
    }

    function textComparator(cellValue, filterValue) {
        var text = filterValue.value;
        return (text == "") || (cellValue == "") || ($.trim(cellValue).toLowerCase().indexOf($.trim(text).toLowerCase()) >= 0);
    }

    function _getFilteredDatasource() {

        var datasource = _ganttDatasource.slice(); // copy the original datasource
        datasource = ko.mapping.toJS(datasource); // ko-unmap the viewmodel from gantt view
        // ko-ummapping because DS has been ko-mapped in ResourceGantt.js: viewModel = { Tasks: ko.mapping.fromJS(self.jsonData) }; $gantt_container.FlexyGantt({ DataSource: viewModel.Tasks(), ... });

        var filteredDatasource = datasource;

        $.each(config.plan.fields, function (title, field) {
            title = field.label ? field.label : title;
            filteredDatasource = (function __deepFilter(datasource, title) {
                return datasource.filter(function (item) {
                    var column = _ganttDataColumnStore.GetColumnByID(_getIDFromTitle(title));
                    var comparator = column.comparator ? column.comparator : _getDefaultComparator(column.datatype, column.filtertype, column.range);
                    var cellValue = item[column.data.displayField];
                    var filterValue = column.filterValue;
                    if (comparator(cellValue, null, filterValue, column.format)) {
                        if (column.child) {
                            var childArray = item[column.data.childArrayField];
                            childArray = __deepFilter(childArray, column.child.label);
                            item[column.data.childArrayField] = childArray;
                            return (childArray.length > 0);
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                        return false;
                    }
                });
            })(filteredDatasource, title);
        });

        filteredDatasource = (ko.mapping.fromJS(filteredDatasource))(); // ko-map before setting viewmodel to gantt view
        return filteredDatasource;
    }

    function _getDefaultComparator(datatype, filterType, range) {

        // Possible filtertype per datatype
        // BOOLEAN              : CHECKBOX, DROPDOWN, RADIOGROUP
        // DATE (range/block)   : DATEPICKER
        // NUMBER (range/block) : NUMERIC_SPINNER, TEXTBOX
        // TEXT                 : DROPDOWN, RADIOGROUP, MULTISELECT_AUTOCOMPLETE, TEXTBOX

        var comparator;

        switch (datatype) {
            case config.constants.DataTypes.BOOLEAN:
                switch (filterType) {
                    case config.constants.FilterTypes.CHECKBOX:
                        comparator = function (cellValueBase, cellValueFormatted, filterValue, format) {
                            var cellValue = cellValueBase, text = filterValue.value;
                            return (text == "") || (cellValue == "") || (cellValue == (text.toLowerCase() == "true"));
                        }
                        break;
                    case config.constants.FilterTypes.DROPDOWN:
                    case config.constants.FilterTypes.RADIOGROUP:
                        comparator = function (cellValueBase, cellValueFormatted, filterValue, format) {
                            var cellValue = cellValueBase, text = filterValue.value;
                            return (text == "ALL") || (cellValue == "") || (cellValue == (text == "YES")) || (!cellValue == (text == "NO"));
                        }
                        break;
                }
                break;
            case config.constants.DataTypes.DATE:
                switch (filterType) {
                    case config.constants.FilterTypes.DATEPICKER:
                        if (!range) {
                            comparator = function (cellValueBase, cellValueFormatted, filterValue, format) {
                                var cellValue = cellValueBase, text = filterValue.value;
                                return (text == "") || (cellValue == "") || ((cellValue != null) && (Date.compare(cellValue, Date.fromString(text, format)) == 0));
                            }
                        }
                        else {
                            comparator = function (cellValueBase, cellValueFormatted, filterValue, format) {
                                var cellValue = cellValueBase, from = filterValue.from, to = filterValue.to;
                                return (from == "" && to == "") || ((cellValue != null) && (from == "" || Date.compare(cellValue, Date.fromString(from, format)) >= 0) && (to == "" || Date.compare(cellValue, Date.fromString(to, format)) <= 0));
                            }
                        }
                        break;
                }
                break;
            case config.constants.DataTypes.NUMBER:
                switch (filterType) {
                    case config.constants.FilterTypes.NUMERIC_SPINNER:
                    case config.constants.FilterTypes.TEXTBOX:
                        if (!range) {
                            comparator = function (cellValueBase, cellValueFormatted, filterValue, format) {
                                var cellValue = cellValueBase, text = filterValue.value;
                                return (text == "") || (cellValue == "") || (cellValue == Number(text));
                            }
                        }
                        else {
                            comparator = function (cellValueBase, cellValueFormatted, filterValue, format) {
                                var cellValue = cellValueBase, from = filterValue.from, to = filterValue.to;
                                return (from == "" && to == "") || ((cellValue != null) && (from == "" || cellValue >= Number(from)) && (to == "" || cellValue <= Number(to)));
                            }
                        }
                        break;
                }
                break;
            case config.constants.DataTypes.TEXT:
                switch (filterType) {
                    case config.constants.FilterTypes.DROPDOWN:
                    case config.constants.FilterTypes.RADIOGROUP:
                        comparator = function (cellValueBase, cellValueFormatted, filterValue, format) {
                            var cellValue = cellValueBase, text = filterValue.value;
                            return (text == "") || (cellValue == "") || (cellValue == text);
                        }
                        break;
                    case config.constants.FilterTypes.MULTISELECT_AUTOCOMPLETE:
                        comparator = function (cellValueBase, cellValueFormatted, filterValue, format) {
                            var cellValue = cellValueBase, texts = filterValue.in;
                            return (texts.length == 0) || (texts.join("").length == 0) || (texts.join("!@#$%").toLowerCase().split("!@#$%").indexOf(cellValue.toLowerCase()) >= 0);
                        }
                        break;
                    case config.constants.FilterTypes.TEXTBOX:
                        comparator = function (cellValueBase, cellValueFormatted, filterValue, format) {
                            var cellValue = cellValueBase, text = filterValue.value;
                            return (text == "") || (cellValue == "") || ($.trim(cellValue).toLowerCase().indexOf($.trim(text).toLowerCase()) >= 0);
                            // $.trim() handles null, undefined, and leading/trailing spaces -- $.trim(null) = "", $.trim(undefined) = ""
                        }
                        break;
                }
                break;
        }

        return comparator;
    }

    function _setFilterFieldValues(allFilterData) {

        _ganttDataColumnStore.filteredFields.length = 0; // clear record of filtered fields

        $.each(allFilterData, function (index, filterData) {

            if (filterData.value.length > 0) {
                _ganttDataColumnStore.filteredFields.push(filterData.name);
            }

            var columnID = filterData.name.replace("_filter", "").replace("_from", "").replace("_to", "");
            var column = _ganttDataColumnStore.GetColumnByID(columnID);

            if (filterData.name.indexOf("_from") >= 0) {
                column.filterValue["from"] = filterData.value;
            }
            else if (filterData.name.indexOf("_to") >= 0) {
                column.filterValue["to"] = filterData.value;
            }
            else {
                if (column.filtertype == config.constants.FilterTypes.MULTISELECT_AUTOCOMPLETE) {
                    column.filterValue["in"] = $.trim(filterData.value).replace(/,\s*$/, "").split(/\s*,\s*/);
                }
                else {
                    column.filterValue["value"] = filterData.value;
                }
            }
        });
    }

    function _resetFilterFieldValues() {
        $.each(_ganttDataColumnStore.columns, function (index, column) {
            Object.getOwnPropertyNames(column.filterValue).forEach(function (prop) {
                delete column.filterValue[prop];
            });
        });

        _ganttDataColumnStore.filteredFields.length = 0; // clear record of filtered fields
    }

    function _clearFilterPanel() {
        _loadFilterFieldValueDefaults();
    }

    function _setDOMElementValue(element, value) {
        value = (value == undefined || value == null ? "" : value);
        switch (element.type) {
            case "text":
            case "textarea":
            case "select-one":
            case "select-multiple":
                $(element).val(value);
                break;
            case "checkbox":
                element.checked = (value == "true");
                break;
            case "radio":
                element.checked = (element.value == value);
                break;
        }
    }

    function _cancelFilterPanel() {
        _filterPopupDialog.dialog("close");
    }

    function _renderFilterFields() {
        if (!_isFilterFieldsReady) {
            $.each(_ganttDataColumnStore.columns, function (columnIndex, column) {
                var fieldDefinition = _getFilterFieldDefinition(column);
                fieldDefinition = _loadFilterFieldValueList(fieldDefinition, column) || fieldDefinition;
                $(_filterPopupPanel).find("table > tbody > tr")
                    .eq(columnIndex)
                    .after(fieldDefinition);
            });

            _isFilterFieldsReady = true;

            _loadFilterFieldValueDefaults();
        }

        _attachFilterFieldPlugins();
    }

    function _loadFilterFieldValueList(fieldDefinition, column) {
        var $fieldDOM = $(fieldDefinition);
        switch (column.filtertype) {
            case config.constants.FilterTypes.DROPDOWN:
                $.each(column.filterValueList, function (value, text) {
                    $fieldDOM.find("select").append($("<option>", { value: value, text: text }));
                });
                break;
            case config.constants.FilterTypes.RADIOGROUP:
                $.each(column.filterValueList, function (value, text) {
                    var name = $fieldDOM.find("span").attr("name");
                    var radioTemplate = "<label><input type='radio' name={name} value={value} />{text}</label>";
                    $fieldDOM.find("span").append(radioTemplate.replace("{name}", name).replace("{value}", value).replace("{text}", text));
                });
                break;
            default:
                break;
        }
        return $fieldDOM[0].outerHTML;
    }

    var _PopulateModes = {
        LOAD_INITIAL: "LOAD_INITIAL", // defaults specified in config.plan > fields.filterValueInitial will be loaded into the filter pane
        LOAD_CURRENT: "LOAD_CURRENT"  // current filter values will be loaded into the filter pane to overwrite any edits upon cancellation
    };

    function _populateFilterFieldValues(populateMode) {
        if (_isFilterFieldsReady) {
            $(_filterPopupPanel).find(":input").each(function () {
                var columnID = this.name.replace("_filter", "").replace("_from", "").replace("_to", "");
                var column = _ganttDataColumnStore.GetColumnByID(columnID);

                var filterValueSource;
                switch (populateMode) {
                    case _PopulateModes.LOAD_INITIAL:
                        filterValueSource = column.filterValueInitial;
                        break;
                    case _PopulateModes.LOAD_CURRENT:
                        filterValueSource = !$.isEmptyObject(column.filterValue) ? column.filterValue : column.filterValueInitial;
                        break;
                }

                var filterValue = filterValueSource == undefined || $.isEmptyObject(filterValueSource)
                    ? ""
                    : filterValueSource.hasOwnProperty("value")
                        ? filterValueSource.value
                        : filterValueSource.hasOwnProperty("in")
                            ? filterValueSource.in.join(", ")
                            : this.id.includes("from") && filterValueSource.hasOwnProperty("from")
                                ? filterValueSource.from
                                : this.id.includes("to") && filterValueSource.hasOwnProperty("to")
                                    ? filterValueSource.to
                                    : "";

                _setDOMElementValue(this, filterValue);
            });
        }
    }

    function _loadFilterFieldValueDefaults() {
        _populateFilterFieldValues(_PopulateModes.LOAD_INITIAL);
    }

    function _undoFilterFieldValueEdits() {
        _populateFilterFieldValues(_PopulateModes.LOAD_CURRENT);
    }

    function _attachFilterFieldPlugins() {

        // to do: move default/static plugin options to ResourceGanttFilterControl.config.js

        if (_isFilterFieldsReady) {
            $.each(_ganttDataColumnStore.columns, function (columnIndex, column) {
                $(_filterPopupPanel)
                    .find("[id^='" + column.id + "']")
                    .each(function () {
                        if (column.filtertype == config.constants.FilterTypes.DATEPICKER) {
                            $(this).datepicker({
                                showOtherMonths: true,
                                selectOtherMonths: true,
                                changeMonth: true,
                                changeYear: true,
                                dateFormat: _getDatePickerDateFormat(column.format || args.page.data.appSettings.dateFormat)
                            });
                        }
                        else if (column.filtertype == config.constants.FilterTypes.NUMERIC_SPINNER) {
                            $(this).spinner({
                                spin: function (event, ui) {
                                    if (event.originalEvent && event.originalEvent.type === 'mousewheel') {
                                        event.preventDefault();
                                    }
                                }
                            });
                        }
                        else if (column.filtertype == config.constants.FilterTypes.MULTISELECT_AUTOCOMPLETE) {
                            $(this).autocomplete({
                                minLength: 0,
                                maxResults: 6,
                                source: function (request, response) {
                                    // delegate back to autocomplete, but extract the last term
                                    var datasource = column.datasource
                                        .sort()
                                        .unique()
                                        .filter(function (e) {
                                            return e === 0 || e === false || e;
                                        }); // removes "", null, undefined, NaN // retains 0, false
                                    var results = $.ui.autocomplete.filter(datasource, (request.term.split(/,\s*/)).pop());
                                    response(results.slice(0, this.options.maxResults));
                                },
                                focus: function () {
                                    return false; // prevent value inserted on focus
                                },
                                select: function (event, ui) {
                                    var terms = this.value.split(/,\s*/);
                                    terms.pop(); // remove the current input
                                    terms.push(ui.item.value); // add the selected item
                                    terms.push(""); // add placeholder to get the comma-and-space at the end
                                    this.value = terms.join(", ");
                                    return false;
                                },
                                open: function () {
                                    $(this).autocomplete("widget").css('z-index', 99999);
                                }
                            });
                        }
                    });
            });
        }
    }

    function _getDatePickerDateFormat(dateFormat) {
        return dateFormat
            .replace("MMMM", "MM") // "August"
            .replace("MMM", "M")   // "Aug"
            .replace("MM", "mm")   // "08"
            .replace("M", "m")     // "8"
            .replace(/yy/g, "y");  // yyyy --> yy
    };

    function _getFilterFieldDefinition(column) {

        var containerTemplate = config.actions.GetFilterContainerTemplate(column.range);
        var fieldTemplate = config.actions.GetFilterFieldTemplate(column.filtertype);

        return containerTemplate
            .replace(/{column-label}/g, column.title)
            .replace(
                "{column-type}",
                fieldTemplate
                    .replace(/{id}/g, column.id + "_filter")
            )
            .replace(
                "{column-type-from}",
                fieldTemplate
                    .replace(/{id}/g, column.id + "_from_filter")
            )
            .replace(
                "{column-type-to}",
                fieldTemplate
                    .replace(/{id}/g, column.id + "_to_filter")
            );
    }

    //#endregion PRIVATE-METHODS

    // ------------------------------------------------------------------------------------------------

    //#region PUBLIC-METHODS

    return {
        "Init": _initFilter
    };

    //#endregion PUBLIC-METHODS
}

// ------------------------------------------------------------------------------------------------

// ResourceGanttFilterControl initialization block
// Trigger init on document 'ready' event trigger to ensure GanttViewPage.data is available

var ResourceGanttFilterConfiguration;
var ResourceGanttFilterControl;

$(document).ready(function () {
    // Initialize ResourceGanttFilterConfiguration
    ResourceGanttFilterConfiguration =
        GetResourceGanttFilterConfiguration({
            page: GanttViewPage.data
        });

    // Initialize ResourceGanttFilterControl
    ResourceGanttFilterControl =
        GetResourceGanttFilterControl({
            page: GanttViewPage,
            filterPopupSettings: {
                title: "Gantt Filter",
                height: "auto",
                width: "auto",
                minWidth: "350px",
                maxWidth: "450px"
            },
            config: ResourceGanttFilterConfiguration,
            configOverride: null
        });
});

// ------------------------------------------------------------------------------------------------

// ResourceGanttFilterControl execution block
// Trigger init on 'gantt_loaded' event trigger from GanttViewControl.js
$(document).on("gantt_loaded", function () {
    ResourceGanttFilterControl.Init();
});

// ------------------------------------------------------------------------------------------------

// LIBRARY: jQuery override and extension functions

(function ($) {
    var _base_serializeArray = $.fn.serializeArray;
    $.fn.serializeArray = function () {
        var a = _base_serializeArray.apply(this);
        $.each(this, function (i, e) {
            if (e.type == "checkbox") {
                e.checked ? a[i].value = "true" : a.splice(i, 0, { name: e.name, value: "false" });
            }
        });
        return a;
    };

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray(); // this is the overriden serializeArray from above
        var that = this;
        $.each(a, function (i, e) {
            // obj doesn't contain prop, add it
            if (o[e.name] === undefined) {
                o[e.name] = e.value || "";
            }
            else {
                // obj already has prop, make prop an array
                if (!o[e.name].push) {
                    o[e.name] = [o[e.name]];
                }
                // obj prop is already array, push into it
                o[e.name].push(e.value || "");
            }
        });
        return o;
    };

    $.copy = function (object) {
        return $.extend(true, {}, object);
    };

    $.fuse = function (object, extension) {
        return $.extend(true, object, extension);
    };

})(jQuery);

// LIBRARY: Custom Date functions

Date.toMidnight = function (date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

Date.compare = function (date1, date2) {
    // returns -ve if date1 < date2; 0 if date1 = date2; +ve if date1 > date2
    return (Date.toMidnight(date1).getTime() - Date.toMidnight(date2).getTime());
};

Date.fromString = function (dateString, dateFormat) {

    // Notes: 
    // dd = 04, d = 4
    // MMMM = August, MMM = Aug, MM = 08, M = 8 (M for month, m for minutes)
    // yyyy = 2018, yy = 18

    // Find the separator -- the first character in dateFormat that is not M or d or y
    var separator;
    for (var i = 0; i < dateFormat.length; i++) {
        if (dateFormat.charAt(i) != "M" && dateFormat.charAt(i) != "d" && dateFormat.charAt(i) != "y") {
            separator = dateFormat.charAt(i);
        }
    }

    // Remove multiple occurrences of M|d|y in dateFormat for use with indexOf("M|d|y")
    dateFormat = dateFormat
        .replace("dd", "d")
        .replace("MMMM", "M").replace("MMM", "M").replace("MM", "M")
        .replace("yyyy", "y").replace("yy", "y");

    var dateFormatParts = dateFormat.split(separator);
    var dateStringParts = dateString.split(separator);

    var day = dateStringParts[dateFormatParts.indexOf("d")];
    var month = dateStringParts[dateFormatParts.indexOf("M")];
    var year = dateStringParts[dateFormatParts.indexOf("y")];

    switch (month.length) {
        case 1:
        case 2:
            month = Number(month) - 1;
            break;
        case 3:
            month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(month);
            break;
        default:
            month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month);
            break;
    }

    return new Date(year, month, day);
};

// LIBRARY: String method .includes() is not available in IE; define it
// Source code from https://stackoverflow.com/a/41992707/979621
String.prototype.includes = String.prototype.includes || function (search, start) {
    if (typeof start !== 'number') {
        start = 0;
    }
    if (start + search.length > this.length) {
        return false;
    }
    else {
        return this.indexOf(search, start) !== -1;
    }
};

// LIBRARY: Array extension method to remove duplicates and return a unique array
// Source code from https://stackoverflow.com/a/9229821/979621
Array.prototype.unique = function () {
    return this.filter(function (item, pos, self) {
        return self.indexOf(item) == pos;
    });
};

//321725 - handling array includes() for IE
Array.prototype.includes = Array.prototype.includes || function (arrayObj, searchString) {
    var result = false;
    try { result = (arrayObj && arrayObj.indexOf(searchString) > -1); }
    catch (ex) { result = false; }
    return result;
}