(function() {
  'use strict';

  angular.module('mdiary').controller('mdiary.detailEntryCtrl', DetailEntryCtrl); 

  DetailEntryCtrl.$inject = ['$stateParams', 'yodacore.recordDataService', '$scope'];
  function DetailEntryCtrl($stateParams, RecordService, $scope) {
    var vm = this; 

    // MARK: bindable variables
    vm.entry = null;
    
    // MARK: bindable functions

    // MARK: initialization
    init();

    // MARK: functions
    function init() {
      if($stateParams.id) {
        RecordService.getRecordById($stateParams.id).then(function(data) {
          vm.entry = data;
          $scope.entry = data;
        });
      }
    }
  }
})();
