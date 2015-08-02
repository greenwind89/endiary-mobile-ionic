(function() {
'use strict';

angular.module('mtask').controller('mtask.taskListCtrl', TaskListCtrl); 
                                   
TaskListCtrl.$inject = ['yodacore.userDataService', '$state'];
                                   
function TaskListCtrl(UserService, $state) { 
  var vm = this; 
};

})();


