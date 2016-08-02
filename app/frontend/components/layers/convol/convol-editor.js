(function () {
    'use strict';

    angular
        .module('convolEditor', ['ngMaterial'])
        .directive('convolEditor', function () {
            return {
                scope: {
                    layerId: '=',
                    action: '&'
                },
                templateUrl: "frontend/components/layers/convol/convol-editor.html",
                controller: function ($scope, networkDataService) {
                    $scope.act_funcs = [
                            {value: "Sigmoid", text: "Sigmoid"},
                            {value: "Tanh", text: "Tanh"},
                            {value: "ReLU", text: "ReLU"}
                        ];

                    $scope.subsample_types = [
                            {value: "MaxPooling", text: "Max Pooling"},
                            {value: "AveragePooling", text: "Average Pooling"}
                        ];

                    $scope.onSubmit = function () {
                        var layerToEdit = networkDataService.getLayerById(1);
                        $scope.action();
                        alert("Alert");
                    }
                }
            };
        });

})();