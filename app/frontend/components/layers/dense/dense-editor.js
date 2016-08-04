(function () {
  'use strict';
  angular
      .module('denseEditor', ['ngMaterial'])
	  .directive('denseEditor', function() {
		  return {
			  scope: {
				  layerId: '=',
				  doOnSubmit: '&'
			  },
			  templateUrl: "frontend/components/layers/dense/dense-editor.html",
			  controller: function ($scope, networkDataService) {
				  $scope.activation_funcs = [
					  {	value: "Sigmoid", 	text: "Sigmoid"	},
					  {	value: "Tanh", 		text: "Tanh"	},
					  {	value: "ReLU", 		text: "ReLU"	},
					  {	value: "SoftMax", 	text: "SoftMax"	}
				  ];

				  $scope.onSubmit = function () {
					  var layer = networkDataService.getLayerById($scope.layerId);
					  editLayer(layer);
					  networkDataService.notifyNetworkUpdate();
					  $scope.doOnSubmit();
				  };

				  function editLayer(layer) {
					  layer.params.activationFunction = $scope.activation_func;
					  layer.params.neuronsCount = $scope.neurons_count;
				  }
			  }
		  }
	  });
	  
	  
})();