'use strict';

angular.module('mainDataSet', ['ngMaterial', 'dbinfoService'])
    .component('mainDataSet', {
        templateUrl: '/frontend/components/data-set-main/main-data-set.html',
        bindings: {
            models: '<',
            items:  '<',
            datasets:   '<',
            selectedDbId: '@',
            currentDbInfo: '<'
        },
        controller: function ($scope, $rootScope, $mdDialog, $timeout, appConfig, dbinfoService) {
            var self = this;
            self.$onInit = function () {
                dbinfoService.getDatasetsInfoStatList().then(
                    function successCallback(response) {
                        self.datasets = response.data;
                    },
                    function errorCallback(response) {
                        console.log(response.data);
                    });
            };
            //
            self.createDialogPreviewDB = function($event,dbId) {
                console.log('DB-Id: ' + dbId);
                dbinfoService.getInfoStatWithHistsAboutDB(dbId).then(
                    function successCallback(response) {
                        self.currentDbInfo = response.data;
                        $mdDialog.show({
                            controller: DialogControllerPreviewDB,
                            templateUrl: 'frontend/components/dialog/dialog-preview-dataset-image2d.html',
                            parent: angular.element(document.body),
                            targetEvent: event,
                            locals: {
                                dbId: dbId,
                                dbInfo: response.data
                            },
                            clickOutsideToClose:true
                        });
                    },
                    function errorCallback(response) {
                        console.log(response.data);
                    });

            };
            // self.getImagePreview = function (dbId) {
            //     return dbinfoService.getImagePreviewForDB(dbId);
            // };
            //
            self.items = {
                'text':    {name: "Text Data", icon: "text_fields", direction: "bottom"},
                'image3d': {name: "Image 3D", icon: "photo_library", direction: "top"},
                'image2d': {name: "Image 2D", icon: "photo", direction: "bottom"}
            };
            //
            self.openDialogCreateDataset = function ($event, item) {
                if(item.name=='Image 2D') {
                    $mdDialog.show({
                        controller: DialogControllerCreateDatasetImage2D,
                        templateUrl: 'frontend/components/dialog/dialog-create-dataset-image2d.html',
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        clickOutsideToClose: true,
                        fullscreen: true // Only for -xs, -sm breakpoints.
                    });
                } else {
                    $mdDialog.show(
                    $mdDialog.alert()
                        .title('Currently not implemented :(')
                        .textContent('Dataset type [' + item.name + '] is not implemented yet!')
                        .ariaLabel('Primary click demo')
                        .ok('Ok')
                        .targetEvent(event)
                );
                }
            };
            //
            self.hidden = false;
            self.isOpen = false;
            self.hover = false;
            $scope.$watch('eventIsOpen', function (isOpen) {
                if (isOpen) {
                    $timeout(function () {
                        $scope.tooltipVisible = self.isOpen;
                    }, 600);
                } else {
                    $scope.tooltipVisible = self.isOpen;
                }
            });
            function DialogControllerCreateDatasetImage2D($scope, $mdDialog) {
                $scope.hide = function () {
                    $mdDialog.hide();
                };
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.answer = function (answer) {
                    $mdDialog.hide(answer);
                };
            }
            //
            self.models = [
                { name: 'Data Set 1'},
                { name: 'Data Set 2'},
                { name: 'Data Set 3'},
                { name: 'Data Set 4'}
            ];
            this.createDialog = function(event) {
                appConfig.fileManager.pickFile = true;
                appConfig.fileManager.pickFolder = true;
                appConfig.fileManager.singleSelection = true;
                $mdDialog.show({
                    controller: DialogControllerFS,
                    templateUrl: 'frontend/components/dialog/file-manager.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose:false
                });
            };
        }
    });

function DialogControllerPreviewDB($scope, $mdDialog, dbId, dbInfo, dbinfoService) {
    console.log('::DialogControllerPreviewDB() : ' + dbId);
    console.log(dbInfo);
    console.log(dbInfo.hist.labels);
    var self = this;
    $scope.dbid = dbId;
    $scope.dbInfo = dbInfo;
    
    $scope.getMeanImage = function () {
        dbinfoService.getImageMeanForDB().then(
            function successCallback(response) {
                return response.data;
            },
            function errorCallback(response) {
                console.log(response.data);
            });
    };
    $scope.answer = function (ans) {
        if(ans=='cancel') {
            $mdDialog.cancel();
        }
    };
}

function DialogControllerFS($scope, $mdDialog, $rootScope) {

	$scope.select = function(answer) {
		$mdDialog.hide(answer);

        console.log('/' + $rootScope.selectedModalPath.join('/'));
		$rootScope.selectedFiles.forEach(function(item, i, array) {
            console.log(item.model.fullPath(), item.model.name,
                        item.model.type, item.model.size );
		});
	};

	$scope.cancel = function() {
		$mdDialog.cancel();
	};
}