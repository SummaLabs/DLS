'use strict';

angular
.module('mergeEditor', ['ngMaterial'])
.directive('mergeEditor', function () {
    return {
        scope: {
            layerId: '@',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/basic/merge/merge-editor.html",
        controller: function ($scope, networkDataService, mergeLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope, networkDataService);
                $scope.mergeTypesList = mergeLayer.getMergeTypes();
                $scope.mergeAxisList = mergeLayer.getMergeAxis();

                $scope.onSubmit = function () {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    editLayer(layer);
                    networkDataService.pubNetworkUpdateEvent();
                    $scope.doOnSubmit();
                };

                function editLayer(layer) {
                    layer.params.mergeType = $scope.mergeType;
                    layer.params.mergeAxis = $scope.mergeAxis;
                    layer.params.isTrainable = $scope.isTrainable;
                }

                function setUpLayerParams($scope, networkDataService) {
                    var layerParams = networkDataService.getLayerById($scope.layerId).params;
                    $scope.mergeType = layerParams.mergeType;
                    $scope.mergeAxis = layerParams.mergeAxis;
                    $scope.isTrainable = layerParams.isTrainable;
                }
            }
        }
    };
});