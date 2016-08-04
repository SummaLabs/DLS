(function () {
  'use strict';
  angular
      .module('inputDataEditor', ['ngMaterial'])
	  .directive('inputDataEditor', function() {
		  return {
			  scope: {
				  layerId: '=',
				  doOnSubmit: '&'
			  },
			  templateUrl: "frontend/components/layers/data/input-data-editor.html",
			  controller: function ($scope, networkDataService) {
				  $scope.dataset_types = [
					  {	value: "Image", 	text: "Image"},
					  {	value: "CSV", 		text: "CSV"	}
				  ];

				  $scope.dataset_ids = [
					  {	value: "load1", 	text: "load1"	},
					  {	value: "load2", 	text: "load2"	}
				  ];

				  $scope.onSubmit = function () {
					  var layer = networkDataService.getLayerById($scope.layerId);
					  editLayer(layer);
					  networkDataService.notifyNetworkUpdate();
					  $scope.doOnSubmit();
				  };

				  function editLayer(layer) {
					  layer.params.datasetType = $scope.dataset_type;
					  layer.params.datasetId = $scope.dataset_id;
				  }
			  }
		  }
	  });
})();