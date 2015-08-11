(function() {
'use strict';

angular.module('muser').controller('muser.loginCtrl', LoginCtrl); 
                                   
LoginCtrl.$inject = ['yodacore.userDataService', '$state'];
                                   
function LoginCtrl (UserService, $state) { 
  var vm = this; 

  // MARK: Bindable variable
  // vm.email = 'minh.truonganh7@gmail.com';
  vm.email = 'minh@iastate.edu';
  vm.password = '123456'; 
  vm.message = {};

  // MARK: Bindable functions
  vm.login = login; 

  console.log('vm', vm);
  // MARK: Functions 
  function login() {
    console.log('fdsafds');
    UserService.login(vm.email, vm.password).then(function(result) {
      vm.message.content = result.message; 
      vm.message.success = result.success;

      if(result.success) {
        $state.go('main.takeNote');
      }

    });
  }
};

})();
