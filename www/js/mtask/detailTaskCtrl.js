(function() {
  'use strict';

  angular.module('mtask').controller('mtask.detailTaskCtrl', DetailTaskCtrl); 

  DetailTaskCtrl.$inject = ['yodacore.taskDataService', '$stateParams' ,'$scope', 'yodacore.CONSTS'];
  function DetailTaskCtrl(TaskService, $stateParams, $scope, CONSTS) {
    var vm = this; 
    // MARK: bindable variables
    vm.task = null;

    // MARK: bindable functions

    // MARK: initialization
    init();

    // MARK: functions
    function init() {
      if($stateParams.id) {
        TaskService.getTaskById($stateParams.id).then(function(data) {
          vm.task = data;
          $scope.modelForTaskItem = data;
          initListEntriesOptions();
          initListSubtasksOptions();
        });

      }
    }

    function initListEntriesOptions() {
      $scope.listEntriesOptions = {
        type: CONSTS.TYPE_ENTRY_BY_TASK,
        task: vm.task,
        groupByTask: false
      };
    }


    function initListSubtasksOptions() {
      $scope.listTasksOptions = {
        type: CONSTS.TYPE_SUBTASK_LIST_OF_TASK,
        parentTask: vm.task,
        shouldFireCurrentEvent: false
      };
    }

    
  }
})();

