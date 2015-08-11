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
    vm.todayRecords = [];
    vm.note = ''; 
    vm.defaultColor = CONSTS.DEFAULT_COLOR;
    vm.startTime = null;
    vm.duration = null; 
    vm.currentDate = new Date();

    // MARK: bindable functions
    vm.addNote = addNote;
    vm.doRefresh = doRefresh;
    vm.removeNote = removeNote;

    // MARK: initialization
    init();

    // MARK: functions

    function init() {
      getCurrentTask();
    }

    function initListEntriesOptions() {
      $scope.listEntriesOptions = {
        type: CONSTS.TYPE_ENTRY_BY_DATE_RANGE,
        endDate: vm.currentDate,
        shouldLoadMore: true,
        groupByTask: true,
        startDate: new Date(vm.currentDate.getTime() - 24 * 60 * 60 *1000)
      };
      
    }

    function getCurrentTask() {
      TaskRecordService.getCurrentTaskForCurrentNote().then(function(result) {
        vm.task = result.currentTask;
        vm.startTime = result.startTime;
        vm.duration = result.duration;
        vm.upcomingTask = result.upcomingTask;

        console.log('current vm', vm, result);
        $scope.$broadcast('scroll.refreshComplete');
        initListEntriesOptions();
      });

    }

    function getNotesForTask() {

      if(vm.task) {
        RecordService.getNotesByTaskId(vm.task._id).then(function(notes) {
          vm.records = notes;
        });
      }         

      RecordService.getNotesByDate(new Date()).then(function(notes) {
        vm.todayRecords = notes;
      })
    }

    function addNote() {
      var newRecord = {
      };

      if(vm.task) {
        newRecord.task_id = vm.task._id;
        newRecord.list_id = vm.task.list_id;
      }

      newRecord.is_note = true;
      newRecord.content = vm.note;

      RecordService.createNewRecord(newRecord).then(function() {
      });
      vm.note = '';
    }

    function doRefresh() {
      getCurrentTask();
    }

    function removeNote(note) {
      RecordService.removeRecord(note);
    }
  }
})();
