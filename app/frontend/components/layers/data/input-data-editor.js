'use strict';
angular
.module('inputDataEditor', ['ngMaterial'])
.directive('inputDataEditor', function () {
    return {
        scope: {
            layerId: '@',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/data/input-data-editor.html",
        controller: function ($scope, networkDataService, layerService, dbinfoService) {
            this.$onInit = function () {
                $scope.selectedDB = null;
                $scope.datasetIdList = null;

                dbinfoService.getDatasetsInfoStatList().then(
                    function successCallback(response) {
                        var tinfo = response.data;
                        var tlist = [];
                        for(var ii=0; ii<tinfo.length; ii++) {
                            var tmp = {
                                id:     tinfo[ii].id,
                                text:   tinfo[ii].name + ' (' + tinfo[ii].id + ')',
                                shape:  tinfo[ii].shapestr
                            };
                            tlist.push(tmp);
                        }
                        $scope.datasetIdList = tlist;
                        if($scope.datasetIdList.length > 0) {
                            $scope.selectedDB = $scope.datasetIdList[0];
                        }
                        setUpLayerParams($scope, tlist, networkDataService, layerService);
                    },
                    function errorCallback(response) {
                        console.log(response.data);
                    });


                $scope.onSubmit = function () {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    editLayer(layer);
                    networkDataService.pubNetworkUpdateEvent();
                    $scope.doOnSubmit();
                };

                function editLayer(layer) {
                    if ($scope.selectedDB)
                        layer.params.datasetId = $scope.selectedDB.id;
                }

                function setUpLayerParams($scope, dataSetList, networkDataService, layerService) {
                    var currentLayer = networkDataService.getLayerById($scope.layerId);
                    var savedParams = currentLayer.params;
                    var savedDataSetIndex = -1;
                    for (var i = 0; i < dataSetList.length; i++) {
                        if (savedParams['datasetId'] == dataSetList[i].id) {
                            savedDataSetIndex = i;
                        }
                    }
                    if (savedDataSetIndex > -1) {
                        $scope.selectedDB = $scope.datasetIdList[savedDataSetIndex];
                    } else {
                        if(dataSetList.length > 0) {
                            $scope.selectedDB = dataSetList[0];
                        }
                        currentLayer.params = layerService.getLayerByType(currentLayer.layerType).params;
                    }
                }
            }
        }
    }
});
