/*
This script files contains binding functions to update the gantt table cell when the bound data object changed.
*/
(function ($) {
    //This utility function is used to bind the gantt table cell with bound object.
    $.fn.BindCellToData = function (options) {
        var _val = "";
        var self = this;
        var bind = null;
        Object.defineProperty(this[0], "Value",
        {
            get: function () {
                return _val;
            },
            set: function (value) {
                if (_val == value)
                    return;

                _val = value;
                self.html(value);
            },
            enumerable: true,
            configurable: true
        });
        bind = new Binding(options.Source, options.PropName, this[0], "Value", options.Converter, null, options.ConverterContext);
        this[0].Dispose = function () {
            //To unbind
            bind.Dispose();
        }
    };
})(jQuery);

ShortDateStringConverter =
    {
        Convert: function (value, src, tar) {
            return value.toString(Date.CultureInfo.formatPatterns.shortDate);
        }
    }
ToString =
    {
        Convert: function (value, src, tar) {
            return value.toString();
        }
    }

ToDollerString =
    {
        Convert: function (value, src, tar) {
            if (value != undefined) {
                return "$" + value.toString();
            }
        }
    }

PriorityToIMgConverter =
    {
        Convert: function (value, src, tar) {
            switch (value.toString()) {
                case "1":
                    return '<img src="Images/low.png" alt="Low Priority" height="15" width="20" />';
                    break;
                case "2":
                    return '<img src="Images/medium.png" alt="medium Priority" height="15" width="20" />';
                    break;
                case "3":
                    return '<img src="Images/high.png"  alt="high Priority" height="15" width="20" />';
                    break;
            }
        }
    }
PriorityToTxttConverter =
    {
        Convert: function (value, src, tar) {
            switch (value.toString()) {
                case "1":
                    return "Low";
                    break;
                case "2":
                    return "Medium";
                    break;
                case "3":
                    return "High";
                    break;
            }
        },
        ConvertBack: function (value, src, tar) {
            switch (value.toString()) {
                case "Low":
                    return "1";
                    break;
                case "Medium":
                    return "2";
                    break;
                case "High":
                    return "3";
                    break;
            }
        }
    }
 //To update the GanttTable cell.
function templateCallBack(tableRow, data) {
 

    var $idCol = tableRow.find("div.rq-grid-idCol"), $nameCol = tableRow.find("div.rq-grid-nameCol"), $startTimeCol = tableRow.find("div.rq-grid-startTimeCol"), $endTimeCol = tableRow.find("div.rq-grid-endTimeCol"),
    $effortCol = tableRow.find("div.rq-grid-effortCol"), $resourceCol = tableRow.find("div.rq-grid-resourceCol"), $progressCol = tableRow.find("div.rq-grid-progressCol"), $predecessorIndices = tableRow.find("div.rq-grid-predecessorIndicesCol"), $descriptionCol = tableRow.find("div.rq-grid-descriptionCol");

    if ($idCol.length == 1 && $idCol[0]["alreadyBound"] == undefined) {
        $idCol.append(data.Activity["ID"]);
    }


	if($nameCol.length == 1 && $nameCol[0].Dispose == null){
	    $nameCol.ExpandableTextBlock({
            Converter : function(data){
                return data.Activity.ActivityName;
            }
        });
    }
	if ($startTimeCol.length == 1 && $startTimeCol[0]["alreadyBound"] == undefined) {

	    $startTimeCol.append(data.Activity["StartTime"].toString(Date.CultureInfo.formatPatterns.shortDate));
    }  
	if ($endTimeCol.length == 1 && $endTimeCol[0]["alreadyBound"] == undefined) {

	    $endTimeCol.append(data.Activity["EndTime"].toString(Date.CultureInfo.formatPatterns.shortDate));
    }
	if ($effortCol.length == 1 && $effortCol[0]["alreadyBound"] == undefined) {
        $effortCol.append(data.Activity["Effort"].toString());
    }

	if ($progressCol.length == 1 && $progressCol[0]["alreadyBound"] == undefined) {

        $progressCol.append(data.Activity["ProgressPercent"].toString());
    }
    if ($descriptionCol.length == 1 && $descriptionCol[0]["alreadyBound"] == undefined) {

        $descriptionCol.append(data.Activity["Description"]);
    }
 
	this.UpdateResource = function (resources, elemnt) {
	    var resourceText = RadiantQ.Gantt.ValueConverters.ConverterUtils.GetResourcesText(data.Activity.Assignments, false);
	    if (resources != undefined)
	        resourceText = RadiantQ.Gantt.ValueConverters.ConverterUtils.GetResourcesText(resources, false);
	    elemnt.html(resourceText).attr("title", resourceText);
	}

	if ($resourceCol.length == 1 && $resourceCol[0]["alreadyBound"] == undefined) {
	    var rself = this;	 
	    data.Activity.Assignments.CollectionChanged.subscribe(function () {
	        rself.UpdateResource(arguments[0], $resourceCol);
	    });
	    $resourceCol.html("");
	    this.UpdateResource(null, $resourceCol);
    }
	if ($predecessorIndices.length == 1 && $predecessorIndices[0]["alreadyBound"] == undefined) {
        $predecessorIndices.append(data.Activity["PredecessorIndexString"]);
    }
    data.Activity.PropertyChanged.subscribe(function (sender, args) {

        var value = args.value;
        switch (args.PropertyName) {

            case "EndTime":
                if ($endTimeCol[0]["alreadyBound"] == undefined)
                    $endTimeCol.html(sender["EndTime"].toString(Date.CultureInfo.formatPatterns.shortDate));
                break;
            case "StartTime":
                if ($startTimeCol[0]["alreadyBound"] == undefined)
                    $startTimeCol.html(sender["StartTime"].toString(Date.CultureInfo.formatPatterns.shortDate));
                break;
            case "ProgressPercent":
                if ($progressCol.length > 0 && $progressCol[0]["alreadyBound"] == undefined)
                    $progressCol.html(sender["ProgressPercent"].toString());
                break;
            case "Effort":
                if ($effortCol.length > 0 && $effortCol[0]["alreadyBound"] == undefined)
                    $effortCol.html(sender["Effort"].toString());
                break;
            case "PredecessorIndexString":
                if ($predecessorIndices.length > 0 && $predecessorIndices[0]["alreadyBound"] == undefined)
                    $predecessorIndices.html(sender["PredecessorIndexString"]);
                break;
            case "ActivityName":
                $nameCol.html(sender["ActivityName"]);
                break;
            case "Description":
                if ($descriptionCol.length > 0 && $descriptionCol[0]["alreadyBound"] == undefined)
                    $descriptionCol.html(sender["Description"]);
            default:
                break;

        }

    });
}
