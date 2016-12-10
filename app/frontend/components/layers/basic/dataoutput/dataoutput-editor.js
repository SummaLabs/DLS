'use strict';
angular
.module('dataoutputEditor', ['ngMaterial'])
.directive('dataoutputEditor', function () {
    return {
        scope: {
            layerId: '@'
        },
        templateUrl: "frontend/components/layers/basic/dataoutput/dataoutput-editor.html",
        controller: function ($scope, networkDataService, layerService, datasetService, dataoutputLayer) {
            this.$onInit = function () {
                datasetService.getDatasetsInfoStatList().then(
                    function successCallback(response) {
                        var loadedDataSets = response.data;
                        var dataSets = [];
                        for (var ii = 0; ii < loadedDataSets.length; ii++) {
                            var info = {
                                id: loadedDataSets[ii].id,
                                text: loadedDataSets[ii].name + ' (' + loadedDataSets[ii].id + ')',
                                shape: loadedDataSets[ii].shapestr,
                                numLabels: loadedDataSets[ii].info.numLabels
                            };
                            dataSets.push(info);
                        }
                        setUpLayerParams(dataSets);
                    },
                    function errorCallback(response) {
                        console.log(response.data);
                    });

                $scope.$watch('lossFunction', function (lossFunction) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    if (lossFunction != null) {
                        layer.params.lossFunction = lossFunction;
                    }
                });

                $scope.$watch('selectedDataSet', function (selectedDataSet) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    if (selectedDataSet != null)
                        layer.params.datasetId = selectedDataSet.id;
                });

                function setUpLayerParams(dataSets) {
                    $scope.lossFunctionList = dataoutputLayer.getLossFunctions();
                    $scope.lossFunction = $scope.lossFunctionList[0].value;
                    $scope.dataSets = dataSets;
                    var currentLayer = networkDataService.getLayerById($scope.layerId);
                    var savedParams = currentLayer.params;

                    if (savedParams.lossFunction) {
                        $scope.lossFunction = savedParams.lossFunction;
                    }

                    var savedDataSetIndex = -1;
                    for (var i = 0; i < dataSets.length; i++) {
                        if (savedParams['datasetId'] == dataSets[i].id) {
                            savedDataSetIndex = i;
                        }
                    }
                    if (savedDataSetIndex > -1) {
                        $scope.selectedDataSet = dataSets[savedDataSetIndex];
                    } else {
                        if (dataSets.length > 0) {
                            $scope.selectedDataSet = dataSets[0];
                        }
                        currentLayer.params = layerService.getLayerByType(currentLayer.layerType).params;
                    }
                }
            }
        }
    }
});