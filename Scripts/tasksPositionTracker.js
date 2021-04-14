/// <reference path="../Src/RQScripts/Utils/JSEvents.js" />


(function () {
    function tasksPosiotionTracker(dataSource, taskObjProperty, startTimeProperty, endTimeProperty, minStartProp, maxEndProp) {
        var times = new findMinAndMax(null, dataSource, taskObjProperty, startTimeProperty, endTimeProperty, minStartProp, maxEndProp, false);
        return times;
    }
    RadiantQ.Gantt.TasksPosiotionTracker = tasksPosiotionTracker;

    function findMinAndMax(parent, dataSource, taskObjProperty, startTimeProperty, endTimeProperty, minStartProp, maxEndProp, isEventsListened, _times) {
        this.min = Date.MaxValue;
        this.max = Date.MinValue;
        var times = this;

        if (_times)
            times = _times;

        if (typeof taskObjProperty != "function" && typeof taskObjProperty != "string")
            return times;

        if (!isEventsListened)
            listenForCollectionChanges(parent, dataSource, times, taskObjProperty, startTimeProperty, endTimeProperty, minStartProp, maxEndProp);

        //times.dataSource = dataSource;

        for (var i = 0; i < dataSource.length; i++) {
            var data = dataSource[i];

            var childs = null;
            if (typeof taskObjProperty == "function")
                childs = taskObjProperty(data);
            else
                childs = data[taskObjProperty];

            if (childs == null) {
                if (data[startTimeProperty] && data[startTimeProperty].compareTo(times.min) < 0)
                    times.min = data[startTimeProperty];
                if (data[endTimeProperty] && data[endTimeProperty].compareTo(times.max) > 0)
                    times.max = data[endTimeProperty];

                if (!isEventsListened){
                    injectGetSetProperties(data, startTimeProperty, endTimeProperty, function (data, prop, value) {
                        if (parent != null) {
                            if (data[startTimeProperty].compareTo(times.min) < 0) {
                                times.min = data[startTimeProperty];
                                parent[minStartProp] = times.min;
                            }
                            if (data[endTimeProperty].compareTo(times.max) > 0) {
                                times.max = data[endTimeProperty];
                                parent[maxEndProp] = times.min;
                            }
                        }
                        else {
                            if (data[startTimeProperty].compareTo(times.min) < 0)
                                times.min = data[startTimeProperty];
                            if (data[endTimeProperty].compareTo(times.max) > 0)
                                times.max = data[endTimeProperty];
                        }
                    });
                }
            }
            else {

                var childTimes = new findMinAndMax(data, childs, taskObjProperty, startTimeProperty, endTimeProperty, minStartProp, maxEndProp);

                data[minStartProp] = childTimes.min;
                data[maxEndProp] = childTimes.max;

                if (childTimes.min.compareTo(times.min) < 0)
                    times.min = childTimes.min;
                if (childTimes.max.compareTo(times.max) > 0)
                    times.max = childTimes.max;

                if (!isEventsListened){
                    injectGetSetProperties(data, minStartProp, maxEndProp, function (data, prop, value) {
                        if (data[minStartProp] && data[minStartProp].compareTo(times.min) < 0) {
                            times.min = data[minStartProp];
                            if (parent != null)
                                parent[minStartProp] = times.min;
                        }
                        if (data[maxEndProp] && data[maxEndProp].compareTo(times.max) > 0) {
                            times.max = data[maxEndProp];
                            if (parent != null)
                                parent[maxEndProp] = times.max;
                        }
                    });
                }
            }
        }

        return times;
    }

    function injectGetSetProperties(data, startTimeProperty, endTimeProperty, callbackFn) {
        if (!data.PropertyChanged || data.PropertyChanged instanceof ObjectEvent == false)
            data.PropertyChanged = new ObjectEvent("PropertyChanged");

        var startVal = data[startTimeProperty];
        Object.defineProperty(data, startTimeProperty, {
            get: function () {
                return startVal;
            },
            set: function (newVal) {
                startVal = newVal;

                callbackFn(this, startTimeProperty, startVal);

                // rise the PropertyChanged, in setter, to notify the property changes in bindings.
                this.PropertyChanged.raise(this, {
                    PropertyName: startTimeProperty,
                    Value: startVal
                });
            }
        });

        var endVal = data[endTimeProperty];
        Object.defineProperty(data, endTimeProperty, {
            get: function () {
                return endVal;
            },
            set: function (newVal) {
                endVal = newVal;

                callbackFn(this, endTimeProperty, endVal);

                // rise the PropertyChanged, in setter, to notify the property changes in bindings.
                this.PropertyChanged.raise(this, {
                    PropertyName: endTimeProperty,
                    Value: endVal
                });

            }
        });

    }

    function listenForCollectionChanges(parent, dataSource, times, taskObjProperty, startTimeProperty, endTimeProperty, minStartProp, maxEndProp) {
        if (!dataSource)
            return;

        if (dataSource["CollectionChanged"] && dataSource.CollectionChanged instanceof ObjectEvent) {
            dataSource.CollectionChanged.subscribe(function () {
                debugger;
            }, { context: { parent: parent, dataSource: dataSource, taskObjProperty: taskObjProperty, startTimeProperty: startTimeProperty, endTimeProperty: endTimeProperty, minStartProp: minStartProp, maxEndProp: maxEndProp } });
        }
        else {
            $.observable(dataSource).bind("insert remove replaceAll", function (event, ui) {
                var eventType = event.type;

                var ds = dataSource;

                if (eventType == "insert") {
                    var items = ui.items;
                    for (var i = 0; i < items.length; i++) {
                        var data = items[i];

                        var newItemTimes = new findMinAndMax(parent, [data], taskObjProperty, startTimeProperty, endTimeProperty, minStartProp, maxEndProp, false, parent == null ? times : false);

                        if (newItemTimes.min.compareTo(times.min) < 0){
                            times.min = newItemTimes.min;
                            if (parent != null)
                                parent[minStartProp] = times.min;;
                        }
                        if (newItemTimes.max.compareTo(times.max) > 0) {
                            times.max = newItemTimes.max;
                            if (parent != null)
                                parent[maxEndProp] = times.max;
                        }
                    }
                }
                else if (eventType == "remove") {
                    var items = ui.items;
                    for (var i = 0; i < items.length; i++) {
                        var data = items[i];

                        if (data[startTimeProperty].compareTo(times.min) == 0 || data[endTimeProperty].compareTo(times.max) == 0) {
                            var updatedTimes = new findMinAndMax(parent, dataSource, taskObjProperty, startTimeProperty, endTimeProperty, minStartProp, maxEndProp);

                            times.min = updatedTimes.min;
                            if (parent != null)
                                parent[minStartProp] = times.min;

                            times.max = updatedTimes.max;
                            if (parent != null)
                                parent[maxEndProp] = times.max;
                        }
                    }
                }
                else if (eventType == "replaceAll") {
                }
            });
        }
    }

})();



// usage
var dataSource = [{
    "TName": "Team 1",
    "StartTime": new Date("2017-09-05"),
    "EndTime": new Date("2017-09-06"),
    "Resources": [{
        "RName": "Res 1",
        "StartTime": new Date("2017-09-06"),
        "EndTime": new Date("2017-09-07"),
        "Tasks": [{
            "Name": "Task 1",
            "StartTime": new Date("2017-09-08"),
            "EndTime": new Date("2017-09-09"),
            "Tasks": [{
                "Name": "Sub Task 1",
                "StartTime": new Date("2017-09-09"),
                "EndTime": new Date("2017-09-10")
            }]
        }]
    },
    {
        "RName": "Res 2",
        "StartTime": new Date("2017-09-05"),
        "EndTime": new Date("2017-09-08")
    }]
},
{
    "TName": "Team 2",
    "StartTime": new Date("2017-09-07"),
    "EndTime": new Date("2017-09-08"),
    "Resources": []
}];


//tasksPosiotionTracker(dataSource, taskObjProperty, startTimeProperty, endTimeProperty, minStartProp, maxEndProp);
var tracker = RadiantQ.Gantt.TasksPosiotionTracker(dataSource, resolverFunction, "StartTime", "EndTime", "StartTime", "EndTime");

   
var res1 = {
    "RName": "Res 1",
    "StartTime": new Date("2017-09-10"),
    "EndTime": new Date("2017-09-20")
};

//dataSource[1].Resources = [];
$.observable(dataSource[1].Resources).insert(res1);

if (tracker.min.equals(new Date("2017-09-05")) == false) {
    alert("Test case #1 failed.");
}



var team3 = {
    "TName": "Team 3",
    "StartTime": new Date("2017-09-07"),
    "EndTime": new Date("2017-09-08"),
    "Resources": [{
        "RName": "Res 1",
        "StartTime": new Date("2017-09-01"),
        "EndTime": new Date("2017-09-07"),
        "Tasks": [{
            "Name": "Task 1",
            "StartTime": new Date("2017-09-02"),
            "EndTime": new Date("2017-09-09")
        }]
    }]
};
$.observable(dataSource).insert(team3);

var task2 = {
    "Name": "Task 1",
    "StartTime": new Date("2017-09-02"),
    "EndTime": new Date("2017-09-30")
};
$.observable(team3.Resources[0].Tasks).insert(task2);


dataSource[0].Resources[0].Tasks[0].StartTime = dataSource[0].Resources[0].Tasks[0].StartTime.clone().addDays(-8);


function resolverFunction(data) {
    if (data["Resources"])
        return data["Resources"];
    else if (data["Tasks"])
        return data["Tasks"];
    else
        return null;
}