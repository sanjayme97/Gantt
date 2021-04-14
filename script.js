var shortDateFormat = Date.CultureInfo.formatPatterns.shortDate;
var columns = [

    {

        field: "Activity_M().ID_M()",

        title: "ID",

        iseditable: false,

        width: 25

    },

    {

        field: "Activity_M().ActivityName_M()",

        title: "Activity Name",

        width: 200,

        editor: RadiantQ.Default.Template.ProjectGanttExpandableTextboxEditor(),

        template: RadiantQ.Default.Template.ProjectGanttExpandableTextBlockTemplate()

    },

    {

        field: "Activity_M().StartTime_M()",

        title: "StartTime",

        width: 150,

        format: "MM/dd/yy",

        editor: "<input data-bind='ActivityTimeBinder:Activity_M().StartTime_M' />"

    },

    {

        field: "Activity_M().EndTime_M()",

        title: "EndTime",

        width: 150,

        format: "MM/dd/yy",

        cellalign: "center",

        editor: "<input data-bind='value:Activity_M().EndTime_M' data-getvalueName='getDate' data-setvaluename='setDate'  data-valueUpdate='onBlur'  data-role=\"DateTimePicker\"  />"

    },

    {

        field: "Activity_M().Effort_M()",

        title: "Duration",

        format: "" /*to call the .toString()*/,

        width: 100,
        template: "<div>${EffortToString(data)}</div>",
        editor: "<input data-bind='EffortBinder:Activity_M().Effort_M' />",

    },
    {
        field: "Activity.DataSource.ActualStartTime",
        title: "Actual Start",
        width: 90,
        format: shortDateFormat,
        editor: "<input data-bind='ActualStartDateBinder:Activity.DataSource.ActualStartTime' />",
        iseditable: true
    },
    {

        field: "Activity.PredecessorIndexString",

        title: "PredecessorIndex",

        isParentEditable: false,

        template: "<div>${data.PredecessorIndexString || '' }</div>",

        editor: "<input data-bind='value:PredecessorIndexString'/>",

        width: 150

    },
    {

        field: "Activity_M().ProgressPercent_M()",

        title: "ProgressPercent",

        width: 150,

        editor: "<input  data-bind='value:Activity_M().ProgressPercent_M' data-role=\"spinner\" data-options='{\"min\":0, \"max\": 100}' />"

    },
    {

        field: "Activity_M().Assignments_M()",

        title: "Resource",

        iseditable: false,

        template: '<div> ${ RadiantQ.Gantt.ValueConverters.ConverterUtils.GetResourcesText(data.Activity_M().Assignments_M(), false) } </div>',

        width: 100

    }

    ];
var sampleData =`[{

    "Name" : "Task 1",

    "ID" : 1,

    "StartTime" : "2021-04-07T00:00:00Z",

    "Effort" : "8:00:00",

    "Description" : "Description of Task 1"

},

{

    "Name" : "Task 2",

    "ID" : 2,

    "PredecessorIndices" : "1",

    "StartTime" : "2021-04-03T00:00:00Z",

    "Effort" : "16:00:00",

    "Description" : "Description of Task 2"

}]`;
var calendar = `{
    "ID":0,
    "Name":"24Hours by 7Days Calendar(Default)",
    "WeekStartDay":0,
    "DefaultStartTime":"08:00:00",
    "DefaultEndTime":"16:00:00",
    "Hours":"08:00:00",
    "CalendarType":0,
    "WorkingDays":[
       1,
       2,
       3,
       4,
       5,
       6,
       0
    ],
    "Holidays":[
       
    ],
    "ExceptionalWorkingDays":[
       
    ],
    "AnnuallyRecurringHolidays":[
       
    ],
    "AnnuallyRecurringWorkingDays":[
       
    ],
    "MonthWiseWorkDays":[
       
    ],
    "Culture":"en-US",
    "AmountFormat":"###,###,##0.000",
    "DateFormat":"MM/dd/yyyy",
    "DateTimeFormat":"MM/dd/yyyy HH:mm:ss",
    "PercentageFormat":"##0.00",
    "QuantityFormat":"###,###,##0.000",
    "TimeFormat":"HH:mm:ss",
    "UnitPriceFormat":"###,###,##0.0000",
    "AppName":"Masterworks",
    "ProjectStartDate":"2021-04-02T00:00:00",
    "ProjectEndDate":"2023-04-02T00:00:00",
    "TotalMonthWiseWorkDays":0,
    "Days":0,
    "BaseCalendar":"MON 08:00:00 16:00:00;TUE 08:00:00 16:00:00;WED 08:00:00 16:00:00;THU 08:00:00 16:00:00;FRI 08:00:00 16:00:00;SAT 08:00:00 16:00:00",
    "ExceptionCalendar":""
 }`;
    this.jsonData = null;

    var self = this;
    self.calendardetails = $.parseJSON(calendar, true, true)
    self.jsonData = $.parseJSON(sampleData, true, true);


    // $.holdReady(true);

    //     $.ajax({
    //            type: "GET",
    //            dataType: 'json',
    //            url: 'SampleData.json',
    //            converters:{
    //             "text json": function (data) {                            
    //             return $.parseJSON(data, true
    //             /*converts date strings to date objects*/
    //             , true
    //             /*converts ISO dates to local dates*/);
    //             }
    //            },
    //            success: function (data) {
    //            self.jsonData = data;             
    //            }
    //     });
    //     $.ajax({
    //         type: "GET",
    //         dataType: 'json',
    //         url: 'calendar.json',
    //         converters:{
    //          "text json": function (data) {                            
    //          return $.parseJSON(data, true
    //          /*converts date strings to date objects*/
    //          , true
    //          /*converts ISO dates to local dates*/);
    //          }
    //         },
    //         success: function (data) {
    //         self.calendardetails = data;
    //         $.holdReady(false);
    //         }
    //  });
     RadiantQ.Binder.ActualStartDateBinder = function ($elem, role, value, data) {
        $elem.attr('readOnly', 'true');    
        $elem.datepicker({
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            onClose: function (e) {
                var newDate = $elem.datepicker('getDate');
                    data.Activity.DataSource.ActualStartTime = newDate;
    
                    var origStartDate = data.Activity.StartTime;
                    var origEndDate = data.Activity.EndTime;
                    //shift scheduled start date to actual start date  
                    data.Activity.PreferredStartTime = newDate || data.Activity.PreferredStartTime; //to handle null
                    data.Activity.StartTime = newDate || data.Activity.StartTime; // to handle null
                    if (newDate < origStartDate) {
                        data.activity.EndTime_M(origEndDate);
                    }
            }
        });
    
        $elem.datepicker("setDate", value.getter(data));
    }       
    RadiantQ.Binder.EffortBinder = function ($elem, role, value, data) {
        var effortTime = GetCalendarEffortTime( self.calendardetails);
    
        $elem.spinner({
            min: 0,
            change: function (e) {
                var value = $(this).val();
                if (value < 0)
                    value = 1; //if duration value is negetive, set duration to 1 day
                var days = Math.floor((value * effortTime.Hours) / 24);
                var hours = parseInt((value * effortTime.Hours) % 24);
                var minutes = parseInt((((value * effortTime.Hours) % 24) % 1) * 60);
                data.Activity_M().Effort_M(new RQTimeSpan(days, hours, minutes, 0, 0));    
            }
        }).val(roundNumber((data.Activity_M().Effort_M().getTotalHours() / effortTime.Hours), 2));
    }
    function EffortToString(data) {
        var effortTime = GetCalendarEffortTime( self.calendardetails);
    
        var totalMinutes = data.Activity_M().Effort_M().getTotalMinutes();// Get duration in minutes
        var totalHours = totalMinutes / 60;// convert it to Hours
        var days = roundNumber(totalHours / effortTime.Hours, 2);
    
        if (days === 1)
            return days + " day";
    
        return days + " days";
    }
    function GetCalendarEffortTime(calendarDetails) {
        var calTimes = new CalendarTimes();
    
        if (calendarDetails != null) {
            var effortString = calendarDetails.Hours.toString();
            var effortStringArray = effortString.split(":");
    
            if (effortStringArray.length == 3) {
                calTimes.Hours = parseInt(effortStringArray[0]);
                calTimes.Minutes = parseInt(effortStringArray[1]);
                calTimes.Seconds = parseInt(effortStringArray[2]);
            }
        }
    
        return calTimes;
    }
    function CalendarTimes() {
        this.Days = 0;
        this.Hours = 0;
        this.Minutes = 0;
        this.Seconds = 0;
        this.Milliseconds = 0;
    }
    function roundNumber(num, scale) {
        if (!(("" + num).indexOf("e") >= 0)) {
            return +(Math.round(num + "e+" + scale) + "e-" + scale);
        } else {
            var arr = ("" + num).split("e");
            var sig = ""
            if (+arr[1] + scale > 0) {
                sig = "+";
            }
            return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
        }
    }


$(document).ready(function () {

               var anchorTime = new Date(2014, 01, 02, 00, 00, 00);

               var $gantt_container = $("#gantt_container");
               var baseCalendar = new RadiantQ.Gantt.Calendar( /*Calendar Name */ "24X7 Calendar",
               /*Calendar Definition string*/
               self.calendardetails.BaseCalendar);
               var expCalendar = new RadiantQ.Gantt.CalendarWithExceptions(/* base Calendar */baseCalendar,
                /*Calendar with Exceptions Definition string*/
                self.calendardetails.ExceptionCalendar);
        
            var workTimeSchedule = RadiantQ.Gantt.CalendarWithExceptions.CreateWorkTimeSchedule(expCalendar); 
            RadiantQ.Gantt.WorkTimeSchedule.SearchBreakTimeSpan = new RQTimeSpan(365 * 10, 0, 0, 0, 0);
       
               $gantt_container.GanttControl({

              ProjectStartDate: anchorTime,

              DataSource: self.jsonData,

                     GanttTableOptions:{

                             columns:columns

                     },
                     OnTaskBarLoad: function (sender) {
                        // To update the tasks based on initial load by "ActualStartDate" property.
                        var asd = sender.Activity.DataSource.ActualStartTime;
                        if (asd && sender.Activity.StartTime.isGreaterThan(asd)) {
                            sender.Activity.StartTime = asd.clone();
                        }
                    },
                     IDBinding: new RadiantQ.BindingOptions("ID"),

                     NameBinding: new RadiantQ.BindingOptions("Name"),

                     IndentLevelBinding: new RadiantQ.BindingOptions("IndentLevel"),

                     StartTimeBinding: new RadiantQ.BindingOptions("StartTime"),

                     EffortBinding: new RadiantQ.BindingOptions("Effort"),

                     PredecessorIndicesBinding: new RadiantQ.BindingOptions("PredecessorIndices"),

                     ProgressPercentBinding: new RadiantQ.BindingOptions("ProgressPercent"),
                     StartTimeBinding: new RadiantQ.BindingOptions("StartTime"),
                     DescriptionBinding: new RadiantQ.BindingOptions("Description"),
                     WorkTimeSchedule: workTimeSchedule,
              GanttChartTemplateApplied: function (sender , args) {

                       var $GanttChart = args.element;

                       $GanttChart.GanttChart({ AnchorTime: anchorTime });

                     }

               });
               var ganttControl = $gantt_container.data("GanttControl") || $gantt_container.data("radiantqGanttControl");
               ganttControl.Model.BeforeStartTimeChanging.subscribe(dummytest);
               function dummytest(sender, args) {
                if (args.Activity.DataSource.ActualStartTime && args.NewStartTime.isGreaterThan(args.Activity.DataSource.ActualStartTime))
                    args.NewStartTime = args.Activity.DataSource.ActualStartTime.clone();
            
            }            
});
        