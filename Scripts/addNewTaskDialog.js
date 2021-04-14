
(function () {
    function addNewTaskDialog(ganttControl, callBackFn) {
        // Initialize the tab with newtask elements.
        var $dialog = $('<form id="dialog" title="Creating NewTask DialogBox" style="display: none;">' +
         '<table cellspacing="10" cellpadding="5" style="margin: 0px auto; font-family: Verdana; font-size: 13px;">' +
         '<tr><td style="text-align: right; font-weight: bolder"><label>ActivityName:</label></td><td><div class="editor" style="height: 100%; width: 100%"><input id="name" value="New Task"></div></td></tr>' +
         '<tr><td style="text-align: right; font-weight: bolder"><label>StartTime:</label></td><td><div class="editor" style="height: 100%; width: 100%"><input class="datetimepicker" value="02-02-2014" id="StartTime" style="margin: 0px; width: 46%;"></div></td></tr>' +
         '<tr><td style="text-align: right; font-weight: bolder"><label>Effort:</label></td><td> <div class="editor" style="height: 100%; width: 100%"><input id="Effort" value="00:00:00" /></div></td></tr>' +
         '<tr><td style="text-align: right; font-weight: bolder"><label>ProgressPercent:</label></td><td><div class="editor" style="height: 100%; width: 100%"> <input id="progress" value=""></div></td></tr>' +
         '<tr><td style="text-align: right; font-weight: bolder"><label>Resource:</label></td><td><div class="editor" style="height: 100%; width: 100%"><input id="resource"></div></td></tr>' +
         '<tr><td style="text-align: right; font-weight: bolder"><label>PredecessorIndex:</label></td><td><div class="editor" style="height: 100%; width: 100%"><input id="PredecessorIndex" value=""></div></td></tr>' +
         '</table ></form>');
        $(document.body).append($dialog);

        // Using button click to show the adding newtask window.
        addNewTask(ganttControl, $dialog, callBackFn);
    }

    function addNewTask(ganttControl, $dialog, callBackFn) {
        var selectedDate = $("#StartTime", $dialog).DateTimePicker();
        var effortPicker = $("#Effort", $dialog).DurationPicker();
        var resourceItem = $("#resource", $dialog).ResourcePicker({
            source: ganttControl.Model.GanttResources,
        });
        var min = 0;
        var max = 100;
        $("#progress", $dialog).spinner({
            min: min,
            max: max,
        });
        $dialog.dialog({
            height: 410,
            width: 440,
            modal: true,
            buttons: {
                "NewTask": function () {
                    var newTask = getNewRowTask();
                    if (callBackFn && typeof callBackFn == "function")
                        callBackFn(newTask);
                    $(this).dialog("close");
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                $(this).trigger("reset");
            }
        });

        // to return a new task object.
        function getNewRowTask() {
            var newTask = $("#name", $dialog).val();
            var progressPercent = $("#progress", $dialog).val();
            var predecessorIndices = $("#PredecessorIndex", $dialog).val();
            var startdate = selectedDate.DateTimePicker("getDate");
            var effort = effortPicker.val();
            var selectedResources = resourceItem.data().ResourcePicker.selectedItems;
            var resourcesStr = "";
            for (var i = 0; i < selectedResources.length; i++) {
                resourcesStr += selectedResources[i].DataSource.ResourceID + ",";
            }
            resourcesStr = resourcesStr.trimEnd(",");
            return {
                "ID": ganttControl.Model.GetNewID(),
                "Name": newTask,
                "ProgressPercent": progressPercent,
                "PredecessorIndices": predecessorIndices,
                "StartTime": startdate,
                "Effort": effort,
                "Resources": resourcesStr,
            };
        }
    }
    window.addNewTaskDialog = addNewTaskDialog;
})(jQuery);