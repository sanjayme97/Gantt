/// <reference path="../Src/Scripts/jquery-1.11.2.min.js" />
/// <reference path="../Src/Scripts/jquery-ui-1.11.2/jquery-ui.min.js" />

$.widget("radiantq.ganttPrintDialog", {
    options: {

    },
    _create: function () {
        this.element.dialog(this.options);
        var dialog = this.element.data("uiDialog");
        dialog.uiDialogTitlebarClose.click(function (event) {
            $(window).unbind("resize.printDialog", this._adjustTheOverlay);
        });
    },
    open: function (ganttWidget) {
        var self = this;
        this.hiddenColumnIndices = [];
        this.element.dialog("open");
        var $contDiv = $("<div></div>");
        var $ths = $('th', ganttWidget.GetGanttTable().uiGridHead);
        $contDiv.append("<div>Header/Title of page:&nbsp;<input id='customTitle' type='text' value='" + document.title + "' /></div><br />");

        var $options = $("<div><b>Select the column headers to print:</b><br/></div>")
        $ths.each(function (key, val) {
            if (val.style.display == '')
                var $opt = $('<input type="checkbox" class="headCol" value="' + key + '" checked="checked"/><span> ' + $(val).text() + '</span><br />');
            else {
                self.hiddenColumnIndices.push(key);
                var $opt = $('<input type="checkbox" class="headCol" value="' + key + '"/><span> ' + $(val).text() + '</span><br />');
            }
            $options.append($opt);
        });
        $contDiv.append($options);

        var $viewStartPicker = $('<input type="text" id="viewStartPicker" />');
        var $viewEndPicker = $('<input type="text" id="viewEndPicker" />');
        var $datePicks = $("<br/><div><span>View StartTime <sub> (optional)</sub>&nbsp;: </span></div>");

        // To reset the buttons from previous state.
        var $dialogButton = $(".ui-dialog-buttonpane button", this.element.parents(".ui-dialog.ui-widget"));
        $dialogButton.removeAttr("disabled");
        var startDate;
        var endDate;

        $viewStartPicker.datepicker().change(function () {
            if (this.value == "") {
                startDate = undefined;
                $dialogButton.removeAttr("disabled");
                return;
            }

            startDate = Date.parse(this.value);

            var isValid = isValidRange(startDate, endDate);
            // isValidRange returns null when startDate/endDate is Invaild/null and disabling the buttons.
            if (isValid == null) {
                if (startDate == null)
                    alert("The given Start Date is not a Valid Date");
                else
                    alert("The given End Date is not a Valid Date");
                $dialogButton.attr("disabled", "disabled");
            }
            else if (isValid == false && endDate) {
                // isValidRange returns false when startDate is greater than endDate and to check endDate is vaild date.
                $dialogButton.attr("disabled", "disabled");
                alert("The Start Date should not be greater than End Date");
            }
            else
                $dialogButton.removeAttr("disabled");
        });

        $viewEndPicker.datepicker().change(function () {
            if (this.value == "") {
                endDate = undefined;
                $dialogButton.removeAttr("disabled");
                return;
            }

            endDate = Date.parse(this.value);

            var isValid = isValidRange(startDate, endDate);
            // isValidRange returns null when startDate/endDate is Invaild/null and disabling the buttons.
            if (isValid == null) {
                if (endDate == null)
                    alert("The given End Date is not a Valid Date");
                else
                    alert("The given Start Date is not a Valid Date");
                $dialogButton.attr("disabled", "disabled");
            }
            else if (isValid == false && startDate) {
                // isValidRange returns false when startDate is greater than endDate and to check startDate is vaild date.
                $dialogButton.attr("disabled", "disabled");
                alert("End Date should not be less than Start Date");
            }
            else
                $dialogButton.removeAttr("disabled");
        });

        // Function to validate the startDate and endDate.
        // Args - 
        //      startDate - startDate value 
        //      endDate -  endDate value 
        // Returns
        //      null - When start/end is invalid/null.
        //      false - When startDate is greater then endDate.
        //      true - default value.
        function isValidRange(startDate, endDate) {
            // The date become "Invalid Date" when using new Date() and "null" when using Date.parse() for invalid strings.
            if (startDate == "Invalid Date" || endDate == "Invalid Date" || 
                startDate === null || endDate === null ||
                (startDate && startDate instanceof Date == false) || (endDate && endDate instanceof Date == false))
                return null;
            // To check whether startDate is greater than endDate.
            if (!startDate|| !endDate || startDate > endDate)
                return false;

            return true;
        }

        $datePicks.append($viewStartPicker);
        $datePicks.append("<br/><span> View EndTime <sub> (optional)</sub>&nbsp;:&nbsp;&nbsp;</span>");
        $datePicks.append($viewEndPicker);

        $contDiv.append($datePicks);
        this.element.empty().append($contDiv);
        this._adjustTheOverlay();

        $(window).bind("resize.printDialog", this._adjustTheOverlay);
    },
    getSelectedOptions: function () {
        var options = new RadiantQ.Gantt.PrintOptions();
        options.HiddenColumnIndices = this.hiddenColumnIndices;
        options.Title = $("#customTitle", this.element).val();
        var $select = $("input.headCol:checked", this.element);
        if ($select.length != 0) {
            options.VisibleColumnIndices = [];
            for (var i = 0; i < $select.length; i++) {
                options.VisibleColumnIndices.push($select[i].value);
            }
        }
        else
            options.IsGridVisible = false;

        options.ViewStartTime = $("#viewStartPicker", this.element).datepicker("getDate");
        options.ViewEndTime = $("#viewEndPicker", this.element).datepicker("getDate");
        return options;
    },
    _adjustTheOverlay: function () {
        var docBody = document.body;
        $(".ui-widget-overlay").css({ 'height': docBody.scrollHeight || docBody.clientHeight, 'width': docBody.scrollWidth || docBody.clientWidth, "z-index": 3 });
    },
    close: function () {
        $(window).unbind("resize.printDialog", this._adjustTheOverlay);
        this.element.dialog("close");
    }
});