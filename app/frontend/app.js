'use strict';

angular.module('dlsApp', ['ngMaterial', "ui.router",

    'constructorCore',
    'networkMain',
    'modelMain',
    'datasetMain',
    'convolEditor',
    'inputDataEditor',
    'denseEditor',
    'solverEditor',
    'layerEditor',
    'networkDataService',
    'FileManagerApp',
    'imageService',
    'googlechart',
    'dbinfoService',
    'settings',
    'task',
    'modelService',
    'modelsService',
    'taskManagerService',
    'layerService'
]);


angular.module('dlsApp')
    .value('appConfig', {
        svgDefinitions: {
            markerRect: 'border',
            markerText: 'text',
            markerPortIn: 'in',
            markerPortOut: 'out',
            markerShapeIn: 'shape_in',
            markerShapeOut: 'shape_out',
            areaWidth: 5000,
            areaHeight: 5000,
            scaleMin: 0.0001,
            scaleMax: 10.0,
            scaleFactor: 1.2,
            gridStep: 25
        },
        fileManager: {
            pickFile: true,
            pickFolder: true,
            singleSelection: true
        },
        image: {
            loadApiUrl: '/images/load?imagePath='
        }
    }).config(['$compileProvider', function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/);
    }]).config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/networks');
        $stateProvider
        .state('networks', {
            url: "/networks",
            template: "<network-main></network-main>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 0;
            }
        }).state('designer', {
            url: "/designer",
            template: "<constructor  style='height:100%;'></constructor>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 1;
            }
        }).state('models', {
            url: "/models",
            template: "<model-main></model-main>",
            data: {
                displayName: 'Models'
            },
            controller: function ($rootScope) {
                $rootScope.tabIndex = 2;
            }
        }).state('classify-image', {
            url: "/models/classify-image",
            template: "<classify-image></classify-image>",
            data: {
                displayName: 'Classify Image'
            },
            controller: function ($rootScope) {
                $rootScope.tabIndex = 2;
            }
        }).state('data', {
            url: "/data",
            template: "<dataset-main></dataset-main>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 3;
            }
        }).state('data-create', {
            url: "/data/create",
            template: "<create2d-img-dataset></create2d-img-dataset>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 3;
            }
        }).state('data-file-manager', {
            url: "/data/file-manager",
            templateUrl: "/frontend/components/main/data-set/file-manager.html",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 3;
            }
        }).state('task', {
            url: "/task",
            template: "<task></task>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 4;
            }
        }).state('settings', {
            url: "/settings",
            template: "<settings></settings>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 5;
            }
        });
    }).controller('mainCtrl', ['$rootScope', '$scope', '$location',  'layerService', function($rootScope, $scope, $location) {
        $rootScope.tabIndex = 0;
        $scope.selectedIndex = 0;
        $rootScope.$watch('tabIndex', function(newValue) {
            $scope.selectedIndex = newValue;
		});
    }]);