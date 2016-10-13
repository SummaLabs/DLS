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
        controller: function ($scope, networkDataService, layerService, dbinfoService, dataLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope, networkDataService, layerService);
                $scope.datasetTypeList = dataLayer.getDataTypes();
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
                        if($scope.datasetIdList.length>0) {
                            $scope.selectedDB = $scope.datasetIdList[0];
                        }
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
                    layer.params.datasetType = $scope.datasetType;
                    if ($scope.selectedDB)
                        layer.params.datasetId = $scope.selectedDB.id;
                }

                function setUpLayerParams($scope, networkDataService, layerService) {
                    var currentLayer = networkDataService.getLayerById($scope.layerId);
                    var savedParams = currentLayer.params;
                    var defaultParams = layerService.getLayerByType(currentLayer.layerType).params;
                    setUpParam($scope, savedParams, defaultParams, 'datasetType');
                    setUpParam($scope, savedParams, defaultParams, 'datasetId');
                }

                function setUpParam($scope, savedParams, defaultParams, param) {
                    if (savedParams[param] == "") {
                        $scope[param] = defaultParams[param];
                    } else {
                        $scope[param] = savedParams[param];
                    }
                }
            }
        }
    }
});
