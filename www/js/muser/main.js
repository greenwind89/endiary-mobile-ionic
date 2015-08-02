angular.module('muser', ['ionic', 'yodacore'])
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  // login page
  .state('login', {
    url: '/login',
    templateUrl: 'template/user/login.html',
    controller: 'muser.loginCtrl',
    controllerAs: 'vm'
  });

});
;

