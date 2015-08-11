(function() {
'use strict';

angular.module('mlist', ['yodacore'])
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('main.detailList', {
    url: '/list/:id',
    views: {
      'mainContent': { 
        templateUrl: 'template/mlist/detailList.html',
        controller: 'mlist.detailListCtrl as vm',
      },
    }
  })
  .state('main.listLists', {
    url: '/lists',
    views: {
      'mainContent': { 
        templateUrl: 'template/mlist/listLists.html',
        controller: 'mlist.listListsCtrl as vm',
      },
    }
  });

});


})();



