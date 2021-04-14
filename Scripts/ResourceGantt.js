var columns = [
                   {
                       field: "Name",
                       title: "Name",
                       iseditable: false,
                       editor: RadiantQ.Default.Template.FlexyGanttExpandableTextBoxEditor("nameConverter"),
                       template: RadiantQ.Default.Template.FlexyGanttExpandableTextBlockTemplate("nameConverter")
                   }];

var self = this;
var jsonData;
var tmshs = new RadiantQ.Gantt.TimeScaleHeaderDefinitions();
tmshs.add(yearHeaderLine());
tmshs.add(monthHeaderLine());
tmshs.add(dayHeaderLine());

var baseTimeUnitWidthMinimum = 0.1;
var baseTimeUnitWidthMaximum = 50;
var baseTimeUnitWidth = 0.3;

$(document).ready(function () {
    var moduleId = GetQueryStringParams("context");
    var parentId = GetQueryStringParams("ParentID");
    var module = GetQueryStringParams("module");

    /* Filters in Gantt */
    var dept = xmlForm.getControl("FilterDepartment");
    var title = xmlForm.getControl("FilterTitle");
    var user = xmlForm.getControl("FilterUsers");
    var bttn = xmlForm.getControl("Filter");

    SetHeightAndWidth();

   
    $(bttn).on('click', function (e, v) {
        e.preventDefault();
        GetGanttData();
    })

    var filters = {};

    function GetGanttData() {
        var selectedDept = xmlForm.getControlValue("FilterDepartment");
        var selectedTitle = xmlForm.getControlValue("FilterTitle");
        var selectedUser = xmlForm.getControlValue("FilterUsers");

        filters = {
            "Dept": (selectedDept == null) ? selectedDept : selectedDept.toString(),
            "Title": (selectedTitle == null) ? selectedTitle : selectedTitle.toString(),
            "Users": (selectedUser == null) ? selectedUser : selectedUser.toString()
        };

        showHideLoading();
        $.ajax({
            type: "POST",
            dataType: 'json',
            data: JSON.stringify({ "ParentID": parseInt(GetQueryStringParams('ParentID')), "ModuleID": GetQueryStringParams("context"), "Module": GetQueryStringParams("Module"), "filterCond": filters }),
            url: '/api/ResourceGantt',
            converters: {
                "text json": function (data) {
                    return $.parseJSON(data, true, true);
                }
            },
            success: function (data) {
                if (data !== null) {
                    self.jsonData = data;
                }
                SetGanttView();
                showHideLoading('hide');
            },
            complete: function () {
                // Signal to external plugins that Gantt load has been completed
                $(document).trigger("gantt_loaded");
                showHideLoading('hide');
            }
        });

    }

    function showHideLoading(value) {
        var notify = parent.$('#notifyDiv');

        if (notify == null || notify == undefined) return;

        if (value == 'hide') {
            notify.hide();
        }
        else {
            notify.show(400);
        }
    }
   
    GetGanttData();

    function SetGanttView() {
        var $gantt_container = $("#gantt_container");
        if (typeof self.jsonData !== 'undefined' && self.jsonData.length > 0) {
            var anchorTime = new Date(self.jsonData[0].PStartTime);
            insertIsOverlappingObject(self.jsonData);

            var pTemplate = "<div class='rq-gc-parentBar'><div class='rq-gc-parentBar-leftCue'></div><div class='rq-gc-parentBar-middle'></div><div class='rq-gc-parentBar-rightCue'></div></div>";

            var tTemplate = "<div class='rq-gc-taskbar' data-bind=\"attr: { 'id': HighlightCurrProject(RQDataContext)}\" ></div>";


            viewModel = {
                Tasks: ko.mapping.fromJS(self.jsonData)
            };
            // Initialize the FlexyGantt widget.
            $gantt_container.FlexyGantt({
                DataSource: viewModel.Tasks(),
                UseVirtualization: true,
                TaskBarBrowseToCueLeftTemplate: "<button></button>",
                TaskBarBrowseToCueRightTemplate: "<button></button>",
                TimeScaleHeaders: tmshs,
                BaseTimeUnitWidthMinimum: baseTimeUnitWidthMinimum,
                BaseTimeUnitWidthMaximum: baseTimeUnitWidthMaximum,
                BaseTimeUnitWidth: baseTimeUnitWidth,
                GanttTableOptions: {
                    columns: columns
                },
                resolverFunction: function (data) {
                    if ($.isFunction(data)) {
                        data = data()[0];
                    }
                    if (data["ResUsers"] != undefined) {
                        if ($.isFunction(data["ResUsers"]))
                            return data["ResUsers"]();
                        else
                            return data["ResUsers"];
                    }
                    if (data["ResTitles"] != undefined) {
                        if ($.isFunction(data["ResTitles"]))
                            return data["ResTitles"]();
                        else
                            return data["ResTitles"];
                    }
                    return null;
                },
                OnTaskBarLoad: function () {
                    this.unbind('.taskBarClick');
                    this.bind('click.taskBarClick', function () {
                        $('.selected-bar').removeClass("selected-bar");
                        $(this).addClass("selected-bar");
                    });
                },
                KnockoutObjectName: "viewModel",
                GanttChartTemplateApplied: function (sender) {
                    var $GanttChart = $gantt_container.data("FlexyGantt").GetGanttChart();
                    $GanttChart.GanttChart({ AnchorTime: anchorTime });
                },
                TaskBarBrowseToCueLeftTemplate: "<button></button>",
                TaskBarBrowseToCueRightTemplate: "<button></button>",
                TimeScaleHeaders: tmshs,
                BaseTimeUnitWidthMinimum: baseTimeUnitWidthMinimum,
                BaseTimeUnitWidthMaximum: baseTimeUnitWidthMaximum,
                BaseTimeUnitWidth: baseTimeUnitWidth,
                TaskStartTimeProperty: "StartTime",
                ParentTaskStartTimeProperty: "PStartTime",
                TaskItemTemplate: tTemplate,
                //ParentTaskItemTemplate: pTemplate, // this is for the black horizontal summary block on parent table
                TaskEndTimeProperty: "EndTime",
                ParentTaskEndTimeProperty: "PEndTime",
                TasksListProperty: "Tasks",
                OverlappedTasksRenderingOptimization: RadiantQ.FlexyGantt.OverlappedTasksRenderingOptimization.ShrinkHeight,
                TaskTooltipTemplate: $('#TaskTooltipTemplate').html(),
                KnockoutObjectName: "viewModel",
                RoundTimeEditsTo: RadiantQ.Gantt.RoundToOptions.Day
            });
        }
        else {
            alert("No resources mapped. Kindly map resource to form the Gantt Chart.");
            localStorage.resetTime  = $.now(); // reset the local storage time . this is used to calculate session timeout. this is needed here to accomodate the javascript pause due to the alert.
            viewModel = {
                Tasks: ko.mapping.fromJS(self.jsonData)
            };

            $gantt_container.FlexyGantt({
                TaskBarBrowseToCueLeftTemplate: "<button></button>",
                TaskBarBrowseToCueRightTemplate: "<button></button>",
                TimeScaleHeaders: tmshs,
                BaseTimeUnitWidthMinimum: baseTimeUnitWidthMinimum,
                BaseTimeUnitWidthMaximum: baseTimeUnitWidthMaximum,
                BaseTimeUnitWidth: baseTimeUnitWidth,
                GanttTableOptions: {
                    DataSource: viewModel.Tasks(),
                    columns: columns
                },
            });
        }
        ko.applyBindings(viewModel);


    }

});


function SetHeightAndWidth() {
    var width = $("#C1_PageMainDiv").width();
    $("#pagecontent1").width(width);
    var height = $("#coreMainControlDiv").height();
    $("#pagecontent1").height(height);
}


function nameConverter(flexyNodeData) {
    var data;
    if (flexyNodeData)
        data = flexyNodeData.Data();
    else
        data = this.data;
    if (typeof data == 'undefined')
        return;

    if (data.hasOwnProperty("Name")) {
        if (data.hasOwnProperty("isOverAllocated")) {
            if (data["isOverAllocated"]() == true)
                return '<font color="red"><b>' + data["Name"]() + '</b></font>'
            else
                return data["Name"]();
        }
        return data["Name"]();
    }
    else if (data.hasOwnProperty("FirstName")) {
        if (data.hasOwnProperty("isOverAllocated")) {
            if (data["isOverAllocated"]() == true)
                return '<font color="red"><b>' + data["FirstName"]() + '</b></font>'
            else
                return data["FirstName"]();
        }
        return data["FirstName"]();
    }
    //else if (data["TaskName"])
    //    return data["TaskName"]();
    return;
}

var toolTipDateformat = Date.CultureInfo.formatPatterns.shortDate; //+ '  ' + "HH:mm:ss";
function startTimeTooltipConverter(nodeData) {
    if (typeof nodeData == 'undefined')
        return;
    else if (nodeData.hasOwnProperty("StartTime"))
        return (typeof nodeData["StartTime"] == 'function') ? nodeData["StartTime"]().toString(toolTipDateformat) : nodeData["StartTime"].toString(toolTipDateformat);
    return null;
}

function endTimeTooltipConverter(nodeData) {
    if (typeof nodeData == 'undefined')
        return;
    else if (nodeData.hasOwnProperty("EndTime"))
        return (typeof nodeData["EndTime"] == 'function') ? nodeData["EndTime"]().toString(toolTipDateformat) : nodeData["EndTime"].toString(toolTipDateformat);
    return null;
}
function nameTooltipConverter(data) {
    if (typeof data == 'undefined')
        return;
    if (data.hasOwnProperty("Name"))
        return (typeof data["Name"] == 'function') ? JavascriptEncode(data["Name"]()) : JavascriptEncode(data["Name"]);
    else if (data.hasOwnProperty("FirstName"))
        return (typeof data["FirstName"] == 'function') ? data["FirstName"]() : data["FirstName"];
    else if (data.hasOwnProperty("Tasks"))
        return (typeof data["Tasks"] == 'function') ? data["Tasks"]() : data["Tasks"];
    return;
}
function titleTooltipConverter(data) {
    if (typeof data == 'undefined')
        return;
    if (data.hasOwnProperty("ResourceTitle"))
        return (typeof data["ResourceTitle"] == 'function') ? JavascriptEncode(data["ResourceTitle"]()) : JavascriptEncode(data["ResourceTitle"]);
}
function utilizationPercentageTooltipConverter(nodeData) {
    if (nodeData && nodeData.hasOwnProperty("UtilizationPercentage")) {
        var utilizationPercentage = nodeData["UtilizationPercentage"];
        if (typeof utilizationPercentage == 'function') {
            utilizationPercentage = utilizationPercentage();
        }
        return utilizationPercentage && (utilizationPercentage + "").length > 0
		       ? utilizationPercentage.toFixed(2) + "%"
		       : "N/A";
    }
    return "N/A";
}

function insertIsOverlappingObject(jsonData) {
    for (var tIndex = 0; tIndex < jsonData.length; tIndex++) {
        var resources = jsonData[tIndex].ResUsers;
        if (resources) {
            for (var rIndex = 0; rIndex < resources.length; rIndex++) {
                titles = resources[rIndex].ResTitles;
                if (titles) {
                    for (var index = 0; index < titles.length; index++) {
                        //titles[index]["IsOverlapping"] = null;
                        tasks = resources[rIndex].Tasks;
                        if (tasks) {
                            for (var index = 0; index < tasks.length; index++) {
                                tasks[index]["IsOverlapping"] = null;
                            }
                        }
                    }
                }
            }
        }
    }
}

function HighlightCurrProject(data) {
    if (data.isOverAllocated() == true)
        return 'redbar_style';

    var context = GetQueryStringParams("context");
    var parentId = GetQueryStringParams("parentid");

    if (typeof context == 'string') {
        if (context == 'PRGANTT') {
            if (typeof parentId == 'string' && data.ID() == parentId) {
                return 'greenbar_style';
            }

            return 'bluebar_style';
        }
    }

    return 'bluebar_style';
}

function getCaption() {
    var _context = GetQueryStringParams("context");
    var _module = GetQueryStringParams("module");
    var _captionDictionary = {
        "PRGANTT"         : "Project Name",
        "PRGANTT|WBSTRUC" : "Task Name",
        "default"         : "Task Name"
    };
    var _caption = _captionDictionary[_module ? _context + "|" + _module : _context];
    return _caption ? _caption : _captionDictionary["default"];
}

function yearHeaderLine() {
    var yearHeader = new RadiantQ.Gantt.TimeScaleHeaderDefinition();
    yearHeader.Type = RadiantQ.Gantt.TimeScaleType.Years;
    return yearHeader;
}

function monthHeaderLine() {
    var monthsHeader = new RadiantQ.Gantt.TimeScaleHeaderDefinition();
    monthsHeader.TextFormat = "MMM";
    monthsHeader.Type = RadiantQ.Gantt.TimeScaleType.Months;
    return monthsHeader;
}

function dayHeaderLine() {
    var daysHeader = new RadiantQ.Gantt.TimeScaleHeaderDefinition();
    daysHeader.TextFormat = "dd";
    daysHeader.Type = RadiantQ.Gantt.TimeScaleType.Days;
    return daysHeader;
}