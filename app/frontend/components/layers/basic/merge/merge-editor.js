'use strict';

angular
.module('mergeEditor', ['ngMaterial'])
.directive('mergeEditor', function () {
    return {
        scope: {
            layerId: '@'
        },
        templateUrl: "frontend/components/layers/basic/merge/merge-editor.html",
        controller: function ($scope, networkDataService, mergeLayer) {
            this.$onInit = function () {
                setUpLayerParams(networkDataService.getLayerById($scope.layerId).params);
                $scope.mergeTypesList = mergeLayer.getMergeTypes();
                $scope.mergeAxisList = mergeLayer.getMergeAxis();
                

                $scope.$watch('params', function (params) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    updateLayer(layer, params);
                }, true);

                function updateLayer(layer, params) {
                    layer.params.mergeType = params.mergeType;
                    layer.params.mergeAxis = params.mergeAxis;
                    layer.params.isTrainable = params.isTrainable;
                }

                function setUpLayerParams(params) {
                    $scope.params = {};
                    $scope.params.mergeType = params.mergeType;
                    $scope.params.mergeAxis = params.mergeAxis;
                    $scope.params.isTrainable = params.isTrainable;
                }
            }
        }
    };
});