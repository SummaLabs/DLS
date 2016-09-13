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
    'networkLayerService',
    'createImgDataset',
    'datasetBuilder',
    'FileManagerApp',
    'applyModelMenu',
    'classifyImage',
    'imageService',
    'googlechart', 
    'classifyDataSet']);


angular.module('dlsApp')
    .value('appConfig', {
        svgDefinitions: {
            markerRect: 'border',
            markerText: 'text',
            markerPortIn: 'in',
            markerPortOut: 'out',
            areaWidth: 2000,
            areaHeight: 2000,
            scaleMin: 0.2,
            scaleMax: 4.0,
            scaleFactor: 1.2,
            gridStep: 25
        },
        fileManager: {
            pickFile: true,
            pickFolder: true,
            singleSelection: true
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
            template: "<constructor></constructor>"
        }).state('models', {
            url: "/models",
            template: "<model-main></model-main>"
        }).state('data-set', {
            url: "/data-set",
            template: "<main-data-set></main-data-set>"
        }).state('data-set-builder', {
            url: "/data-set-builder",
            template: "<dataset-builder></dataset-builder>"
        }).state('settings', {
            url: "/settings",
            template: "<span>Settings</span>"
        });
    }).controller('mainCtrl', function($rootScope, $scope, $location) {

    $rootScope.$on('$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams) {
            if (fromState.name == '') {
                switch (toState.name) {
                    case "networks":
                        $scope.selectedIndex = 0;
                        break;
                    case "designer":
                        $scope.selectedIndex = 1;
                        break;
                    case "models":
                        $scope.selectedIndex = 2;
                        break;
                    case "data-set":
                        $scope.selectedIndex = 3;
                        break;
                    case "data-set-builder":
                        $scope.selectedIndex = 4;
                        break;
                    case "settings":
                        $scope.selectedIndex = 5;
                        break;
                }
            }
        }
    );

    $scope.$watch('selectedIndex', function (current, old) {
        if (current != null && old != null) {
            switch (current) {
                case 0:
                    $location.url("/networks");
                    break;
                case 1:
                    $location.url("/designer");
                    break;
                case 2:
                    $location.url("/models");
                    break;
                case 3:
                    $location.url("/data-set");
                    break;
                case 4:
                    $location.url("/data-set-builder");
                    break;
                case 5:
                    $location.url("/settings");
                    break;
            }
        }
    });

        $scope.$on('switchTab', function (event, data) {
            $scope.selectedIndex = data.id;
        });
    });