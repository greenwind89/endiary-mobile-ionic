(function() {
'use strict';

angular.module('endiary').controller('endiary.mainCtrl', MainCtrl); 


MainCtrl.$inject = ['yodacore.CONSTS'];

function MainCtrl(CONSTS) {
  var vm = this;
  vm.CONSTS = CONSTS;
}

})();




