angular.module('myApp', ['myApp.controllers', 'myApp.directives']);

angular.module('myApp.controllers', []).controller('ctrl', ['$scope', function($scope){

	$scope.localLog = [];
	$scope.passworded = false;
	$scope.luggageCombo = "wasd";

	$scope.passattempt = prompt("please enter your password");

	$scope.$watch('passattempt', function(newVal){
		if(newVal === $scope.luggageCombo){
			$scope.passworded = true;
		}
		else{
			window.location.reload();
		}
	});


	var socket = io.connect('http://localhost:8080');

	socket.on('message', function (data) {
		if(data.message) {
			$scope.localLog.push(data);
			if($scope.localLog.length > 10){
				$scope.localLog=$scope.localLog.slice(1);
			}
			$scope.$apply();
		} else {
			console.log("There is a problem:", data);
		}
	});

	socket.on('log', function (data) {
		if(data.message) {
			$scope.localLog = data.message;
			$scope.$apply();
		} else {
			console.log("There is a problem:", data);
		}
	});

	$scope.send = function(){
		socket.emit('send', { message: $scope.inputtext });
		//$scope.localLog.push({ message: $scope.inputtext });
	}

	$scope.postPicture = function(picUrl){
		socket.emit('send', { message: picUrl });
	}

}]);

angular.module('myApp.directives', []).directive('screen', function(){

	return {
		restrict: 'A',
		scope: {
			sendPicture: '&'
		},
		template: '<canvas id="viz" ng-mousedown="clicking = true" ng-mouseup="clicking = false;" ng-mouseleave="clicking = false;"></canvas>' + 
			'<br/><button ng-click="sendPicture({message:dataUrl})">send</button><button ng-click="erase()">erase</button>',
		link: function(scope, element, attrs){

			scope.canvas = document.getElementById('viz');
			scope.context = scope.canvas.getContext('2d');
			scope.canvas.width = scope.canvas.height = 200;

			scope.clicking = false;
			scope.lastPosition= {x:0, y:0};
			scope.dataUrl = '';

			scope.pencil = function(event){
				if(scope.clicking){
					scope.context.beginPath();
					scope.context.strokeStyle = 'black';
					scope.context.moveTo(scope.lastPosition.x, scope.lastPosition.y);
					scope.context.lineTo(event.offsetX, event.offsetY);
					scope.lastPosition.x = event.offsetX;
					scope.lastPosition.y = event.offsetY;
					scope.context.closePath();
					scope.context.stroke();
				}
				scope.lastPosition.x = event.offsetX;
				scope.lastPosition.y = event.offsetY;
				
			};

			scope.erase = function(){
				scope.context.clearRect(0,0,scope.canvas.width, scope.canvas.height);
			};

			scope.$watch('clicking', function(newVal, oldVal){
				if(!newVal && oldVal){
					scope.dataUrl = '<img src="'+scope.canvas.toDataURL()+'"/>';
				}
			})

			element.bind('mousemove', function(event){
				scope.pencil(event);
			});


		}
	};
})

.directive('dirtyList', function(){
	return {
		restrict: 'A',
		scope: {
			asset: '@'
		},
		replace: true,
		template: '<li></li>',
		link: function(scope, element, attrs){
			scope.$watch('asset', function(newVal, oldVal){
				if(scope.asset !== undefined && scope.asset.length){
					element[0].innerHTML = scope.asset;
				}
			});
		}
	};
});