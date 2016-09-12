'use strict';

angular.module('dlsApp', ['ngMaterial',

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
    'classifyDataSet',
    'datasetImage2dPreview',
    'cl.paging',
    'dbinfoService',
    'settings',
    'device',
    'deviceService'
                  
]);


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
}]);