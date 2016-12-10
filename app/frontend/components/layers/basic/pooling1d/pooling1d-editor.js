'use strict';

angular
.module('pooling1dEditor', ['ngMaterial'])
.directive('pooling1dEditor', function () {
    return {
        scope: {
            layerId: '@'
        },
        templateUrl: "frontend/components/layers/basic/pooling1d/pooling1d-editor.html",
        controller: function ($scope, networkDataService, pooling1dLayer) {
            this.$onInit = function () {
                setUpLayerParams(networkDataService.getLayerById($scope.layerId).params);
                $scope.subsamplingTypeList = pooling1dLayer.getSubSamplingTypes();
                

                $scope.$watch('params', function (params) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    updateLayer(layer, params);
                }, true);

                function updateLayer(layer, params) {
                    layer.params.subsamplingType = params.subsamplingType;
                    layer.params.subsamplingSizeWidth = params.subsamplingSizeWidth;
                }

                function setUpLayerParams(params) {
                    $scope.params = {};
                    $scope.params.subsamplingType = params.subsamplingType;
                    $scope.params.subsamplingSizeWidth = params.subsamplingSizeWidth;
                }
            }
        }
    };
});