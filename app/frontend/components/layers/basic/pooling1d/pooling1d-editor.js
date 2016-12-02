'use strict';

angular
.module('pooling1dEditor', ['ngMaterial'])
.directive('pooling1dEditor', function () {
    return {
        scope: {
            layerId: '@',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/basic/pooling1d/pooling1d-editor.html",
        controller: function ($scope, networkDataService, pooling1dLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope, networkDataService);
                $scope.subsamplingTypeList = pooling1dLayer.getSubSamplingTypes();

                $scope.onSubmit = function () {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    editLayer(layer);
                    networkDataService.pubNetworkUpdateEvent();
                    $scope.doOnSubmit();
                };

                function editLayer(layer) {
                    layer.params.subsamplingType = $scope.subsamplingType;
                    layer.params.subsamplingSizeWidth = $scope.subsamplingSizeWidth;
                }

                function setUpLayerParams($scope, networkDataService) {
                    var layerParams = networkDataService.getLayerById($scope.layerId).params;
                    $scope.subsamplingType = layerParams.subsamplingType;
                    $scope.subsamplingSizeWidth = layerParams.subsamplingSizeWidth;
                }
            }
        }
    };
});