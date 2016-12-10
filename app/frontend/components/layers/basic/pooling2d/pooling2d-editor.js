'use strict';

angular
.module('pooling2dEditor', ['ngMaterial'])
.directive('pooling2dEditor', function () {
    return {
        scope: {
            layerId: '@'
        },
        templateUrl: "frontend/components/layers/basic/pooling2d/pooling2d-editor.html",
        controller: function ($scope, networkDataService, pooling2dLayer) {
            this.$onInit = function () {
                setUpLayerParams(networkDataService.getLayerById($scope.layerId).params);
                $scope.subsamplingTypeList = pooling2dLayer.getSubSamplingTypes();

                $scope.$watch('params', function (params) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    updateLayer(layer, params);
                }, true);                

                function updateLayer(layer, params) {
                    layer.params.subsamplingType = params.subsamplingType;
                    layer.params.subsamplingSizeWidth  = params.subsamplingSizeWidth;
                    layer.params.subsamplingSizeHeight = params.subsamplingSizeHeight;
                }

                function setUpLayerParams(params) {
                    $scope.params = {};
                    $scope.params.subsamplingType = params.subsamplingType;
                    $scope.params.subsamplingSizeWidth = params.subsamplingSizeWidth;
                    $scope.params.subsamplingSizeHeight = params.subsamplingSizeHeight;
                }
            }
        }
    };
});