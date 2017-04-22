function importerController($scope, $rootScope, $element, $mdEditDialog, $timeout, dataImporterService, $mdDialog, appConfig) {

    $scope.table = dataImporterService.createTable();

    let parentScope = $scope;

    function loadCSV($event) {
        $mdDialog.show({
            controller: function ($scope, $mdDialog, $rootScope) {
                let loadCsvDialogScope = $scope;
                $scope.delimiter = parentScope.config.delimiter;
                $scope.header = parentScope.config.header;
                $scope.isUseSeparateVal = false;
                $scope.percentForValidation = parentScope.config.percentForValidation;
                $scope.trainCsvPath = parentScope.config.trainCsvPath;
                $scope.validationCsvPath = parentScope.config.validationCsvPath;
                $scope.formSubmit = function (answer) {
                    $mdDialog.hide(answer);
                    parentScope.config.delimiter = $scope.delimiter;
                    parentScope.config.header = $scope.header;
                    parentScope.config.percentForValidation = $scope.percentForValidation;
                    if ($rootScope.selectedFiles.length > 0) {
                        dataImporterService.loadRecordsFromCsv(loadCsvDialogScope.trainCsvPath, $scope.delimiter, 100).then(
                            function success(trainCsvResponse) {
                                parentScope.config.trainCsvPath = loadCsvDialogScope.trainCsvPath;
                                if (loadCsvDialogScope.validationCsvPath) {
                                    dataImporterService.loadRecordsFromCsv(loadCsvDialogScope.validationCsvPath, $scope.delimiter, 100).then(
                                        function success(validationCsvResponse) {
                                            parentScope.options.separateCSV = true;
                                            parentScope.config.validationCsvPath = loadCsvDialogScope.validationCsvPath;
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
                                        loadCsvDialogScope.trainCsvPath = $rootScope.selectedFiles[0].model.fullPath();
                                    } else {
                                        loadCsvDialogScope.validationCsvPath = $rootScope.selectedFiles[0].model.fullPath();
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
                    let headers = [];
                    for (let header of parentScope.table.headers) {
                        headers.push({
                            name: header.name,
                            type: header.type,
                            columns: header.columns
                        });
                    }
                    let delimiter = parentScope.config.delimiter;
                    let header = parentScope.config.header;
                    let trainCsvPath = parentScope.config.trainCsvPath;
                    let separateCSV = parentScope.options.separateCSV;
                    let percentForValidation = parentScope.config.percentForValidation;
                    let validationCsvPath = parentScope.config.validationCsvPath;

                    $mdDialog.hide(answer);
                    alert("Test")
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

    $scope.query = {
        order: 'name',
        limit: 5,
        page: 1
    };

    $scope.config = {
        threads: 1,
        delimiter: ',',
        header: false,
        trainCsvPath: "",
        percentForValidation: 70,
        validationCsvPath: ""
    };
    
    $scope.checkColumn = function (header) {
        $scope.table.checkColumn(header);
    };

    $scope.showSettings = function (header) {
        $mdDialog.show({
            controller: header.controller(),
            template: header.getTemplate(),
            parent: angular.element(document.body),
            clickOutsideToClose:true
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

    $scope.editHeaderName = function (ev, header) {
        var confirm = $mdDialog.prompt()
            .title("Edit Column Header")
            .placeholder('Enter Header Name')
            .ariaLabel('Header Name')
            .initialValue(header.name)
            .targetEvent(ev)
            .ok('Update')
            .cancel('Cencel');

        $mdDialog.show(confirm).then(function (result) {
            if (result) {
                header.name = result;
            }
        }, function () {
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