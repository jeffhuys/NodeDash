var nodedashApp = angular.module('nodedashApp', ['ngRoute', 'services.breadcrumbs', 'nvd3ChartDirectives']);

nodedashApp.controller('RootController', ['$scope', 'breadcrumbs', function($scope, breadcrumbs) {
	console.log("Root controller executed...");

	$scope.breadcrumbs = breadcrumbs;

	$scope.config = {};
	$scope.config.socketAddress = 'cube.writebrite.nl:6278';

	$scope.reconnect = function() {
		if($scope.socket) {
			$scope.socket.removeAllListeners();
			if($scope.socket.connected) {
				$scope.socket.disconnect();
				io.disconnect();
			}
		}
		$scope.servers = [];
		$scope.refreshSeconds = 1;
		$scope.detailRefreshSeconds = 1;

		console.log($scope.config.socketAddress);

	  	$scope.socket = io.connect($scope.config.socketAddress, {'force new connection':true});

	  	$scope.socket.on('identify', function() {
	  		$scope.socket.emit('identify', {what: "client"});
	  	});

	  	$scope.socket.on('stats', function(data) {
			// Check if the server is already being tracked.
			// If true, we will change the data already available.
			// If false, we will append the data to the array.
			//console.dir(data);

			var exists = false;
			var index = -1;
			for (var i = 0; i < $scope.servers.length; i++) {
				if($scope.servers[i].data.stats.hostname == data.stats.hostname) {
					exists = true;
					index = i;
				}
			};

			if(!exists) {
				var pushData = {};
				pushData.data = data;
				var newindex = $scope.servers.push(pushData) - 1;
				$scope.servers[newindex].healthy = true;
				$scope.servers[newindex].lastseen = Math.round(new Date().getTime() / 1000);
				
				$scope.servers[newindex].chart = {};
				$scope.servers[newindex].chart = [
					{
						"key": "RAM",
						"color": "#7f8c8d",
						"values": []
					},
					{	
						"key": "CPU",
						"color": "#16a085",
						"values": []
					},
					{
						"key": "Events/second",
						"color": "#c0392b",
						"values": []
					}
					];

				console.log($scope.servers[newindex].chart[0].values);
				//$scope.$apply();

				//console.log("Applied");

				//console.table($scope.servers);
			} else {
				$scope.servers[index].data = data;
				//console.log($scope.servers[index]);
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
				

				
				// if(!$scope.servers[i].chart) {
				// 	$scope.servers[i].chart = {};
				// 	$scope.servers[i].chart = [
				// 	{
				// 		"key": "Visitors",
				// 		"values": [ [0, 0] ]
				// 	}];
				// }

				if(!$scope.servers[i].chart) {

					//$scope.servers[i].chart[0].values.push([ new Date().getTime(), $scope.servers[i].stats.events_per_second]);
					console.log("Yes");
					console.dir($scope.servers.chart[0]);
				} else {
					//console.log("No");
				}

				//if($scope.servers[i].data.stats.events_per_second != undefined) {
				//	$scope.servers[i].chart[0].values.push([ new Date().getTime(), $scope.servers[i].data.stats.events_per_second]);
				//} else {
					
				//}

				$scope.servers[i].chart[0].values.push([ new Date().getTime(), Math.round(100-($scope.servers[i].data.stats.freemem/$scope.servers[i].data.stats.totalmem) * 100) ] );
				$scope.servers[i].chart[1].values.push([ new Date().getTime(), $scope.servers[i].data.stats.cpu]);
				$scope.servers[i].chart[2].values.push([ new Date().getTime(), $scope.servers[i].data.stats.events_per_second]);


				for (var j = 0; j < $scope.servers[i].chart.length; j++) {
					if($scope.servers[i].chart[j].values.length > 60) {
						$scope.servers[i].chart[j].values.shift();
					}
				};

				
				console.log($scope.servers[i].chart[0].values);
				//$scope.servers[i].chart[0].values[0] = [0, Math.random() * 100];

				$scope.$apply();
	  		};
	  		setTimeout($scope.checkServers, 1000);
	  	};
	  	$scope.checkServers();
	};
	$scope.reconnect();

	$scope.xAxisTickFormat = function(){
    	return function(d){
        	return d3.time.format('%X')(new Date(d));
        }
	};


	$scope.colorFunction = function() {
		return function(d, i) {
			if(i == 0) {
				return '#000000';
			}
			if(i == 1) {
				return '#537295';
			}
    		return '#E01B5D'
    	};
	}



}]);

nodedashApp.controller('DashboardController', ['$scope', '$rootScope', function ($scope, $rootScope) {

}]);

nodedashApp.controller('ConfigController', ['$scope', function ($scope) {
	console.log($scope.config.socketAddress);

	$scope.saveSettings = function() {
			console.log("Connecting to... " + $scope.config.socketAddress);
			$scope.reconnect();
	};

}]);

nodedashApp.controller('DetailController', ['$scope', '$rootScope', '$routeParams', function ($scope, $rootScope, $routeParams) {
	$scope.serverId = $routeParams.serverId;

  	$scope.refreshServer = function() {
  		//console.log("Refresh..." + $scope.refreshSeconds);
		for (var i = 0; i < $scope.servers.length; i++) {
			if($scope.serverId == $scope.servers[i].data.stats.hostname) {
				$scope.server = $scope.servers[i];
			}
		};
  		setTimeout($scope.refreshServer, $scope.refreshSeconds * 1000);
  	};
  	$scope.refreshServer();


$scope.exampleData = [
	{
		"key": "Visitors",
		"values": [ [0, 1] ]
	}];

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
      when('/config', {
      	templateUrl: 'data/config.partial.html',
      	controller: 'ConfigController',
      	label: 'Configuration'
      }).
      // when('/phones/:phoneId', {
      //   templateUrl: 'partials/phone-detail.html',
      //   controller: 'PhoneDetailCtrl'
      // }).
      otherwise({
        redirectTo: '/'
      });
  }]);


