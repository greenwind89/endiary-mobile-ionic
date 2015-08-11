(function() {
'use strict';

angular.module('mtask', ['yodacore'])
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('main.detailTask', {
    url: '/task/:id',
    views: {
      'mainContent': { 
        templateUrl: 'template/mtask/detailTask.html',
        controller: 'mtask.detailTaskCtrl as vm',
      },
    }
  });

  .state('main.listTaskByDate', {
    url: '/listTaskByDate/:type',
    views: {
      'mainContent': { 
        templateUrl: 'template/mtask/listTasksByDateView.html',
        controller: 'mtask.listTasksByDateCtrl as vm',
      },
    }
  });

});

})();

