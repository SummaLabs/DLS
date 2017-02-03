'use strict';
angular
.module('datainputEditor', ['ngMaterial'])
.directive('datainputEditor', function () {
    return {
        scope: {
            layerData: '=',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/basic/datainput/datainput-editor.html",
        controller: function ($scope, networkDataService, layerService, datasetService, datainputLayer) {
            this.$onInit = function () {
                datasetService.getDataSetsMetadata().then(
                    function successCallback(response) {
                        var loadedDataSets = response.data;
                        var dataSets = [];
                        for(var ii=0; ii<loadedDataSets.length; ii++) {
                            var info = {
                                id:     loadedDataSets[ii].id,
                                text:   loadedDataSets[ii].name + ' (' + loadedDataSets[ii].id + ')',
                                shape:  loadedDataSets[ii].shapestr,
                                shapeObject:  loadedDataSets[ii].shape
                            };
                            dataSets.push(info);
                        }
                        setUpLayerParams(dataSets);
                    }, function errorCallback(response) {
                        console.log(response.data);
                    });


                $scope.$watch('selectedDataSet', function (selectedDataSet) {
                    if (selectedDataSet != null) {
                        // console.log($scope.layerData);
                        if (!$scope.layerData.hasOwnProperty('params'))
                            $scope.layerData.params = {};
                        $scope.layerData.params.datasetId = selectedDataSet.id;
                        $scope.layerData.shapeInp = [
                            null,
                            selectedDataSet.shapeObject.channels,
                            selectedDataSet.shapeObject.height,
                            selectedDataSet.shapeObject.width
                        ];
                    }
                }, true);


                function setUpLayerParams(dataSets) {
                    $scope.dataSets = dataSets;
                    var savedParams = $scope.layerData.params;
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
                        $scope.layerData.params = layerService.getLayerByType($scope.layerData.layerType).params;
                    }
                }
            }
        }
    }
});
