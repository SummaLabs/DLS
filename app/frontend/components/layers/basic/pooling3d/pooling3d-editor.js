'use strict';

angular
.module('pooling3dEditor', ['ngMaterial'])
.directive('pooling3dEditor', function () {
    return {
        scope: {
            layerId: '@',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/basic/pooling3d/pooling3d-editor.html",
        controller: function ($scope, networkDataService, pooling3dLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope, networkDataService);

                $scope.subsamplingTypeList = pooling3dLayer.getSubSamplingTypes();

                $scope.onSubmit = function () {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    editLayer(layer);
                    networkDataService.pubNetworkUpdateEvent();
                    $scope.doOnSubmit();
                };

                function editLayer(layer) {
                    layer.params.subsamplingType = $scope.subsamplingType;
                    layer.params.subsamplingSize = $scope.subsamplingSize;
                }

                function setUpLayerParams($scope, networkDataService) {
                    var layerParams = networkDataService.getLayerById($scope.layerId).params;
                    $scope.subsamplingType = layerParams.subsamplingType;
                    $scope.subsamplingSize = layerParams.subsamplingSize;
                }
            }
        }
    };
});