angular.module('userCtrl', [])

.controller('userController', function($http) {
	var vm = this;
	$http.get('/api/user')
		.then(function(data) {
			vm.user = data.user;
		});
});