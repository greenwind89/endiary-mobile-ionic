(function() {
'use strict';

angular.module('mdiary', ['yodacore'])
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('main.entryDetail', {
    url: '/entry/:id',
    views: {
      'mainContent': { 
        templateUrl: 'template/mdiary/detailEntry.html',
        controller: 'mdiary.detailEntryCtrl as vm',
      },
    }
  });

});


})();


