$.widget("radiantq.taskEditingDialog", {
    options: {

    },
    _create: function () {
        this.element.dialog(this.options);
    },
    open: function (taskBar) {
        this.element.dialog("open");
        this.options.taskdata = taskBar;
        this.oldValue = taskBar.options.Data.Progress;
        this.oldName = taskBar.options.Data.TaskName;
        var $editDiv = $("<div></div>");
        var $ths = $("th", taskBar);
        var $table = $("<table></table>");

        $table.append("<tr><td>Progress:</td><td><input type='number' id='progress' style='width:100px' value='" + this.oldValue + "' /></td></tr>");
        $table.append("<tr><td>TaskName:</td><td><input type='text' id='name' style='width:100px' value='" + this.oldName + "' /></td></tr>");
        var $progress = $("#progress", $table);
        var $name = $("#name", $table);
        var min = 0;
        var max = 100;
        $progress.spinner({
            min: min,
            max: max,
        }).keypress(function (event) {
            var value = this.value + event.key;
            if ((parseInt(value) > max || parseInt(value) < min) || (event.which != 8 && isNaN(String.fromCharCode(event.which)))) {
                var val = event.target;
                event.preventDefault(); //stop character from entering input
            }
        });

        $editDiv.append($table);
        this.element.css('height', 'auto');
        this.element.empty().append($editDiv);
    },
    getValues: function () {
        var options = {};
        options.TaskItem = this.options.taskdata;
        options.TaskData = this.options.taskdata.options.Data;
        var value = $("#progress", this.element).val();
        value = (value > 100 || value < 0) ? this.oldValue : value;
        var name = $("#name", this.element).val();
        name = (name==null) ? this.oldName : name;
        options.ProgressValue = value;
        options.TaskName = name;
        return options;
    },
    close: function () {
        this.element.dialog("close");
    }
});