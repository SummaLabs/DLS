'use strict';

angular
.module('pooling3dEditor', ['ngMaterial'])
.directive('pooling3dEditor', function () {
    return {
        scope: {
            layerData: '='
        },
        templateUrl: "frontend/components/layers/basic/pooling3d/pooling3d-editor.html",
        controller: function ($scope, networkDataService, pooling3dLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope.layerData.params);

                $scope.subsamplingTypeList = pooling3dLayer.getSubSamplingTypes();

                $scope.$watch('params', function (params) {
                    updateLayer($scope.layerData, params);
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