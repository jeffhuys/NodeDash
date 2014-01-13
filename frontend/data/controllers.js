var nodedashApp = angular.module('nodedashApp', ['ngRoute', 'services.breadcrumbs']);

nodedashApp.controller('RootController', ['$scope', 'breadcrumbs', function($scope, breadcrumbs) {
	console.log("Root controller executed...");

	$scope.breadcrumbs = breadcrumbs;


	$scope.servers = [];
	$scope.refreshSeconds = 1;
	$scope.detailRefreshSeconds = 1;

  	var socket = io.connect('192.168.2.7:6278');

  	socket.on('identify', function() {
  		socket.emit('identify', {what: "client"});
  	});

  	socket.on('stats', function(data) {
		// Check if the server is already being tracked.
		// If true, we will change the data already available.
		// If false, we will append the data to the array.
		//console.log("recv");

		var exists = false;
		var index = -1;
		for (var i = 0; i < $scope.servers.length; i++) {
			if($scope.servers[i].stats.hostname == data.stats.hostname) {
				exists = true;
				index = i;
			}
		};

		if(!exists) {
			var newindex = $scope.servers.push(data) - 1;
			$scope.servers[newindex].healthy = true;
			$scope.servers[newindex].lastseen = Math.round(new Date().getTime() / 1000);
			$scope.$apply();

			//console.table($scope.servers);
		} else {
			$scope.servers[index] = data;
			$scope.servers[index].healthy = true;
			$scope.servers[index].lastseen = Math.round(new Date().getTime() / 1000);
			$scope.$apply();
		}
	});

  	$scope.checkServers = function() {
  		//console.log("Checking..." + $scope.refreshSeconds);
  		for (var i = 0; i < $scope.servers.length; i++) {
  			if(Math.round(new Date().getTime() / 1000) - $scope.servers[i].lastseen >= 10) {
  				$scope.servers[i].healthy = false;

			} else {
				$scope.servers[i].healthy = true;
			}
			$scope.$apply();
  		};
  		setTimeout($scope.checkServers, $scope.refreshSeconds * 1000);
  	};
  	$scope.checkServers();
}]);

nodedashApp.controller('DashboardController', ['$scope', '$rootScope', function ($scope, $rootScope) {

}]);

nodedashApp.controller('DetailController', ['$scope', '$rootScope', '$routeParams', function ($scope, $rootScope, $routeParams) {
	$scope.serverId = $routeParams.serverId;

  	$scope.refreshServer = function() {
  		//console.log("Refresh..." + $scope.refreshSeconds);
		for (var i = 0; i < $scope.servers.length; i++) {
			if($scope.serverId == $scope.servers[i].stats.hostname) {
				$scope.server = $scope.servers[i];
			}
		};
  		setTimeout($scope.refreshServer, $scope.refreshSeconds * 1000);
  	};
  	$scope.refreshServer();

	//$scope.server = 

}]);


nodedashApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'data/summary.partial.html',
        controller: 'DashboardController',
        label: 'Summary'
      }).
      when('/detail/:serverId', {
      	templateUrl: 'data/detail.partial.html',
      	controller: 'DetailController',
      	label: 'Details'
      }).                                        
      // when('/phones/:phoneId', {
      //   templateUrl: 'partials/phone-detail.html',
      //   controller: 'PhoneDetailCtrl'
      // }).
      otherwise({
        redirectTo: '/'
      });
  }]);


