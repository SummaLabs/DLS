'use strict';

angular.module('create2dImgDataset', ['ngMaterial','ngMessages', 'taskManagerService'])
    .component('create2dImgDataset', {
        templateUrl: '/frontend/components/2d-img-dataset/create-2d-img-dataset.html',
        bindings: {
            formImage: "<",
            formFileImport: "<",
            formDbBackend: "<"
        },
        controller: function ($scope, $location, $mdDialog, $http, appConfig, taskManagerService, $mdToast) {
            var self = this;
            self.$onInit = function () {
                self.formImage = {
                    imgTypes: [
                        { id: 'color',  value: 'Color' },
                        { id: 'gray',   value: 'Grayscale' }
                    ],
                    imgTypeSelectedId: 'color',
                    imgSizes: {
                        x: 256,
                        y: 256
                    },
                    resizeTransforms: [
                        { id: 'crop',   value: "Crop" },
                        { id: 'squash', value: "Squash" },
                        { id: 'fill',   value: "Fill" },
                        { id: 'half-crop-fill', value: "Half crop, half fill" }
                    ],
                    resizeTransformSelectedId: 'squash'
                };
                self.listFromTypes=["dir", "txt"];
                self.formFileImport = {
                    selectedTabIndex: 0,
                    fromDir: {
                        isUseSeparateValDir:false,
                        percentForValidation: 25,
                        percentForTesting: 0,
                        pathToImageFolder:      "",
                        pathToImageFolderVal:   ""
                    },
                    fromTxt: {
                        isUseSeparateVal: false,
                        isUseRelativeDir: false,
                        percentForValidation: 25,
                        pathToImagesTxt: "",
                        pathToImagesTxtVal: "",
                        pathTorRelativeDir: ""
                    }
                };

                self.formDbBackend = {
                    dbBackends: [
                        {id: 'lmdb', value: "LMDB"},
                        {id: 'hdf5', value: "HDF5"}
                    ],
                    dbBackendSelectedId: 'lmdb',
                    imageEncodings: [
                        {id: 'none',    value: "None"},
                        {id: 'png',     value: "PNG (lossless)"},
                        {id: 'jpeg',    value: "JPEG (lossy, 90% quality)"}
                    ],
                    imageEncodingsSelectedId: 'jpeg',
                    datasetname: "dataset-v1",
                    isUseThreading: false
                }

            };

            function successCallback(data){
                console.log("success: process received data" + data);
            }

            function errorCallback(error) {
                console.log("error: show up error message" + error);
            }

            self.getConfigJson = function () {
                return {
                    formImage: {
                        imgTypeSelectedId:          self.formImage.imgTypeSelectedId,
                        imgSizes:                   self.formImage.imgSizes,
                        resizeTransformSelectedId:  self.formImage.resizeTransformSelectedId
                    },
                    formFileImport: {
                        selectedType:               self.listFromTypes[self.formFileImport.selectedTabIndex],
                        fromDir:                    self.formFileImport.fromDir,
                        fromTxt:                    self.formFileImport.fromTxt
                    },
                    formDbBackend: {
                        dbBackendSelectedId:        self.formDbBackend.dbBackendSelectedId,
                        imageEncodingsSelectedId:   self.formDbBackend.imageEncodingsSelectedId,
                        isUseThreading:             self.formDbBackend.isUseThreading
                    },
                    datasetname:                    self.formDbBackend.datasetname
                }
            };
            
            this.setTrainImagesDir = function (ptype) {
                var pref = ptype.split('-')[0];
                if (pref == 'dir') {
                    appConfig.fileManager.pickFile = true;
                    appConfig.fileManager.pickFolder = true;
                } else {
                    appConfig.fileManager.pickFile = true;
                    appConfig.fileManager.pickFolder = false;
                }
            };
            
            self.formSubmit = function () {
                var dataJson = self.getConfigJson();
                $location.url('/task');
                taskManagerService.startTask('db-image2d-cls', dataJson).then(
                    function successCallback(response) {
                        var toast = $mdToast.simple()
                            .textContent("Dataset build task added to Tasks-Queue")
                            .position('top right');
                        $mdToast.show(toast).then(function (response) {
                            if (response == 'ok') {
                                //todo
                            }
                        });
                        console.log(response.data);
                    },
                    function errorCallback(response) {
                        var toast = $mdToast.simple()
                            .textContent(response.data)
                            .action('UNDO')
                            .highlightAction(true)
                            .highlightClass('md-accent')
                            .position('top right');
                        $mdToast.show(toast).then(function (response) {
                            if (response == 'ok') {
                                //todo
                            }
                        });
                        // console.log(response.data);
                    }
                );
            };
            self.showJson = function(ev) {
                var ret = self.getConfigJson();
                console.log(ret);
                $mdDialog.show(
                    $mdDialog.confirm().
                    title('Training Log').
                    textContent(JSON.stringify(ret, null, 2)).
                    ariaLabel('Json').
                    targetEvent(ev).
                    ok('Ok')
                );
            };
            this.setTrainImagesDir = function (ptype, $event) {
                var pref = ptype.split('-')[0];
                if(pref=='dir'){
                    appConfig.fileManager.pickFile = false;
                    appConfig.fileManager.pickFolder = true;
                } else {
                    appConfig.fileManager.pickFile = true;
                    appConfig.fileManager.pickFolder = false;
                }
                appConfig.fileManager.singleSelection = true;
                $mdDialog.show({
                    controller: function ($scope, $mdDialog, $rootScope) {
                        $scope.select = function(answer) {
                            $mdDialog.hide(answer);
                            if($rootScope.selectedFiles.length>0) {
                                var retPath = $rootScope.selectedFiles[0].model.fullPath();
                                if(ptype=='dir-train') {
                                    self.formFileImport.fromDir.pathToImageFolder    = retPath;
                                } else if (ptype=='dir-val') {
                                    self.formFileImport.fromDir.pathToImageFolderVal = retPath;
                                } else if (ptype=='dir-rel') {
                                    self.formFileImport.fromTxt.pathTorRelativeDir   = retPath;
                                } else if (ptype=='file-train') {
                                    self.formFileImport.fromTxt.pathToImagesTxt      = retPath;
                                } else if (ptype=='file-val') {
                                    self.formFileImport.fromTxt.pathToImagesTxtVal   = retPath;
                                }
                            } else {
                                if(pref=='dir') {
                                    var retDir =  '/' + $rootScope.selectedModalPath.join('/');
                                    if(ptype=='dir-train') {
                                        self.formFileImport.fromDir.pathToImageFolder    = retDir;
                                    } else if (ptype=='dir-val') {
                                        self.formFileImport.fromDir.pathToImageFolderVal = retDir;
                                    } else if (ptype=='dir-rel') {
                                        self.formFileImport.fromTxt.pathTorRelativeDir   = retDir;
                                    }
                                }
                            }
                        };
                        $scope.cancel = function() {
                            $mdDialog.cancel();
                        };
                    },
                    templateUrl: 'frontend/components/dialog/file-manager.html',
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    clickOutsideToClose:false
                });
            };
        }
    });