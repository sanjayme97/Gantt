/// <reference path="../Src/Scripts/jquery-1.11.2.min.js" />
/// <reference path="../Src/Scripts/jquery-ui-1.11.4/jquery-ui.min.js" />

(function ($) {
    function initRQFontSelector(ganttControl, table, activityView, updateDataSource) {
        var _self = this;
        var defaultColorPalateStyles = [];
        var row = ganttControl.GetGanttTable().GetRowFromData(activityView);

        function FontSelector() {
            this.FontFamily = null;
            this.FontSize = null;
            this.FontColor = null;
            this.RowHeight = null;
            this.RowBGColor = null;
        }
        var fs = new FontSelector();

        var initialFontType = row.find("td").css("font-family"),
            initialFontSize = row.find("td").css("font-size"),
            initialRowHeight = row.css("height"),
            initialFontColor = row.find("td").css("color"),
            initialbackgroundColor = row.find("td").css("background-color");

        var $dialogBox = $('<div id="dialog" class="dialog" title="Custom Settings" style="display: none;">' +
            '<div id="customizationCont">' +
            '<label><b>Font Customization</b></label> ' +
            '<table id="fontTabl" style="margin-top:10px;"><tr><td><div id="fontSelect" class="fontSelect"><div class="arrow-down"></div></div></td> ' +
            '<td><input id="fontSizer" class="fontSizer" value="' + parseInt(initialFontSize) + '" type="number" /></td> ' +
            '<td><input id="fontColorChooser" readonly class="fontColorChooser" style="background-color:' + initialFontColor + ';"/></td></tr> ' +
            ' </table><br />' +
            '<label><b>Row Customization</b></label>' +
            '<table id="rowTabl" style="margin-top:10px;"><tr><td><label class="rowOpt">Height</label><input id="rowHeight" class="rowHeight" type="number" value="' + parseInt(initialRowHeight) + '"></td>' +
            '<td> <label class="rowOpt">Color</label><input id="rowBgColorChooser" readonly class="rowBgColorChooser" style="background-color:' + initialbackgroundColor + ';"/></td></tr></table>' +
            '</div></div>');

        $(document.body).append($dialogBox);
        var $dialogContainer = $("#dialog"),
        currFontSize,
        isApplyAll = false,
        beforeApplyAll = [],
        activityView = ganttControl.SelectedItem_M(),
        rowColorPalatte = null,
        fontColorPalatte = null;

        $dialogContainer.dialog({
            autoOpen: true,
            beforeClose: function () {
                cancelFunc();
            },
            "open": function () {
                $("#fontSelect").fontSelector({
                    "initial": initialFontType,
                    "selected": function (value) {
                        fs.FontFamily = value;
                        updateFontStyle(activityView, fs.FontFamily);
                    }
                });
            },
            buttons: {
                Apply: function () {
                    ganttControl.RefreshRow(activityView);
                    $dialogContainer.remove();
                },
                Cancel: function () {
                    cancelFunc();
                }
            }
        });


        $("#rowBgColorChooser").on("click", function () {

            var offset = $("#rowBgColorChooser").offset();
            rowColorPalatte = $("td", row).add("td", activityView.$chartRow).RQColorPalette({
                applyAllSelector: "tr.rq-grid-row td",
                pos: { x: offset.left, y: offset.top },

                onapply: function (selectedColorStr, applyAs) {
                    fs.RowBGColor = selectedColorStr;
                    var dataUid = null;
                    this.each(function (index, elem) {
                        defaultStyle = $(elem).attr("style");
                        defaultColorPalateStyles.push(defaultStyle);
                        $(elem).attr("style", defaultStyle + "" + applyAs + ":" + selectedColorStr + ";");
                        var currDataUid = $(elem).parents("tr").data("uid");
                        if (dataUid == null || dataUid != currDataUid)
                            updateDataSource.call(elem, fs.AllBGColor, "RowBGColor", fs.RowBGColor);
                        dataUid = currDataUid;
                    });
                    $("#rowBgColorChooser").css("background-color", selectedColorStr);
                    return true;
                },
                onapplyAll: function (selectedColorStr, $taskbars, applyAs) {
                    fs.AllBGColor = true;
                    fs.RowBGColor = selectedColorStr;
                    var dataUid = null;
                    this.each(function (index, elem) {
                        defaultStyle = $(elem).attr("style");
                        defaultColorPalateStyles.push(defaultStyle);
                        $(elem).attr("style", defaultStyle + "" + applyAs + ":" + selectedColorStr + ";");
                        var currDataUid = $(elem).parents("tr").data("uid");
                        if (dataUid == null || dataUid != currDataUid)
                            updateDataSource.call(elem, fs.AllBGColor, "RowBGColor", fs.RowBGColor);
                        dataUid = currDataUid;
                    });
                    $("#rowBgColorChooser").css("background-color", selectedColorStr);
                    return true;
                },
                ondefault: function ($element, $boundElemClone, applyAs) {
                    var $elem = $(this);
                    fs.RowBGColor = $boundElemClone.css(applyAs);
                    var $tr = null;
                    var dataUid = null;
                    $element.each(function (index, elem) {
                        $(elem).css(applyAs, $boundElemClone.eq(index).css(applyAs));
                        var currDataUid = $(elem).parents("tr").data("uid");
                        if (dataUid == null || dataUid != currDataUid)
                            updateDataSource.call(elem, fs.AllBGColor, "RowBGColor", fs.RowBGColor);
                        dataUid = currDataUid;
                    });
                    $("#rowBgColorChooser").css("background-color", fs.RowBGColor);
                }
            });
        });

        $("#fontColorChooser").on("click", function () {
            var offset = $("#fontColorChooser").offset();
            var defaultStyle, prop;
            fontColorPalatte = $("td", row).add("td", activityView.$chartRow).RQColorPalette({
                applyAs: "color",
                applyAllSelector: "tr.rq-grid-row td",
                pos: { x: offset.left, y: offset.top },
                onapply: function (selectedColorStr, applyAs) {
                    fs.FontColor = selectedColorStr;
                    var dataUid = null;
                    this.each(function (index, elem) {
                        defaultStyle = $(elem).attr("style");
                        defaultColorPalateStyles.push(defaultStyle);
                        $(elem).attr("style", defaultStyle + "" + applyAs + ":" + selectedColorStr + ";");
                        var currDataUid = $(elem).parents("tr").data("uid");
                        if (dataUid == null || dataUid != currDataUid)
                            updateDataSource.call(elem, fs.AllFontColor, "FontColor", fs.FontColor);
                        dataUid = currDataUid;
                    });
                    $("#fontColorChooser").css("background-color", selectedColorStr);
                    return true;
                },
                onapplyAll: function (selectedColorStr, $taskbars, applyAs) {
                    fs.AllFontColor = true;
                    fs.FontColor = selectedColorStr;
                    var dataUid = null;
                    this.each(function (index, elem) {
                        defaultStyle = $(elem).attr("style");
                        defaultColorPalateStyles.push(defaultStyle);
                        $(elem).attr("style", defaultStyle + "" + applyAs + ":" + selectedColorStr + ";");
                        var currDataUid = $(elem).parents("tr").data("uid");
                        if (dataUid == null || dataUid != currDataUid)
                            updateDataSource.call(elem, fs.AllFontColor, "FontColor", fs.FontColor, currDataUid);
                        dataUid = currDataUid;
                    });
                    $("#fontColorChooser").css("background-color", selectedColorStr);
                    return true;
                },
                ondefault: function ($element, $boundElemClone, applyAs) {
                    var $elem = $(this);
                    fs.FontColor = $boundElemClone.css(applyAs);
                    var $tr = null;
                    var dataUid = null;
                    $element.each(function (index, elem) {
                        $(elem).css(applyAs, $boundElemClone.eq(index).css(applyAs));
                        var currDataUid = $(elem).parents("tr").data("uid");
                        if (dataUid == null || dataUid != currDataUid)
                            updateDataSource.call(elem, fs.AllFontColor, "FontColor", fs.FontColor, currDataUid);
                        dataUid = currDataUid;
                    });
                    $("#fontColorChooser").css("background-color", fs.FontColor);
                }
            });
        });

        // Font Size handler
        var $fontsize = $("#fontSizer", $dialogContainer);
        var fontsizeLimit = parseInt(ganttControl.GetGanttTable().GetRowFromData(activityView).css("height")) - 7;
        var min = 8;
        var max = fontsizeLimit;
        $fontsize.spinner({
            min: min,
            max: max,
            change: function (event, ui) {
                currFontSize = parseInt(this.value);
                updateFontStyle(activityView, null, currFontSize);
            }
        }).keypress(function (event) {
            var value = this.value + event.key;
            if ((parseInt(value) > max || parseInt(value) < min) || (event.which != 8 && isNaN(String.fromCharCode(event.which)))) {
                var val = event.target;
                event.preventDefault();
            }
        });

        // Row Height Handler
        var $rowheight = $("#rowHeight", $dialogContainer);
        var min = 25;
        var max = 100;
        $rowheight.spinner({
            min: min,
            max: max,
            change: function (event, ui) {
                fs.RowHeight = parseInt(this.value);
                var ds = activityView.Activity.DataSource;
                if (!ds.RowInfo)
                    ds.RowInfo = {};
                ds.RowInfo["height"] = fs.RowHeight;
            }
        }).keypress(function (event) {
            var value = this.value + event.key;
            if ((parseInt(value) > max || parseInt(value) < min) || (event.which != 8 && isNaN(String.fromCharCode(event.which)))) {
                var val = event.target;
                event.preventDefault();
            }
        });

        function updateFontStyle(activityView, fontFamily, fontSize, rowHeight) {
            if (activityView != undefined && (fontFamily || fontSize || rowHeight)) {
                var ds = activityView.Activity.DataSource;
                var row = table.GetRowFromData(activityView);
                row.find("td").css({
                    "font-family": fontFamily,
                    "font-size": fontSize
                });

                if (!ds.RowInfo){
                    ds.RowInfo = {};
                }

                if (fontFamily) {
                    ds.RowInfo["font-family"] = fontFamily;
                }
                else if (fontSize) {
                    ds.RowInfo["font-size"] = fontSize;
                }
                else {
                    ds.RowInfo["height"] = rowHeight;
                }
            }
        }

        function cancelFunc() {
            if (rowColorPalatte != null)
                rowColorPalatte.RevertToDefault();
            if (fontColorPalatte != null)
                fontColorPalatte.RevertToDefault();

            if (fs.FontFamily != null)
                updateFontStyle(activityView, initialFontType);
            if (fs.FontSize == null)
                updateFontStyle(activityView, null, initialFontSize);
            if (fs.RowHeight != null)
                updateFontStyle(activityView, null, null, initialRowHeight);

            $dialogContainer.remove();
        }

    }
    $.fn.initRQFontSelector = initRQFontSelector;
})(jQuery);