'use strict';

angular
.module('upsampling2dEditor', ['ngMaterial'])
.directive('upsampling2dEditor', function () {
    return {
        scope: {
            // layerId: '@'
            layerData: '='
        },
        templateUrl: "frontend/components/layers/basic/upsampling2d/upsampling2d-editor.html",
        controller: function ($scope, networkDataService, upsampling2dLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope.layerData.params);

                $scope.$watch('params', function (params) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    updateLayer($scope.layerData, params);
                }, true);                

                function updateLayer(layer, params) {
                    layer.params.subsamplingSizeWidth  = params.subsamplingSizeWidth;
                    layer.params.subsamplingSizeHeight = params.subsamplingSizeHeight;
                }

                function setUpLayerParams(params) {
                    $scope.params = {};
                    $scope.params.subsamplingSizeWidth = params.subsamplingSizeWidth;
                    $scope.params.subsamplingSizeHeight = params.subsamplingSizeHeight;
                }
            }
        }
    };
});