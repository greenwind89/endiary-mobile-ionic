(function() {
'use strict';

angular.module('endiary').controller('endiary.taskDiaryCtrl', TaskDiaryCtrl); 


TaskDiaryCtrl.$inject = ['yodacore.taskDataService', 'yodacore.recordDataService', '$q', '$scope'];

function TaskDiaryCtrl(TaskService, RecordService, $q, $scope) {
  var vm = this; 
  vm.thisDate = new Date();
  vm.tasks = [];
  vm.records = [];

  // MARK: share functions
  vm.doRefresh = doRefresh;

  // MARK: initialization 
  doRefresh();

  // MARK: functions
  function doRefresh() {
    $q.when(TaskService.getTaskByDate(vm.thisDate), RecordService.getRecordByDate(vm.thisDate)).then(function(tasks, records) {
      vm.tasks = tasks;
      vm.records = records;
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
}

})();

