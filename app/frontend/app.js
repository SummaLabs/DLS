'use strict';

angular.module('dlsApp', ['ngMaterial', "ui.router",

    'mainMenu',
    'constructorCore',
    'networkMain',
    'modelMain',
    'mainDataSet',
    'convolEditor',
    'inputDataEditor',
    'denseEditor',
    'solverEditor',
    'layerEditor',
    'networkDataService',
    'createImgDataset',
    'datasetBuilder',
    'FileManagerApp',
    'classifyImage',
    'imageService',
    'googlechart', 
    'rocAnalysis',
    // 'datasetImage2dPreview',
    'datasetImage2dPreview2',
    'cl.paging',
    'dbinfoService',
    'settings',
    'device',
    'deviceSelector',
    'deviceService',
    'task',
    'modelService',
    "inference",
    "validation",
    'modelsService',
    'taskManagerService',
    'env',
    'taskView',
    'taskTest',
    'taskModel',
    'taskDataset',
    'testRocTask',
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
            scaleMin: 0.2,
            scaleMax: 4.0,
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

            }
        }).state('data-set', {
            url: "/data-set",
            template: "<main-data-set></main-data-set>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 3;
            }
        }).state('data-set-builder', {
            url: "/data-set-builder",
            template: "<dataset-builder></dataset-builder>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 4;
            }
        }).state('file-manager', {
            url: "/file-manager",
            template: "<angular-filemanager></angular-filemanager>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 5;
            }
        }).state('task', {
            url: "/task",
            template: "<task></task>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 6;
            }
        }).state('settings', {
            url: "/settings",
            template: "<settings></settings>",
            controller: function ($rootScope) {
                $rootScope.tabIndex = 7;
            }
        });
    }).controller('mainCtrl', function($rootScope, $scope, $location) {
        $rootScope.tabIndex = 0;
        $scope.selectedIndex = 0;
        $rootScope.$watch('tabIndex', function(newValue) {
            $scope.selectedIndex = newValue;
		});
    });