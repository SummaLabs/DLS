'use strict';
angular
.module('inputDataEditor', ['ngMaterial'])
.directive('inputDataEditor', function () {
    return {
        scope: {
            layerId: '@'
        },
        templateUrl: "frontend/components/layers/data/input-data-editor.html",
        controller: function ($scope, networkDataService, layerService, datasetService) {
            this.$onInit = function () {
                datasetService.getDatasetsInfoStatList().then(
                    function successCallback(response) {
                        var loadedDataSets = response.data;
                        var dataSets = [];
                        for(var ii=0; ii<loadedDataSets.length; ii++) {
                            var info = {
                                id:     loadedDataSets[ii].id,
                                text:   loadedDataSets[ii].name + ' (' + loadedDataSets[ii].id + ')',
                                shape:  loadedDataSets[ii].shapestr
                            };
                            dataSets.push(info);
                        }
                        setUpLayerParams(dataSets);
                    }, function errorCallback(response) {
                        console.log(response.data);
                    });


                $scope.$watch('selectedDataSet', function (selectedDataSet) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    if (selectedDataSet != null)
                        layer.params.datasetId = selectedDataSet.id;
                }, true);


                function setUpLayerParams(dataSets) {
                    $scope.dataSets = dataSets;
                    var currentLayer = networkDataService.getLayerById($scope.layerId);
                    var savedParams = currentLayer.params;
                    var savedDataSetIndex = -1;
                    for (var i = 0; i < dataSets.length; i++) {
                        if (savedParams['datasetId'] == dataSets[i].id) {
                            savedDataSetIndex = i;
                        }
                    }
                    if (savedDataSetIndex > -1) {
                        $scope.selectedDataSet = dataSets[savedDataSetIndex];
                    } else {
                        if(dataSets.length > 0) {
                            $scope.selectedDataSet = dataSets[0];
                        }
                        currentLayer.params = layerService.getLayerByType(currentLayer.layerType).params;
                    }
                }
            }
        }
    }
});
