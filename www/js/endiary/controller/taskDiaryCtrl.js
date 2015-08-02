(function() {
'use strict';

angular.module('endiary').controller('endiary.taskDiaryCtrl', TaskDiaryCtrl); 


TaskDiaryCtrl.$inject = ['yodacore.taskDataService', 'yodacore.recordDataService'];

function TaskDiaryCtrl(TaskService, RecordService) {
  var vm = this; 
  vm.thisDate = new Date();
  vm.tasks = [];
  vm.records = [];


  getCurrentDateTasks();
  getCurrentDateRecords();


  // MARK: functions
  function getCurrentDateTasks() {
    TaskService.getTaskByDate(vm.thisDate).then(function(tasks) {
      vm.tasks = tasks;
    });
  }

  function getCurrentDateRecords() {
    RecordService.getRecordByDate(vm.thisDate).then(function(records) {
      vm.records = records;
    });
  }
}

})();

