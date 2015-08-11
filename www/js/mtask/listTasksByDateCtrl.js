(function() {
'use strict';

angular.module('mtask').controller('mtask.listTasksByDateCtrl', ListTasksByDateCtrl); 
                                   
ListTasksByDateCtrl.$inject = ['yodacore.userDataService', '$stateParams', 'yodacore.CONSTS', '$scope'];
                                   
function ListTasksByDateCtrl(UserService, $stateParams, CONSTS, $scope) { 
  var vm = this; 
  vm.currentDate = null;

  init();

  function init() {
    if($stateParams.type === CONSTS.TYPE_TODAY_TASK_LIST) {
      vm.currentDate = new Date();
      initListTaskOptions();
    }
  }

  function initListTaskOptions() {
    $scope.listTasksOptions = {
      type: CONSTS.TYPE_TASK_LIST_BY_DATE,
      currentDate: vm.currentDate 
    };
  }
  
};

})();


