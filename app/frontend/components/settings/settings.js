'use strict';
angular.module('settings', ['ngMaterial'])
.component('settings', {
    templateUrl: '/frontend/components/settings/settings.html',
    bindings: {
        listModels:     '<',
        selectedModel:  '<',
        dataResponse:   '<'
    },
    controller: function ($mdDialog, $rootScope, networkDataService, appConfig, modelsService, $http) {
        var self = this;
        self.$onInit = function () {
            self.dataResponse = '';
            modelsService.listInfo().then(
            function successCallback(response) {
                self.listModels = response.data;
                if(self.listModels.length>0) {
                    self.selectedModel = self.listModels[0];
                }
            },
            function errorCallback(response) {
                console.log(response.data);
            });
        };
        //
        self.createImagesSelectionDialog = function($scope, event) {
            if(self.selectedModel) {
                appConfig.fileManager.pickFile = true;
                appConfig.fileManager.pickFolder = false;
                appConfig.fileManager.singleSelection = false;
                // $scope.modelId =
                $mdDialog.show({
                    controller: function ($scope, $mdDialog, $rootScope, $http, modelId) {
                        $scope.select = function(answer) {
                        $mdDialog.hide(answer);
                        // $scope.modelId = modelId;
                        var listPaths = [];
                        $rootScope.selectedFiles.forEach(function(item, i, array) {
                            console.log(item.model.fullPath(), item.model.name, item.model.type, item.model.size );
                            listPaths.push(item.model.fullPath());
                        });
                        $http({
                            method: 'POST',
                            url:    '/models/inference/',
                            data:   {
                                'files':    listPaths,
                                'modelid':  modelId
                            }
                        }).then(
                            function successCallback(response) {
                                self.dataResponse = response.data;
                            },
                            function errorCallback(response) {
                                console.log(response.data);
                            });
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                    },
                    templateUrl: 'frontend/components/dialog/file-manager.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose:false,
                    locals: {
                        modelId: ''+self.selectedModel.info.id
                    }
                });
            }
        };
    }
});
