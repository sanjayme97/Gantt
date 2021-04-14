function FGActionManager() {
    var __extends = window.__extends;

    /*ActionManager instance that manages the undo/redo actions. Undo/Redo is turned off by default.
        Set ActionManager.EnableRecordingActions = true; to turn it on.*/
    this.ActionManager = new RadiantQ.ActionManager();
    this.ActionManager.EnableRecordingActions = true;
    this.ActionManager.isECAction = false;

    // Undo/Redo for grid editing.
    this.RecordGridAction = function (flexyGantt) {
        var changeInfo = flexyGantt.grid.getLatestColumnChangeInfo();
        if (changeInfo) {
            // Create and record action of data property changes.
            var action = this.CreateGridEditAction(changeInfo, flexyGantt);
            this.ActionManager.RecordAction(action);
        }
    }
    this.CreateGridEditAction = function (changeInfo, flexyGantt) {
        var view = changeInfo.Source_M();
        var boundObj = view;
        var propName = changeInfo.Property_M();

        // Here we supported 'Undo/Redo' for 'name' column.
        return new RadiantQ.Gantt.GenericActivityViewChangeActionInGrid(flexyGantt, {}, view._data, propName, changeInfo.GetOldValue(), changeInfo.GetCurrentValue(), true, boundObj);
    }

    var extendedAbstractAction = (function (_super) {
        // Recommended way to extend one type with another.
        __extends(extendedAbstractAction, _super);

        function extendedAbstractAction() {
            // Call base's constructor.
            _super.apply(this, arguments);
        }
        return extendedAbstractAction;

    })(RadiantQ.AbstractAction);

    var self = this;
    this.ExpandCollapseActivityViewAction = (function (_super) {
        // Recommended way to extend one type with another.
        __extends(ExpandCollapseActivityViewAction, _super);
        function ExpandCollapseActivityViewAction(expand, hierItem) {
            // Call base's constructor.
            _super.apply(this, arguments);

            this.expand = expand;
            this.hierItem = hierItem;
            this.ExecuteCore = function () {
                if (this.hierItem != null) {
                    self.ActionManager.isECAction = true;
                    this.hierItem.IsExpanded(this.expand);
                    self.ActionManager.isECAction = false;
                }
            }

            this.UnExecuteCore = function () {
                if (this.hierItem != null) {
                    self.ActionManager.isECAction = true;
                    this.hierItem.IsExpanded(!this.expand);
                    self.ActionManager.isECAction = false;
                }
            }
        }
        return ExpandCollapseActivityViewAction;

    })(extendedAbstractAction);

    // Undo/Redo for gantt chart.
    this.SetStartTimeAction = (function (_super) {
        // Recommended way to extend one type with another.
        __extends(SetStartTimeAction, _super);
        function SetStartTimeAction(dataSource, newTime, oldTime, endTimes) {
            // Call base's constructor.
            _super.apply(this, arguments);

            this.DataSource = dataSource;
            this.OldStartTime = oldTime;
            this.NewStartTime = newTime;

            if (endTimes) {
                this.OldEndTime = endTimes.oldEnd;
                this.NewEndTime = endTimes.newEnd;
            }
            this.Execute = function () {
                this.DataSource.StartTime = this.NewStartTime.clone();
                if (this.NewEndTime)
                    this.DataSource.EndTime = this.NewEndTime.clone();
            }

            this.UnExecute = function () {
                this.DataSource.StartTime = this.OldStartTime.clone();
                if (this.OldEndTime)
                    this.DataSource.EndTime = this.OldEndTime.clone();
            }
        }
        return SetStartTimeAction;

    })(extendedAbstractAction);
    this.SetEndTimeAction = (function (_super) {
        // Recommended way to extend one type with another.
        __extends(SetEndTimeAction, _super);
        function SetEndTimeAction(dataSource, newTime, oldTime, startTimes) {
            // Call base's constructor.
            _super.apply(this, arguments);

            this.DataSource = dataSource;
            this.OldEndTime = oldTime;
            this.NewEndTime = newTime;

            if (startTimes) {
                this.NewStartTime = startTimes.newStart;
                this.OldStartTime = startTimes.oldStart;
            }
            this.ExecuteCore = function () {
                this.DataSource.EndTime = this.NewEndTime.clone();
                if (this.NewStartTime)
                    this.DataSource.StartTime = this.NewStartTime.clone();
            }

            this.UnExecuteCore = function () {
                this.DataSource.EndTime = this.OldEndTime.clone();
                if (this.OldStartTime)
                    this.DataSource.StartTime = this.OldStartTime.clone();
            }
        }
        return SetEndTimeAction;

    })(extendedAbstractAction);

    this.AddResourceAction = (function (_super) {
        // Recommended way to extend one type with another.
        __extends(AddResourceAction, _super);
        function AddResourceAction(resources, newResource) {
            // Call base's constructor.
            _super.apply(this, arguments);

            this.resources = resources;
            this.newResource = newResource;

            this.ExecuteCore = function () {
                // This will add the new resource to the gantt.
                $.observable(this.resources).insert(this.newResource);
            }

            this.UnExecuteCore = function () {
                // This will remove the added resource from the gantt.
                $.observable(this.resources).remove(this.newResource);
            }
        }
        return AddResourceAction;

    })(extendedAbstractAction);

    this.AddTaskAction = (function (_super) {
        // Recommended way to extend one type with another.
        __extends(AddTaskAction, _super);
        function AddTaskAction(tasks, newtask) {
            // Call base's constructor.
            _super.apply(this, arguments);

            this.tasks = tasks;
            this.newtask = newtask;

            this.ExecuteCore = function () {
                // This will add the new task to the gantt.
                $.observable(this.tasks).insert(this.newtask);
            }

            this.UnExecuteCore = function () {
                // This will remove the added task from the gantt.
                $.observable(this.tasks).remove(this.newtask);
            }
        }
        return AddTaskAction;

    })(extendedAbstractAction);

}
    
window.FGActionManager = FGActionManager;
