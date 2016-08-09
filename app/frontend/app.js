angular.module('starterApp', ['ngMaterial',
    'mainMenu',
    'constructorCore',
    'networkMain',
    'modelMain',
    'mainDataSet']);

angular.module('starterApp')
    .value('appConfig', {
        svgDefinitions: {
            markerRect: 'border',
            markerText: 'text',
            markerPortIn: 'in',
            markerPortOut: 'out'
        }
    })