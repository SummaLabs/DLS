'use strict';
angular.module('testRocTask', ['ngMaterial'])
.component('testRocTask', {
    templateUrl: '/frontend/components/test-ui/test-roc-task.html',
    bindings: {
        listModels:         '<',
        selectedModel:      '<',
        listDatasets:       '<',
        selectedDataset:    '<'
    },
    controller: function ($mdDialog, $mdToast, $location, modelsService, dbinfoService, taskManagerService) {
        var self = this;
        self.$onInit = function () {
            // (1) Load Models Info:
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
            // (2) Load Datasets Info:
            dbinfoService.getDatasetsInfoStatList().then(
                function successCallback(response) {
                    self.listDatasets = response.data;
                    if(self.listDatasets.length>0) {
                        self.selectedDataset = self.listDatasets[0];
                    }
                },
                function errorCallback(response) {
                    console.log(response.data);
                });
        };
        self.runTaskROC = function () {
            var params = {
                'model-id':     self.selectedModel.info.id,
                'dataset-id':   self.selectedDataset.id
            };
            $location.url('/task');
            taskManagerService.startTask('roc-image2d-cls',params).then(
                function successCallback(response) {
                    var toast = $mdToast.simple()
                        .textContent("ROC-Analysis Task added to Tasks-Queue")
                        .position('top right');
                    $mdToast.show(toast).then(function (response2) {
                        if (response2 == 'ok') {
                            //todo
                        }
                    });
                },
                function errorCallback(response) {
                    var toast = $mdToast.simple()
                        .textContent(response.data)
                        .action('UNDO')
                        .highlightAction(true)
                        .highlightClass('md-accent')
                        .position('top right');
                    $mdToast.show(toast).then(function (response2) {
                        if (response2 == 'ok') {
                            //todo
                        }
                    });
                });
        }
    }
});
