// ------------------------------------------------------------------------------------------------

// ResourceGanttFilterControl.config.js
// Dependencies:
// Requires: GanttViewPage.data.appSettings

// ------------------------------------------------------------------------------------------------

// JS Closure IIFE to contain all ResourceGanttFilterControl functions
/// <signature>
///     <param name='args.page' type='object' description='Collection of settings stored in GanttViewPage.data' />
///     <returns type='object'/>
/// </signature>

function GetResourceGanttFilterConfiguration(args) {

    const _context = GetQueryStringParams("context");
    const _module = GetQueryStringParams("module");

    const _Formats = {
        DATE_TIME: args.page.appSettings.dateTimeFormat,
        DATE: args.page.appSettings.dateFormat,
        PRECISION: {
            AMOUNT: args.page.appSettings.precision.amount
        }
    };

    const _DataTypes = {
        BOOLEAN: "BOOLEAN",
        DATE: "DATE",
        NUMBER: "NUMBER",
        TEXT: "TEXT"
    };

    const _FilterTypes = {
        DATEPICKER: "DATEPICKER",
        DROPDOWN: "DROPDOWN",
        MULTISELECT_AUTOCOMPLETE: "MULTISELECT_AUTOCOMPLETE",
        NUMERIC_SPINNER: "NUMERIC_SPINNER",
        TEXTBOX: "TEXTBOX"
    };

    function _getDefaultFilterType(dataType) {
        var dataTypeToFilterTypeDefaultMap = {
            BOOLEAN: _FilterTypes.DROPDOWN,
            DATE: _FilterTypes.DATEPICKER,
            NUMBER: _FilterTypes.NUMERIC_SPINNER,
            TEXT: _FilterTypes.TEXTBOX
        };
        return dataTypeToFilterTypeDefaultMap[dataType];
    }

    function _getDefaultIsRange(dataType) {
        var isRange = {
            // By default, these are range datatype; 2 filter fields (FROM and TO) will be rendered
            DATE: true,
            NUMBER: true,

            // By default, these are block datatypes; only 1 filter field will be rendered
            AUTO_DETECT: false,
            BOOLEAN: false,
            TEXT: false,
        }
        return isRange[dataType];
    }

    function _getFilterPanelTemplate() {
        var template = ""
            + "<div id='ganttFilterPopupPanel'>"
            + "    <table border='0' cellpadding='0' cellspacing='5' width='100%'>"
            + "        <tr>"
            + "            <td width='10%'></td>"
            + "            <td width='5%'></td>"
            + "            <td width='40%'></td>"
            + "            <td width='5%'></td>"
            + "            <td width='40%'></td>"
            + "        </tr>"
            + "    </table>"
            + "</div>";
        return {
            template: template,
            buttons: {
                OK: "Apply Filter",
                RESET: "Clear",
                CANCEL: "Cancel"
            }
        };
    }

    function _getFilterContainerTemplate(isRange) {
        var filterContainerTemplates = {
            "range": "<tr>"
					    + "<td align='right'>{column-label}</td>"
					    + "<td align='center'>:</td>"
					    + "<td align='left'>{column-type-from}</td>"
					    + "<td align='center'>to</td>"
					    + "<td align='left'>{column-type-to}</td>"
			       + "</tr>",
            "block": "<tr>"
					    + "<td align='right'>{column-label}</td>"
					    + "<td align='center'>:</td>"
					    + "<td align='left' colspan='3'>{column-type}</td>"
			       + "</tr>"
        };

        if (isRange) {
            return filterContainerTemplates.range;
        }
        else {
            return filterContainerTemplates.block;
        }
    }

    function _getFilterFieldTemplate(filterType) {
        var filterTypeToFilterFieldTemplateMap = {
            DATEPICKER: "<input id={id} name={id} class='date' type='text' format='" + _Formats.DATE + "' style='min-height: 20px; width: 98%; background: url(../../Images/datepickerfield_888.png) no-repeat 98% center;' autocomplete='off' />",
            DROPDOWN: "<select id={id} name={id} class='dropdown' style='min-height: 20px; width: 98%;'></select>",
            MULTISELECT_AUTOCOMPLETE: "<textarea id={id} name={id} style='min-height: 60px; width: 98%;'></textarea>",
            NUMERIC_SPINNER: "<input id={id} name={id} class='numeric' type='text' style='min-height: 20px; width: 98%;' />",
            TEXTBOX: "<input id={id} name={id} class='text' type='text' style='min-height: 20px; width: 99%;' />"
        };
        return filterTypeToFilterFieldTemplateMap[filterType];
    }

    function _getDefaultFilterValueOptions(filterType) {
        var filterValueInitial;
        var filterValueList;
        switch (filterType) {
            case _FilterTypes.DROPDOWN:
                filterValueInitial = { "value": "ALL" };
                filterValueList = { "ALL": "All", "YES": "Yes", "NO": "No" };
                break;
            default:
                filterValueInitial = {};
                filterValueList = {};
                break;
        }

        return {
            filterValueInitial: filterValueInitial,
            filterValueList: filterValueList
        };
    }

    /* 

    ------------------------------------------------------------------------------------------------
    Plan Template
    ------------------------------------------------------------------------------------------------
     
     ^ = default
     ? = optional; if skipped, default for that property is assumed
     
     "<context>" : {
         ?filter: true^ | false,                                        // enable or disable all filters for this context page
         ?fields: {
             ?"<column title>": {
                 ?filter: true^ | false,                                // enable or disable filter for this column
                 ?datatype: _DataTypes.AUTO_DETECT^ | _DataTypes.*,     // column datatype override
                 ?filtertype: _FilterTypes.TEXTBOX^ | _FilterTypes.*,   // column filtertype override
                 ?range: true | false,                                  // true = from+to fields, false = single field, default is decided by filtertype
                 ?filterValueInitial: "",                               // initial filter value setting 
                                                                           -- {"value":""} for single-valued fields; 
                                                                           -- {"in":[]} for mutli-valued fields; 
                                                                           -- {"from":"","to":""} for ranged fields;
                 ?filterValueList: "",                                  // list of options to be displayed in filter -- applicable for dropdown and radiogroup
                 ?comparator: _Comparators.<function>                   // function used for custom comparison
             },
             ?"<column title>": {                                       // repeat optionally for any columns
                 ...
             },
             ...
         }
     }

     */

    var _Comparators = {

        // define custom comparators here
        // format: "<column-title>" : function (cellValueBase, cellValueFormatted, filterValue, format)
        // cellValueFormatted will contain both the html and text from the table cell: {"html":"","text",""}
        // filterValue will be {"value": ""} for single-valued fields; {"in": []} for mutli-valued fields; {"from": "","to": ""} for ranged fields;

        "Duration": function (cellValueBase, cellValueFormatted, filterValue, format) {
            var cellValue = cellValueFormatted && cellValueFormatted.text ? cellValueFormatted.text.split(" ")[0] : ""; // remove the word 'day/days'; #312209 - DG - check if object is present;
            var from = filterValue.from;
            var to = filterValue.to;
            return (from == "" || cellValue >= Number(from)) && (to == "" || cellValue <= Number(to));
        },

        "Attachments": function (cellValueBase, cellValueFormatted, filterValue, format) {
            var attachmentPresent = cellValueFormatted && cellValueFormatted.html && cellValueFormatted.html.includes("img");   //#312209 - DG - check if object is present;
            var filterHasAttachments = (filterValue.value == "YES");
            var filterNoAttachments = (filterValue.value == "NO");
            return (!filterHasAttachments && !filterNoAttachments) || (filterHasAttachments && attachmentPresent) || (filterNoAttachments && !attachmentPresent);
        }
    };

    var _Plan = {
        "ETGANTT": {
            filter: true,
            fields: {
                "Name": {
                    label: "Department(s)",
                    filter: true,
                    datatype: _DataTypes.TEXT,
                    filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                    range: false,
                    data: {
                        displayField: "Name",
                        childArrayField: "ResUsers"
                    },
                    child: {
                        label: "Person(s)",
                        filter: true,
                        datatype: _DataTypes.TEXT,
                        filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                        range: false,
                        data: {
                            displayField: "Name",
                            childArrayField: "ResTitles"
                        },
                        child: {
                            label: "Title(s)",
                            filter: true,
                            datatype: _DataTypes.TEXT,
                            filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                            range: false,
                            data: {
                                displayField: "Name",
                                childArrayField: "Tasks"
                            },
                            child: {
                                label: "Task(s)",
                                filter: true,
                                datatype: _DataTypes.TEXT,
                                filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                                range: false,
                                data: {
                                    displayField: "Name",
                                    childArrayField: null
                                },
                                child: null
                            }
                        }
                    }
                }
            }
        },
        "PRGANTT": {
            filter: true,
            fields: {
                "Name": {
                    label: "Department(s)",
                    filter: true,
                    datatype: _DataTypes.TEXT,
                    filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                    range: false,
                    data: {
                        displayField: "Name",
                        childArrayField: "ResUsers"
                    },
                    child: {
                        label: "Person(s)",
                        filter: true,
                        datatype: _DataTypes.TEXT,
                        filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                        range: false,
                        data: {
                            displayField: "Name",
                            childArrayField: "ResTitles"
                        },
                        child: {
                            label: "Title(s)",
                            filter: true,
                            datatype: _DataTypes.TEXT,
                            filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                            range: false,
                            data: {
                                displayField: "Name",
                                childArrayField: "Tasks"
                            },
                            child: {
                                label: "Project(s)",
                                filter: true,
                                datatype: _DataTypes.TEXT,
                                filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                                range: false,
                                data: {
                                    displayField: "Name",
                                    childArrayField: null
                                },
                                child: null
                            }
                        }
                    }
                }
            }
        },
        "PRGANTT|WBSTRUC": {
            filter: true,
            fields: {
                "Name": {
                    label: "Department(s)",
                    filter: true,
                    datatype: _DataTypes.TEXT,
                    filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                    range: false,
                    data: {
                        displayField: "Name",
                        childArrayField: "ResUsers"
                    },
                    child: {
                        label: "Person(s)",
                        filter: true,
                        datatype: _DataTypes.TEXT,
                        filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                        range: false,
                        data: {
                            displayField: "Name",
                            childArrayField: "ResTitles"
                        },
                        child: {
                            label: "Title(s)",
                            filter: true,
                            datatype: _DataTypes.TEXT,
                            filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                            range: false,
                            data: {
                                displayField: "Name",
                                childArrayField: "Tasks"
                            },
                            child: {
                                label: "Task(s)",
                                filter: true,
                                datatype: _DataTypes.TEXT,
                                filtertype: _FilterTypes.MULTISELECT_AUTOCOMPLETE,
                                range: false,
                                data: {
                                    displayField: "Name",
                                    childArrayField: null
                                },
                                child: null
                            }
                        }
                    }
                }
            }
        },
    };

    return {
        plan: _Plan[_module ? _context + "|" + _module : _context],
        constants: {
            DataTypes: _DataTypes,
            FilterTypes: _FilterTypes,
            Comparators: _Comparators
        },
        defaults: {
            DataType: _DataTypes.AUTO_DETECT,
            FilterType: _FilterTypes.TEXTBOX
        },
        actions: {
            "GetDefaultFilterType": function (dataType) { return _getDefaultFilterType(dataType); },
            "GetDefaultIsRange": function (dataType) { return _getDefaultIsRange(dataType); },
            "GetFilterPanelTemplate": function () { return _getFilterPanelTemplate(); },
            "GetFilterContainerTemplate": function (isRange) { return _getFilterContainerTemplate(isRange); },
            "GetFilterFieldTemplate": function (filterType) { return _getFilterFieldTemplate(filterType); },
            "GetDefaultFilterValueOptions": function (filterType) { return _getDefaultFilterValueOptions(filterType); }
        }
    };

}
