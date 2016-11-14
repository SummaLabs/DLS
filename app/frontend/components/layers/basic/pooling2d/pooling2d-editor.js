'use strict';

angular
.module('pooling2dEditor', ['ngMaterial'])
.directive('pooling2dEditor', function () {
    return {
        scope: {
            layerId: '@',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/basic/pooling2d/pooling2d-editor.html",
        controller: function ($scope, networkDataService, pooling2dLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope, networkDataService);
                $scope.subsamplingTypeList = pooling2dLayer.getSubSamplingTypes();

                $scope.onSubmit = function () {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    editLayer(layer);
                    networkDataService.pubNetworkUpdateEvent();
                    $scope.doOnSubmit();
                };

                function editLayer(layer) {
                    layer.params.subsamplingType = $scope.subsamplingType;
                    layer.params.subsamplingSizeWidth  = $scope.subsamplingSizeWidth;
                    layer.params.subsamplingSizeHeight = $scope.subsamplingSizeHeight;
                }

                function setUpLayerParams($scope, networkDataService) {
                    var layerParams = networkDataService.getLayerById($scope.layerId).params;
                    $scope.subsamplingType = layerParams.subsamplingType;
                    $scope.subsamplingSizeWidth = layerParams.subsamplingSizeWidth;
                    $scope.subsamplingSizeHeight = layerParams.subsamplingSizeHeight;
                }
            }
        }
    };
});