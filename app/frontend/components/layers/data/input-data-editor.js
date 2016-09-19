(function () {
    'use strict';
    angular
        .module('inputDataEditor', ['ngMaterial'])
        .directive('inputDataEditor', function () {
            return {
                scope: {
                    layerId: '@',
                    doOnSubmit: '&'
                },
                templateUrl: "frontend/components/layers/data/input-data-editor.html",
                controller: function ($scope, networkDataService, networkLayerService) {
                    this.$onInit = function () {
                        setUpLayerParams($scope, networkDataService, networkLayerService);
                        $scope.datasetTypeList = [
                            {value: "Image", text: "Image"},
                            {value: "CSV", text: "CSV"}
                        ];

                        $scope.datasetIdList = [
                            {value: "load1", text: "load1"},
                            {value: "load2", text: "load2"},
                            {value: "load3", text: "load3"},
                            {value: "load4", text: "load4"}
                        ];

                        $scope.onSubmit = function () {
                            var layer = networkDataService.getLayerById($scope.layerId);
                            editLayer(layer);
                            networkDataService.pubNetworkUpdateEvent();
                            $scope.doOnSubmit();
                        };

                        function editLayer(layer) {
                            layer.params.datasetType = $scope.datasetType;
                            layer.params.datasetId = $scope.datasetId;
                        }

                        function setUpLayerParams($scope, networkDataService, networkLayerService) {
                            var currentLayer = networkDataService.getLayerById($scope.layerId);
                            var savedParams = currentLayer.params;
                            var defaultParams = networkLayerService.getLayerByType(currentLayer.name).params;
                            setUpParam($scope, savedParams, defaultParams, 'datasetType');
                            setUpParam($scope, savedParams, defaultParams, 'datasetId');
                        }

                        function setUpParam($scope, savedParams, defaultParams, param) {
                            if (savedParams[param] == "") {
                                $scope[param] = defaultParams[param];
                            } else {
                                $scope[param] = savedParams[param];
                            }
                        }
                    }
                }
            }
        });
})();