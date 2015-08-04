(function() {
  'use strict';
  angular.module('endiary').controller('endiary.takeNoteCtrl', takeNoteCtrl); 
  takeNoteCtrl.$inject = ['yodacore.taskRecordService', 'yodacore.CONSTS', 'yodacore.time', 'yodacore.recordDataService', '$scope'];
  function takeNoteCtrl(TaskRecordService, CONSTS, time, RecordService, $scope) {
    // MARK: bindable variables
    var vm = this; 
    vm.task = null;
    vm.upcomingTask = null;
    vm.records = [];
    vm.note = ''; 
    vm.defaultColor = CONSTS.DEFAULT_COLOR;
    vm.startTime = null;
    vm.duration = null; 

    // MARK: bindable functions
    vm.addNote = addNote;
    vm.doRefresh = doRefresh;

    // MARK: initialization
    getCurrentTask();

    // MARK: functions
    function getCurrentTask() {
      TaskRecordService.getCurrentTaskAndRecords().then(function(result, a) {
        console.log('a', a, result);
        var task = result.currentTask;
        var records = result.records;
        var prevTask = result.prevTask;
        var nextTask = result.nextTask;

        vm.task = task;
        vm.records = records;

        if(task) {
          vm.startTime = task.start_time;
          vm.duration = task.duration;
        } else {
          if(prevTask) {
            var prevStart = new Date(prevTask.start_time);
            vm.startTime = new Date(prevStart.getTime() + prevTask.duration * 60 * 1000); 
          } else {
            vm.startTime = time.getTheBeginningOfDate(new Date());
          }

          if(nextTask) {
            var nextStart = new Date(nextTask.start_time);
            vm.duration = Math.round((time.convertTo24h(nextStart) - time.convertTo24h(vm.startTime)) * 60); 
            vm.upcomingTask = nextTask;
          } else {
            vm.duration = Math.round((time.convertTo24h(time.getTheEndOfDate(new Date())) - time.convertTo24h(vm.startTime)) * 60); 
          }


        }

        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    function addNote() {
      var newRecord = {
        title: vm.note,
      };
      if(vm.task) {
        newRecord.task_id = vm.task._id;
        newRecord.list_id = vm.task.list_id;
      }
      RecordService.createNewRecord(newRecord).then(function() {
      });
      vm.note = '';
    }

    function doRefresh() {
      getCurrentTask();
    }
  }
})();
