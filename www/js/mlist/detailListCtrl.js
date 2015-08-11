(function() {
  'use strict';

  angular.module('mlist').controller('mlist.detailListCtrl', DetailListCtrl); 

  DetailListCtrl.$inject = ['yodacore.listDataService', '$stateParams' ,'$scope', 'yodacore.CONSTS'];
  function DetailListCtrl(ListService, $stateParams, $scope, CONSTS) {
    var vm = this; 
    // MARK: bindable variables
    vm.list = null;

    // MARK: bindable functions

    // MARK: initialization
    init();

    // MARK: functions
    function init() {
      if($stateParams.id) {
        ListService.getListById($stateParams.id).then(function(data) {
          vm.list = data;
          $scope.modelForListItem = data;

          initListTasksOptions();
        });
      }
    }

    function initListTasksOptions() {
      $scope.listTasksOptions = {
        type: CONSTS.TYPE_TASK_LIST_BY_LIST,
        currentList: vm.list,
        shouldFireCurrentEvent: false
      };
    }
    
  }
})();
