function expanderClick(e) {
    var $gridContent = $("#detailView-Grid-Content-tmpl");
    var $chartContent = $("#detailView-Chart-Content-tmpl");
    var ganttControl = $(e.currentTarget).closest('.rq-ganttBase').data('GanttControl');
    var ActivityView = ganttControl.ActivityViews[ganttControl.SelectedActivity.DisplayIndex];
    var $expanderDiv = $(".expanderDiv", $(e.currentTarget));
    $expanderDiv.removeClass('expanderDown');
    $expanderDiv.addClass('expanderUP');

    if ($expanderDiv.length)
        //Method call to create resource inset in the grid and chart. 
        showDetailedView(ActivityView, $gridContent, $chartContent, ganttControl);
}


ResourceImageViewer = function (options) {
    var settings = $.extend({
        TextProperty: "Name",
        ImageProperty: "Image",
    }, options);
    var resources = settings.Resources;
    var ulDom = $("<ul id='ImageList' style='padding-left:0px! important; position:absolute; right:10px; left:0px; margin: 0px !important;'></ul>");
    var createListItem = function (resource) {
        var dataSource = resource.DataSource;
        var liDom;
        if (dataSource[settings.ImageProperty] != null && dataSource[settings.ImageProperty] != undefined) {
            liDom = $("<li title='" + resource.ResourceName + "' id='" + resource.ResourceID + "' style='float:left; margin-left:2px; list-style: none;'><div><img style='height:19px; width:20px' src='" + dataSource[settings.ImageProperty] + "'></div></li>")
        }
        else if (dataSource[settings.TextProperty] != null && dataSource[settings.TextProperty] != undefined) {
            liDom = $("<li title='" + resource.ResourceName + "' id='" + resource.ResourceID + "' style='height:19px; margin-left:2px; width:20px; float:left; overflow:hidden;'><div style='line-height: 19px; font-weight:bold; border-radius:2px;  font-family: candara; font-size: 1em; color: white; background-color:#2EA9AE;'>" + dataSource[settings.TextProperty] + "</div></li>")
        }

        liDom.tooltip({ track: true  });

        return liDom;
    }
    if (resources.length != 0) {
        for (var i = 0; i < resources.length; i++) {
            var liDom = createListItem(resources[i].Resource);
            ulDom.append(liDom);
        }
    }
    if (options.ChildLength > 0)
        return ulDom[0].outerHTML;

    var $expanderDiv = $("<div class='expanderDiv' style='float:right;'></div>");
    $expanderDiv.addClass('expanderDown');
    return ulDom[0].outerHTML + $expanderDiv[0].outerHTML;
};

