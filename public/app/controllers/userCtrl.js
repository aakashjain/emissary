angular.module('userCtrl', [])

.controller('userController', function($http) {
	var vm = this;
	$http.get('/api/user')
		.then(function(res) {
			vm.user = res.data;
			console.log(vm.user);
		});
});