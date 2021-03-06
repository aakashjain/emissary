angular.module('app.routes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

	$routeProvider

	.when('/', {
		templateUrl : 'app/views/pages/home.html',
		controller  : 'mainController',
		controllerAs: 'main'
	})

	.when('/dash', {
		templateUrl: 'app/views/pages/dash.html',
		controller: 'userController',
		controllerAs: 'user'
	});

	$locationProvider.html5Mode(true);
});