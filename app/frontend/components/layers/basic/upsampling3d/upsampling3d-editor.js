'use strict';

angular
.module('upsampling3dEditor', ['ngMaterial'])
.directive('upsampling3dEditor', function () {
    return {
        scope: {
            layerId: '@'
        },
        templateUrl: "frontend/components/layers/basic/upsampling3d/upsampling3d-editor.html",
        controller: function ($scope, networkDataService, upsampling3dLayer) {
            this.$onInit = function () {
                setUpLayerParams(networkDataService.getLayerById($scope.layerId).params);

                $scope.subsamplingTypeList = upsampling3dLayer.getSubSamplingTypes();

                $scope.$watch('params', function (params) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    updateLayer(layer, params);
                }, true);                

                function updateLayer(layer, params) {
                    layer.params.subsamplingType = params.subsamplingType;
                    layer.params.subsamplingSizeWidth  = params.subsamplingSizeWidth;
                    layer.params.subsamplingSizeHeight = params.subsamplingSizeHeight;
                    layer.params.subsamplingSizeDepth  = params.subsamplingSizeDepth;
                }

                function setUpLayerParams(params) {
                    $scope.params = {};
                    $scope.params.subsamplingType = params.subsamplingType;
                    $scope.params.subsamplingSizeWidth  = params.subsamplingSizeWidth;
                    $scope.params.subsamplingSizeHeight = params.subsamplingSizeHeight;
                    $scope.params.subsamplingSizeDepth  = params.subsamplingSizeDepth;
                }
            }
        }
    };
});