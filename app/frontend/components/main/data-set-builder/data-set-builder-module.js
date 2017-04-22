'use strict';

angular.module('dataSetBuilder', ['md.data.table'])
    .service('datasetBuilderService', ['$http', DataSetBuilderService])
    .directive('datasetBuilder', function () {
        return {
            restrict: 'E',
            controller: ['$scope', '$rootScope', '$element', '$mdEditDialog', '$timeout', 'datasetBuilderService', '$mdDialog', 'appConfig', 'taskManagerService', DataSetController],
            controllerAs: 'datasetBuilder',
            replace: false,
            scope: {

            },
            templateUrl: '/frontend/components/main/data-set-builder/data-set-builder.html'
        }
    });
