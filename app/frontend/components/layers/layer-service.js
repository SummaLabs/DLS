angular.module('layerService', [
    'dataLayer',
    'convolution1dLayer',
    'convolution2dLayer',
    'convolution3dLayer',
    'pooling1dLayer',
    'pooling2dLayer',
    'pooling3dLayer',
    'activationLayer',
    'flattenLayer',
    'mergeLayer',
    'denseLayer',
    'datainputLayer',
    'dataoutputLayer',
    'solverLayer'])
    .service('layerService', ['$rootScope', '$http', '$templateCache',
        'dataLayer',
        'convolution1dLayer',
        'convolution2dLayer',
        'convolution3dLayer',
        'pooling1dLayer',
        'pooling2dLayer',
        'pooling3dLayer',
        'activationLayer',
        'flattenLayer',
        'mergeLayer',
        'denseLayer',
        'datainputLayer',
        'dataoutputLayer',
        'solverLayer', LayerService]);

function LayerService($rootScope, $http, $templateCache,
                      dataLayer,
                      convolution1dLayer,
                      convolution2dLayer,
                      convolution3dLayer,
                      pooling1dLayer,
                      pooling2dLayer,
                      pooling3dLayer,
                      activationLayer,
                      flattenLayer,
                      mergeLayer,
                      denseLayer,
                      datainputLayer,
                      dataoutputLayer,
                      solverLayer) {

    const networkLayerEvent = {
        UPDATE:     'layer:update',
        CLEAR:      'layer:clear',
        ADD:        'layer:add',
        REMOVE:     'layer:remove'
    };

    const categories = ['input', 'basic: convolution', 'basic: pooling', 'basic: dense', 'basic', 'complex', 'output'];
    
    const layerByType = {
        'data':             dataLayer,
        'convolution1d':    convolution1dLayer,
        'convolution2d':    convolution2dLayer,
        'convolution3d':    convolution3dLayer,
        'pooling1d':        pooling1dLayer,
        'pooling2d':        pooling2dLayer,
        'pooling3d':        pooling3dLayer,
        'activation':       activationLayer,
        'merge':            mergeLayer,
        'flatten':          flattenLayer,
        'dense':            denseLayer,
        'datainput':        datainputLayer,
        'dataoutput':        dataoutputLayer,
        'solver':           solverLayer
    };

    const templatesByType = {
        'data': '',
        'convolution1d': '',
        'convolution2d': '',
        'convolution3d': '',
        'pooling1d': '',
        'pooling2d': '',
        'pooling3d': '',
        'activation': '',
        'flatten': '',
        'merge': '',
        'dense': '',
        'datainput': '',
        'dataoutput': '',
        'solver': ''
    };
    
    loadTemplate('data');
    loadTemplate('convolution1d');
    loadTemplate('convolution2d');
    loadTemplate('convolution3d');
    loadTemplate('pooling1d');
    loadTemplate('pooling2d');
    loadTemplate('pooling3d');
    loadTemplate('pooling3d');
    loadTemplate('activation');
    loadTemplate('flatten');
    loadTemplate('merge');
    loadTemplate('dense');
    loadTemplate('datainput');
    loadTemplate('dataoutput');
    loadTemplate('solver');

    var layers = [
        convolution1dLayer.getDefault(),
        convolution2dLayer.getDefault(),
        convolution3dLayer.getDefault(),
        pooling1dLayer.getDefault(),
        pooling2dLayer.getDefault(),
        pooling3dLayer.getDefault(),
        activationLayer.getDefault(),
        flattenLayer.getDefault(),
        mergeLayer.getDefault(),
        dataLayer.getDefault(),
        denseLayer.getDefault(),
        datainputLayer.getDefault(),
        dataoutputLayer.getDefault(),
        solverLayer.getDefault()
    ];

    this.pubLayersUpdateEvent = function() {
        $rootScope.$emit(networkLayerEvent.UPDATE, {});
    };

    this.subLayersUpdateEvent = function(callback) {
        $rootScope.$on(networkLayerEvent.UPDATE, callback);
    };

    this.getCategories = function() {
        return categories;
    };

    this.getLayers = function() {
        return layers;
    };
    
    this.getTemplateByType = function(type) {
        return templatesByType[type];
    };
    
    this.getTemplatePathByType = function(type) {
        return layerByType[type].getTemplatePath();
    };
    
    this.getIconByType = function(type) {
        return layerByType[type].getIconPath();
    };

    this.getLayerByType = function(type) {
        for (var i = 0, len = layers.length; i < len; i++) {
            var layer = layers[i];
            if(layer.layerType == type) {
                var copy = copyObject(layer);
                return copy;
            }
        }
    };

    this.setLayers = function(new_layers) {
        layers = new_layers;
    };
    
    function loadTemplate(type) {
        var templatePath = layerByType[type].getTemplatePath();
        $http.get(templatePath, {cache: $templateCache}).success(function(html) {
            templatesByType[type] = html;
        });
    }

    function copyObject(obj) {
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr))
                if (obj[attr] !== null && typeof obj[attr] === 'object') {
                    copy[attr] = copyObject(obj[attr]);
                } else {
                    copy[attr] = obj[attr];
                }
        }
        return copy;
    }
}