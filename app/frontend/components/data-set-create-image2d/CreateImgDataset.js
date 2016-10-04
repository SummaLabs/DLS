(function () {
    'use strict';

    angular.module('createImgDataset', ['ngMaterial','ngMessages'])
        .component('createImgDataset', {
            templateUrl: '/frontend/components/data-set-create-image2d/create-img-dataset.html',
            bindings: {
                formImage: "<",
                formFileImport: "<",
                formDbBackend: "<"
            },
            controller: function ($mdDialog, $http, appConfig) {
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

                self.formSubmit = function () {

                    // TODO: include logic for composing "data" object
                    // for example:
                    // testImages = separateTestImgFolder ? testImages : null;

                    var req = {
                        method: "POST",
                        url: "/some/url",
                        data: {
                            formImage: this.formImage,
                            formFileImport: this.formFileImport,
                            formDbBackend: this.formDbBackend
                        }
                    };

                    $http(req).then(successCallback, errorCallback);

                    console.log("form fired!");
                };
                self.showJson = function(ev) {
                    var ret =  {
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
                    };
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
                this.setTrainImagesDir = function (ptype) {
                    var pref = ptype.split('-')[0];
                    if(pref=='dir'){
                        appConfig.fileManager.pickFile = true;
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
						targetEvent: event,
						clickOutsideToClose:false
					});
                };
            }
        });
})();