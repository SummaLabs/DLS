angular.module('layerService', [
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
    'upsampling2dLayer',
    'upsampling3dLayer',
    'datainputLayer',
    'dataoutputLayer',
    'complex'])
    .service('layerService', ['$rootScope', '$http', '$templateCache',
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
        'upsampling2dLayer',
        'upsampling3dLayer',
        'datainputLayer',
        'dataoutputLayer',
        'complex', LayerService]);

function LayerService($rootScope, $http, $templateCache,
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
                      upsampling2dLayer,
                      upsampling3dLayer,
                      datainputLayer,
                      dataoutputLayer,
                      complex) {

    const networkLayerEvent = {
        UPDATE:     'layer:update',
        CLEAR:      'layer:clear',
        ADD:        'layer:add',
        REMOVE:     'layer:remove'
    };

    const categories = ['input/output', 'basic: convolution', 'basic: pooling', 'basic: dense', 'basic: upsampling', 'basic', 'complex'];
    
    const layerByType = {
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
        'upsampling2d':     upsampling2dLayer,
        'upsampling3d':     upsampling3dLayer,
        'datainput':        datainputLayer,
        'dataoutput':       dataoutputLayer,
        'inception':        complex.getAssessor('inception'),
        'resnet':           complex.getAssessor('resnet'),
        'vgg':              complex.getAssessor('vgg')
    };

    const templatesByType = {
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
        'upsampling2d': '',
        'upsampling3d': '',
        'datainput': '',
        'dataoutput': ''
    };
    
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
    loadTemplate('upsampling2d');
    loadTemplate('upsampling3d');
    loadTemplate('datainput');
    loadTemplate('dataoutput');

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
        denseLayer.getDefault(),
        upsampling2dLayer.getDefault(),
        upsampling3dLayer.getDefault(),
        datainputLayer.getDefault(),
        dataoutputLayer.getDefault(),
        complex.getInception(),
        complex.getResnet(),
        complex.getVgg()
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
        // console.log(layerByType[type]);
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