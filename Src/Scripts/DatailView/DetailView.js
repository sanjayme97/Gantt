/// <reference path="../Src/Scripts/jquery-1.9.1.min.js" />
/// <reference path="../Src/Scripts/jquery-ui-1.10.3/jquery-ui.min.js" />

// Look & Functionalities implemented based on https://dl.dropboxusercontent.com/u/3406366/gantt-chart.swf
var isExpanded = false;
function showDetailedView(ActivityView, gridContentTmpl, chartContentTmpl, ganttControl) {
    if (isExpanded) {
        closeActions();
        isExpanded = false;
    }
    else {
        var $tableRow = ganttControl.GetGanttTable().GetRowFromData(ActivityView);
        ganttControl._setOption('IsReadOnly', true);
        var columns = ganttControl.grid.options.columns;
        readOnlyGrid(true);
        var $chartRow = ActivityView.ChartRow();
        var activity = ActivityView.Activity;
        var $uiGridBody = $tableRow.parents(".ui-grid-body");
        var $uiGridBodyTable = $(".ui-grid-body-table", $uiGridBody);
        var scrollLeft = $uiGridBody.scrollLeft();
        var $uiGridPanel = $uiGridBody.parents(".ui-gridpanel");
        var GanttChart = ganttControl.GetGanttChartInstance();
        var $ganttChart = GanttChart.element;
        var $ganttChartTable = $(".rq-gc-rowsParent-table", $ganttChart);
        var $chartRowsContainer = $(".rq-gc-rowsParent", $ganttChart);
        var hasVertScrollbar = ($uiGridBody[0].scrollHeight > $uiGridBody[0].clientHeight);
        var prevScrollTop = $uiGridBody.scrollTop();
        var prevGridMarginTop = $uiGridBodyTable.css("margin-top");
        var prevChartMarginTop = $ganttChartTable.css("margin-top");
        // To Prevent the Gantt from updating the View on Add, Remove and Scroll.
        ganttControl.PreventDefaultFns = true;
        $uiGridBody.css('overflow-y', 'hidden');
        $uiGridBody.scrollTop(0);
        $uiGridBodyTable[0].style.setProperty("margin-top", "0px", "important");
        $ganttChartTable[0].style.setProperty("margin-top", "0px", "important");

        // Hiding Dependency Lines from View.
        var $dependencyLines = $(".rq-gc-dependencysParent", $ganttChart).css("display", "none");

        // Hiding rows from view.
        var $tableRows = $("tr", $uiGridBody).css("display", "none");
        var $chartRows = $("tr", $chartRowsContainer).css("display", "none");
        $tableRow.css("display", "table-row");
        $chartRow.css("display", "table-row");
        var $gridOverlay = $chartOverlay = $("<div class='overlay-div'></div>");
        var $newTableRow = $("<tr class='custom-detail-row'></tr>");
        var $newTableTD = $("<td style='padding:0px !important; width: 100%; height: 100%; position: absolute;'></td>");
        $newTableRow.append($newTableTD);
        var $newChartRow = $("<tr class='custom-detail-row'></tr>");
        var $newChartTD = $("<td style='padding:0px !important; width: 100%; height: 100%; position: absolute; border-bottom: 2px solid rgb(207,216,219);'></td>");
        $newChartRow.append($newChartTD);
        var $detailViewGrid = $("<div class='detail-view-grid' style='width: 100%;'></div>");
        var $detailViewChart = $("<div class='detail-view-chart' style='height:100%; -moz-box-sizing: border-box !important;-webkit-box-sizing: border-box !important; box-sizing: border-box !important;'></div>");
        var $chartContent = $("<div class='content-container' style='width: 100%;'></div>");
        $detailViewChart.append($chartContent);

        $detailViewChart.append("<div class='tab-switch'><div class='closeBtn' style='background: #B3E8F3;'>Close X</div><div style='float: right; background: #B3E8F3;' id='chartButton' class='btn-group'> <button type='button' id='tab-2' class='btn btn-default btn-xs' style='background:url(Images/signal.png);'></button> <button type='button' id='tab-1' class='btn btn-default active btn-xs' style='background:url(Images/align_right.png);'></button> </div></div>");
        var $tab1Img = $("button#tab-1", $detailViewChart);
        var $tab2Img = $("button#tab-2", $detailViewChart);

        var $tab1Imgurl = $tab1Img.css('background');
        var $tab2Imgurl = $tab2Img.css('background');

        urlvalidator($tab1Img, $tab1Imgurl, "../../Content/Images/align_right.png", "../Images/align_right.png");
        urlvalidator($tab2Img, $tab2Imgurl, "../../Content/Images/signal.png", "../Images/signal.png");

        var count = 0;
        function urlvalidator($currElement, expectedURL, alternateURL1, alternateURL2) {
            expectedURL = expectedURL.replace('url("', '').replace('")', '');
            $.ajax({
                url: expectedURL,
                type: "GET",
                success: function () {
                    $currElement.css('background', "url(" + expectedURL + ")");
                },
                error: function () {
                    if (count == 0)
                        urlvalidator($currElement, alternateURL1, alternateURL2);
                    else
                        $currElement.css('background', "url(" + alternateURL1 + ")");
                    count++;
                }
            }).always(function (xhr, status) {
                count = 0;
            });
        }
        $newTableTD.append($detailViewGrid);
        $newChartTD.append($detailViewChart);

        var data = [{
            label: "Japan",
            data: Math.floor(Math.random() * 100) + 1
        }, {
            label: "China",
            data: Math.floor(Math.random() * 100) + 1
        }, {
            label: "Germany",
            data: Math.floor(Math.random() * 100) + 1
        }, {
            label: "America",
            data: Math.floor(Math.random() * 100) + 1
        }, {
            label: "Europe",
            data: Math.floor(Math.random() * 100) + 1
        }, {
            label: "India",
            data: Math.floor(Math.random() * 100) + 1
        }, {
            label: "France",
            data: Math.floor(Math.random() * 100) + 1
        }];
        var resources = [
                         {
                             resourceName: 'VictorG/GENIUS/CH',
                             resourceID: 'VIC',
                             workload: 50, // Percent workload
                             remaining: 1.25 // Remaining in project unit
                         },
                         {
                             resourceName: 'JasonG/GENIUS/CH',
                             resourceID: 'JAS',
                             workload: 25, // Percent workload
                             remaining: 3 // Remaining in project unit
                         },
                         {
                             resourceName: 'JohnH/GENIUS/CH',
                             resourceID: 'JNH',
                             workload: 45, // Percent workload
                             remaining: 1.25 // Remaining in project unit
                         },
                         {
                             resourceName: 'LiM/GENIUS/CH',
                             resourceID: 'LiM',
                             workload: 12, // Percent workload
                             remaining: 3 // Remaining in project unit
                         }
        ]

        var workunit = "Days";
        for (var i = 0; i < resources.length; i++) {
            var resource = resources[i];
            if (resource.workload >= 50)
                resource.class = 'workLoadRed';
            else
                resource.class = 'workLoadGreen';

            var reservations = activity.DataSource.ReservationsData;
            var reservlength = reservations.length;
            var actualLoad = "0";
            //Setting actualload to resource by getting it from reservation.
            for (var j = 0; j < reservlength; j++) {
                var reserv = reservations[j];
                if (resource.resourceID === reserv.resource) {
                    actualLoad = reserv.load.toString();
                    break;
                }
            }
            resource._load = parseInt(resource.workload) + '%';
            resource._actualLoad = converToLoadString(actualLoad, workunit);
            resource._remainingLoad = converToLoadString(resource.remaining.toString(), workunit);
        }
        $detailViewGrid.append(RadiantQ.Template(gridContentTmpl.html(), { resources: resources }));
        $detailViewChart.append(RadiantQ.Template(chartContentTmpl.html(), { resources: resources }));

        var height = $uiGridBody[0].clientHeight - $tableRow.outerHeight(true);
        $detailViewGrid.height(height);
        var width = hasVertScrollbar ? ($ganttChart.width() - 16/*For ScrollBar width*/) : $ganttChart.width();
        var left = GanttChart.HScrollBar.scrollLeft();
        var dataArray = [];
        //Inset barchart tooltip.
        $("<div id='tooltip'></div>").css({
            position: "absolute",
            display: "none",
            border: "1px solid #fdd",
            padding: "2px",
            "background-color": "#fee",
            opacity: 0.80
        }).appendTo("body");

        //By default first row of inset table will be selected in inset barchart view.
        lastSelectedRow = $(".clickableRow", $detailViewGrid)[0];
        var resourceID = $(lastSelectedRow).data().id;

        setWorkloadChartData(resourceID);

        var resourceChartWidth = (GanttChart.options.BaseTimeUnitWidth * dataArray.length) + 15;
        // Add the barChart into $chartContent element
        $chartContent.append("<div id='resourceChartView' style='background: rgb(215, 246, 251); position: absolute; left: -8px; margin-top:30px;'><div id='placeholder' style=' width:" + resourceChartWidth + "px;  height:" + (height - 30) + "px;' class='demo-placeholder'></div></div>");
        //Data for inset barChart.
        var data = [{
            data: dataArray,
            color: "rgb(223, 62, 62)",
            threshold: {
                below: 500,
                color: "rgb(126,189,66)"
            }

        }];
        //Label formate for inset barChart.
        var barnumberFormatter = function (value) {
            return value + '%';
        };
        var maxValue = dataArray.reduce(function (max, arr) {
            return Math.max(max, arr[1]);
        }, -Infinity);
        $newChartRow.insertAfter($chartRow);
        maxValue = maxValue * 352 / 300;

        resourceChart = $.plot("#placeholder", data, {
            xaxis: {
                mode: "time",
                show: false,
                aboveData: true,
            },

            yaxis: {
                font: {
                    size: 0
                },
                tickColor: 'rgba(148,148,148,0.1)',
            },
            grid: {
                borderWidth: 0,
                hoverable: true
            },
            bars: {
                show: true,
                barWidth: 86400000,
                fill: 1,
                align: "center",
                lineWidth: 0,
                numbers: {
                    xAlign: function (x) { return x - 8 },
                    show: true,
                    formatter: barnumberFormatter,
                    thresholdColor: 0.20, // custom-option
                    fontColor: 'rgb(131,181,100)',
                    yAlign: function (y) {
                        return (maxValue) / 5; // for label over bars
                    }
                },
            }
        });

        lastSelectedRow = $(".clickableRow", $detailViewGrid)[0];
        var resourceID = $(lastSelectedRow).data().id;

        var left = GanttChart.HScrollBar.scrollLeft();
        $detailViewChart.css({ "margin-left": left, width: $ganttChart.width() });
        $uiGridBody.scrollLeft(scrollLeft);
        $newTableRow.insertAfter($tableRow);
        $newChartRow.insertAfter($chartRow);

        var selectedTabId = "tab-1";
        var lastSelectedRow;

        $("#chartButton > button.btn", $detailViewChart).click(function () {
            if (this.id != selectedTabId) {
                selectedTabId = this.id;
                onTabSelectionChange(lastSelectedRow);
            }
        });

        GanttChart.BeforeChartHZScroll.subscribe(beforeChartHZScroll);
        function beforeChartHZScroll(sender, args) {
            $detailViewChart.css("margin-left", args.newValue);
        }

        $(".closeBtn", $detailViewChart).click(function () {
            closeActions();
            isExpanded = false;
        });
        window.closeActions = function () {
            $detailViewChart.remove();
            $uiGridBody.scrollTop(prevScrollTop);
            $uiGridBody.css('overflow-y', 'scroll');
            $uiGridBodyTable[0].style.setProperty("margin-top", prevGridMarginTop, "important");
            $ganttChartTable[0].style.setProperty("margin-top", prevChartMarginTop, "important");
            ganttControl.PreventDefaultFns = false;
            $gridOverlay.remove();
            $chartOverlay.remove();
            $("#tooltip").remove();
            $newTableRow.remove();
            $newChartRow.remove();
            $tableRows.css("display", "table-row");
            $chartRows.css("display", "table-row");
            $dependencyLines.css("display", "block");
            var $expanderDiv = $('.expanderUP');
            $expanderDiv.removeClass('expanderUP');
            $expanderDiv.addClass('expanderDown');
            ganttControl._setOption('IsReadOnly', false);
            readOnlyGrid(false);
        };

        function readOnlyGrid(isEditGrid) {
            for (var i = 0; i < columns.length; i++) {
                if (isEditGrid)
                    columns[i].iseditable = false;
                else {
                    //To remove the "_M" from the field name 
                    var checkTag = /_M\(\)/ig;
                    var name = columns[i].field.replace(checkTag, '');
                    if (name != "Activity.ID" && name != "Activity.Assignments")
                        columns[i].iseditable = true;
                }
            }
        }

        function afterSplitterResized(sender, args) {
            closeActions();
            isExpanded = false;
        }

        function insetGridRowClick() {
            $(".resourceTD", this).addClass("rowSelection");
            if (lastSelectedRow && lastSelectedRow != this) {
                var resourceID = $(this).data().id;
                setWorkloadChartData(resourceID)
                $(".resourceTD", lastSelectedRow).removeClass("rowSelection");
                var data = [{
                    data: dataArray,
                    color: "rgb(200, 20, 30)",
                    threshold: {
                        below: 500,
                        color: "rgb(126,189,66)"
                    }

                }];
                resourceChart.setData(data);
                resourceChart.draw();
            }
            lastSelectedRow = this;
        }
        function onTabSelectionChange(lastSelectedRow) {
            //swapping between assigned and barchart view while changing tabs in gantt chart.
            if (selectedTabId == "tab-1") {
                $(".tab-switch", $detailViewChart).removeClass("chartButtonDiv");
                $(".closeBtn", $detailViewChart).css('margin-top', '8px');
                $("#chartButton", $detailViewChart).css('margin-top', '6px');
                $("#tab-1", $detailViewChart).addClass("active");
                $("#tab-2", $detailViewChart).removeClass("active");
                $(".resource-label-chart").css('display', 'block');
                $("#resourceAssignedView", $detailViewChart).css("display", "inline-table");
                $("#resourceChartView", $detailViewChart).css("display", "none");
                $(".resourceTD", lastSelectedRow).removeClass("rowSelection");
                $(".clickableRow", $detailViewGrid).unbind("click", insetGridRowClick);
            }
            else {
                $(".tab-switch", $detailViewChart).addClass("chartButtonDiv");
                $(".closeBtn", $detailViewChart).css('margin-top', '4px');
                $("#chartButton", $detailViewChart).css('margin-top', '3px');
                $("#tab-2", $detailViewChart).addClass("active");
                $("#tab-1", $detailViewChart).removeClass("active");
                $(".resource-label-chart").css('display', 'none');
                $("#resourceChartView", $detailViewChart).css("display", "block");
                $("#resourceAssignedView", $detailViewChart).css("display", "none");
                $(".resourceTD", lastSelectedRow).addClass("rowSelection");
                $(".clickableRow", $detailViewGrid).bind("click", insetGridRowClick);
            }
        }
        function converToLoadString(load, workunit) {
            if (workunit == "Days") {
                var _load = load.split(".");
                if (!_load[0])
                    _load[0] = 0;
                if (!_load[1])
                    _load[1] = 0;
                _load[1] = parseFloat("." + _load[1]) * 24;
                return _load[0] + 'd ' + _load[1] + 'h';
            }
            else {
                return load + 'h';
            }
        }
        function setWorkloadChartData(resourceID) {
            var start = GanttChart.options.ComputedStartTime;
            var end = GanttChart.options.ComputedEndTime;
            dataArray = [];
            var WorkloadChartData = this.onProvideWorkloadChartData(start, end, ganttControl.BottomTwoHeaders[0].name(), resourceID);
            var workloadChartDataDic = new RadiantQ.Gantt.Dictionary();

            //Converting workloadChartData to dictionary. 
            for (var i = 0, length = WorkloadChartData.length; i < length; i++) {
                var date = new Date(WorkloadChartData[i].date).Date();
                workloadChartDataDic.Add(date.getTime(), WorkloadChartData[i]);
            }


            while (!start.equals(end)) {
                var time = start.getTime();
                var pointArray = [];
                pointArray.push(time);
                if (workloadChartDataDic[time])
                    value = workloadChartDataDic[time].workload;
                else
                    value = 0;
                pointArray.push(value);
                dataArray.push(pointArray);
                // Data for chart while selecting second resource in the inset grid. 
                start = start.clone().addDays(1);
            }

        }
        onTabSelectionChange(lastSelectedRow);
        ganttControl.AfterSplitterResized.unsubscribe(afterSplitterResized)
        ganttControl.AfterSplitterResized.subscribe(afterSplitterResized);
        isExpanded = true;
    }
};