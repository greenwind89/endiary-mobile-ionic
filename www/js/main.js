(function() {
'use strict';

angular.module('endiary', [
  'ionic', 
  'muser', 
  'mdiary', 

  // shared module from web
  'yodacore']) 

.run(['$ionicPlatform', 'yodacore.CONSTS', function($ionicPlatform, CONSTS) {
  CONSTS.ROOT_URL = 'http://localhost:3000';
  // CONSTS.ROOT_URL = 'https://endiary.com';
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }


  });
}])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('main', {
    url: '/main',
    templateUrl: 'template/endiary/main.html',
    controller: 'endiary.mainCtrl',
    abstract: true
  })
  .state('main.taskDiary', {
    url: '/taskDiary',
    views: {
      'mainContent': { 
        templateUrl: 'template/endiary/taskDiaryView.html',
        controller: 'endiary.taskDiaryCtrl as vm'
      },
      // 'topList@main.taskDiary': {
      //   templateUrl: 'template/task/taskList.html',
      // },
      // 'bottomList@main.taskDiary': {
      //   templateUrl: 'template/task/taskListWithTime.html',
      // }
    }
  }).
  state('main.takeNote', {
    url: '/takeNote',
    views: {
      'mainContent': { 
        templateUrl: 'template/endiary/takeNoteView.html',
        controller: 'endiary.takeNoteCtrl as vm'
      }
    }

  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});

})();

