(function () {
    'use strict';

    angular
        .module('convolEditor', ['ngMaterial'])
        .directive('convolEditor', function () {
            return {
                scope: {
                    layerId: '=',
                    doOnSubmit: '&'
                },
                templateUrl: "frontend/components/layers/convol/convol-editor.html",
                controller: function ($scope, networkDataService) {
                    $scope.act_func_selected = {value: "ReLU", text: "ReLU"};
                    $scope.act_funcs = [
                            {value: "ReLU", text: "ReLU"},
                            {value: "Sigmoid", text: "Sigmoid"},
                            {value: "Tanh", text: "Tanh"}
                        ];

                    $scope.subsample_type_selected = {value: "MaxPooling", text: "Max Pooling"};
                    $scope.subsample_types = [
                            {value: "MaxPooling", text: "Max Pooling"},
                            {value: "AveragePooling", text: "Average Pooling"}
                        ];

                    $scope.onSubmit = function () {
                        var layer = networkDataService.getLayerById($scope.layerId);
                        editLayer(layer);
                        networkDataService.pubNetworkUpdateEvent();
                        $scope.doOnSubmit();
                    };
                    
                    function editLayer(layer) {
                        layer.params.filtersCount = $scope.filters_count;
                        layer.params.filterWidth = $scope.filter_width;
                        layer.params.filterHeight = $scope.filter_height;
                        layer.params.activationFunction = $scope.act_func_selected;
                        layer.params.subsamplingType = $scope.subsample_type_selected;
                        layer.params.subsamplingSize = $scope.subsampling_size;
                    }
                }
            };
        });

})();