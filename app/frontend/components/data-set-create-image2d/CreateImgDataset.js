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
            controller: function ($mdDialog, $http) {

                this.$onInit = function () {
                    this.formImage = {
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
                    this.listFromTypes=["dir", "txt"];
                    this.formFileImport = {
                        selectedTabIndex: 0,
                        fromDir: {
                            isUseSeparateValDir:false,
                            percentForValidation: 25,
                            percentForTesting: 0,
                            pathToImageFolder:      "/home/ar/data/tf_data_catdog/simple4c_2k/dataset_256_2k",
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
                    
                    this.formDbBackend = {
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

                this.formSubmit = function () {

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
                this.showJson = function(ev) {
                    var ret =  {
                        formImage: {
                            imgTypeSelectedId:          this.formImage.imgTypeSelectedId,
                            imgSizes:                   this.formImage.imgSizes,
                            resizeTransformSelectedId:  this.formImage.resizeTransformSelectedId
                        },
                        formFileImport: {
                            selectedType:               this.listFromTypes[this.formFileImport.selectedTabIndex],
                            fromDir:                    this.formFileImport.fromDir,
                            fromTxt:                    this.formFileImport.fromTxt
                        },
                        formDbBackend: {
                            dbBackendSelectedId:        this.formDbBackend.dbBackendSelectedId,
                            imageEncodingsSelectedId:   this.formDbBackend.imageEncodingsSelectedId,
                            isUseThreading:             this.formDbBackend.isUseThreading
                        }
                    };
                    $mdDialog.show(
                        $mdDialog.confirm().
                        title('Training Log').
                        textContent(JSON.stringify(ret, null, 2)).
                        ariaLabel('Json').
                        targetEvent(ev).
                        ok('Ok')
                    );
                };

            }
        });
})();