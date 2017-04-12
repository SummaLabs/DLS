function importerController($scope, $rootScope, $element, $mdEditDialog, $timeout, dataImporterService, $mdDialog, appConfig) {

    $scope.table = dataImporterService.createTable();

    let parentScope = $scope;

    function loadCSV($event) {
        $mdDialog.show({
            controller: function ($scope, $mdDialog, $rootScope) {
                let parentDialogScope = $scope;
                $scope.delimiter = ',';
                $scope.header = false;
                $scope.isUseSeparateVal = false;
                $scope.percentForValidation = 70;
                $scope.trainCsvPath = "";
                $scope.validationCsvPath = "";
                $scope.formSubmit = function (answer) {
                    $mdDialog.hide(answer);
                    if ($rootScope.selectedFiles.length > 0) {
                        dataImporterService.loadRecordsFromCsv(parentDialogScope.trainCsvPath, $scope.delimiter, 100).then(
                            function success(trainCsvResponse) {
                                if (parentDialogScope.validationCsvPath) {
                                    dataImporterService.loadRecordsFromCsv(parentDialogScope.validationCsvPath, $scope.delimiter, 100).then(
                                        function success(validationCsvResponse) {
                                            parentScope.options.separateCSV = true;
                                            parentScope.table.setData(trainCsvResponse.data, validationCsvResponse.data, true);
                                        },
                                        function error(validationCsvResponseError) {
                                            console.log(validationCsvResponseError.data);
                                        }
                                    );
                                } else {
                                    parentScope.options.separateCSV = false;
                                    parentScope.table.setData(trainCsvResponse.data, [], true);
                                }
                            },
                            function error(trainCsvResponseError) {
                                console.log(trainCsvResponseError.data);
                            }
                        );
                    }
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.selectCsv = function ($event, datasetType) {
                    appConfig.fileManager.pickFile = true;
                    appConfig.fileManager.pickFolder = false;
                    appConfig.fileManager.singleSelection = true;
                    $mdDialog.show({
                        controller: function ($scope, $mdDialog, $rootScope) {
                            $scope.select = function (answer) {
                                $mdDialog.hide(answer);
                                if ($rootScope.selectedFiles.length > 0) {
                                    if (datasetType == "train") {
                                        parentDialogScope.trainCsvPath = $rootScope.selectedFiles[0].model.fullPath();
                                        console.log(parentDialogScope.trainCsvPath)
                                    } else {
                                        parentDialogScope.validationCsvPath = $rootScope.selectedFiles[0].model.fullPath();
                                        console.log(parentDialogScope.validationCsvPath)
                                    }
                                }
                            };
                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        },
                        templateUrl: '/frontend/components/main/file-manager/file-manager.html',
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        clickOutsideToClose: false,
                        autoWrap : true,
                        multiple: true
                    });
                };
            },
            templateUrl: '/frontend/components/main/data-set-importer/data-set-importer-dialog.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: false
        });
    }

    loadCSV();

    $scope.onCreateDataset = function ($event) {
        $mdDialog.show({
            controller: function ($scope, $mdDialog, $rootScope) {
                $scope.threads = 2;
                $scope.name = '';
                $scope.formSubmit = function (answer) {
                    $mdDialog.hide(answer);
                    alert("Create Dataset")
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
            },
            templateUrl: '/frontend/components/main/data-set-importer/data-set-create-dialog.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: false
        })};
    
    $scope.selectDataset = function () {
        if ($scope.options.dataset == 'Training') {
            $scope.table.setTrainingData()
        }
        if ($scope.options.dataset == 'Validation') {
            $scope.table.setValidationData()
        }
    };

    $scope.options = {
        rowSelection: false,
        multiSelect: true,
        autoSelect: true,
        decapitate: false,
        largeEditDialog: false,
        boundaryLinks: false,
        limitSelect: true,
        pageSelect: true,
        separateCSV: false,
        datasetTypes: ['Training', 'Validation'],
        dataset: 'Training'
    };

    $scope.selectedRows = [];
   /* $scope.limitOptions = [5, 10, 15, {
        label: 'All',
        value: function () {
            return $scope.desserts ? $scope.desserts.count : 0;
        }
    }];*/
    

    $scope.query = {
        order: 'name',
        limit: 5,
        page: 1
    };
    
    $scope.checkColumn = function (header) {
        $scope.table.checkColumn(header);
    };

    $scope.showSettings = function (header) {
        $mdDialog.show({
            controller: header.controller(),
            template: header.getTemplate(),
            parent: angular.element(document.body),
            clickOutsideToClose:true,
        }).then(function(answer) {

        }, function() {

        });
    };

    $scope.mergeColumn =function () {
        $scope.table.mergeColumns();
        console.log($scope.table.getConfig());
    };

    $scope.removeColumns = function () {
        $scope.table.removeColumns();
    };

    $scope.editHeaderName = function (event, header) {
        event.stopPropagation();

        let dialog = {
            modelValue: header.name,
            placeholder: 'Edit a column name',
            save: function (input) {
                header.name = input.$modelValue;
            },
            targetEvent: event,
            title: 'Edit a column name',
            validators: {
                'md-maxlength': 30
            }
        };

        var promise = /*$scope.options.largeEditDialog ? $mdEditDialog.large(dialog) :*/ $mdEditDialog.small(dialog);

        console.log(event, promise, $mdEditDialog, dialog, header);
        promise.then(function (ctrl) {
            var input = ctrl.getInput();

            input.$viewChangeListeners.push(function () {
                input.$setValidity('test', input.$modelValue !== 'test');
            });
        });
    };

    $scope.toggleLimitOptions = function () {
        $scope.limitOptions = $scope.limitOptions ? undefined : [5, 10, 15];
    };

    $scope.getTypes = function () {
        return ['Candy', 'Ice cream', 'Other', 'Pastry'];
    };

    $scope.onPaginate = function(page, limit) {
        console.log('Scope Page: ' + $scope.query.page + ' Scope Limit: ' + $scope.query.limit);
        console.log('Page: ' + page + ' Limit: ' + limit);

        $scope.promise = $timeout(function () {

        }, 2000);
    };

    $scope.deselect = function (item) {
        console.log(item, 'was deselected');
    };

    $scope.log = function (item) {
        console.log(item, 'was selected');
    };

    $scope.loadStuff = function () {
        $scope.promise = $timeout(function () {

        }, 2000);
    };

    $scope.onReorder = function(order) {

        console.log('Scope Order: ' + $scope.query.order);
        console.log('Order: ' + order);

        $scope.promise = $timeout(function () {

        }, 2000);
    };
    
    $scope.headerSelectedType = function (header, type) {
        header.changeType = type;
    };

    $scope.onLoadCSV = function (event) {
        $scope.table = dataImporterService.createTable();
        loadCSV(event);
    }
}