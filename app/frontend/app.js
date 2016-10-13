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
    'classifyDataSet',
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
            template: "<network-main></network-main>"
        }).state('designer', {
            url: "/designer",
            template: "<constructor  style='height:100%;'></constructor>"
        }).state('models', {
            url: "/models",
            template: "<model-main></model-main>",
            data: {
                displayName: 'Models'
            }
        }).state('classify-image', {
            url: "/models/classify-image",
            template: "<classify-image></classify-image>",
            data: {
                displayName: 'Classify Image'
            }
        }).state('data-set', {
            url: "/data-set",
            template: "<main-data-set></main-data-set>"
        })/*.state('preview', {
            url: "/preview",
            template: "<dataset-image2d-preview></dataset-image2d-preview>"
        })*/.state('data-set-builder', {
            url: "/data-set-builder",
            template: "<dataset-builder></dataset-builder>"
        }).state('file-manager', {
            url: "/file-manager",
            template: "<angular-filemanager></angular-filemanager>"
        }).state('task', {
            url: "/task",
            template: "<task></task>"
        }).state('settings', {
            url: "/settings",
            template: "<settings></settings>"
        });
    }).controller('mainCtrl', function($rootScope, $scope, $location) {

    // $rootScope.$on('$stateChangeSuccess',
    //     function (event, toState, toParams, fromState, fromParams) {
    //         if (fromState.name == '') {
    //             switch (toState.name) {
    //                 case "networks":
    //                     $scope.selectedIndex = 0;
    //                     break;
    //                 case "designer":
    //                     $scope.selectedIndex = 1;
    //                     break;
    //                 case "models":
    //                     $scope.selectedIndex = 2;
    //                     break;
    //                 case "data-set":
    //                     $scope.selectedIndex = 3;
    //                     break;
    //                 case "preview":
    //                     $scope.selectedIndex = 4;
    //                     break;
    //                 case "data-set-builder":
    //                     $scope.selectedIndex = 5;
    //                     break;
    //                 case "file-manager":
    //                     $scope.selectedIndex = 6;
    //                     break;
    //                 case "settings":
    //                     $scope.selectedIndex = 7;
    //                     break;
    //             }
    //         }
    //     }
    // );
    //
    // $scope.$watch('selectedIndex', function (current, old) {
    //     if (current != null && old != null) {
    //         switch (current) {
    //             case 0:
    //                 $location.url("/networks");
    //                 break;
    //             case 1:
    //                 $location.url("/designer");
    //                 break;
    //             case 2:
    //                 $location.url("/models");
    //                 break;
    //             case 3:
    //                 $location.url("/data-set");
    //                 break;
    //             case 4:
    //                 $location.url("/preview");
    //                 break;
    //             case 5:
    //                 $location.url("/data-set-builder");
    //                 break;
    //             case 6:
    //                 $location.url("/file-manager");
    //                 break;
    //             case 7:
    //                 $location.url("/settings");
    //                 break;
    //         }
    //     }
    // });
    //
    // $scope.$on('switchTab', function (event, data) {
    //         $scope.selectedIndex = data.id;
    // });
    });