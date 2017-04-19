'use strict';

angular.module('dataSetImporter', ['md.data.table'])
    .service('dataImporterService', ['$http', DataImporterService])
    .directive('datasetImporter', function () {
        return {
            restrict: 'E',
            controller: ['$scope', '$rootScope', '$element', '$mdEditDialog', '$timeout', 'dataImporterService', '$mdDialog', 'appConfig', 'taskManagerService', importerController],
            controllerAs: 'importer',
            replace: false,
            scope: {

            },
            templateUrl: '/frontend/components/main/data-set-importer/data-set-importer.html'
        }
    });
