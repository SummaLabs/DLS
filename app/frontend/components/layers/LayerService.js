angular.module('layerService', ['convolutionLayer', 'dataLayer', 'denseLayer', 'solverLayer'])
    .service('layerService', ['$rootScope', '$http', '$templateCache', 'convolutionLayer', 'dataLayer', 'denseLayer', 'solverLayer', LayerService]);

function LayerService($rootScope, $http, $templateCache, convolutionLayer, dataLayer, denseLayer, solverLayer) {

    const networkLayerEvent = {
        UPDATE: 'layer:update',
        CLEAR: 'layer:clear',
        ADD: 'layer:add',
        REMOVE: 'layer:remove'
    };

    const categories = ['input', 'layer', 'output'];
    
    const layerByType = {
        'data': dataLayer,
        'convolution': convolutionLayer,
        'dense': denseLayer,
        'solver': solverLayer
    };

    const templatesByType = {
        'data': '',
        'convolution': '',
        'dense': '',
        'solver': ''
    };
    
    loadTemplate('data');
    loadTemplate('convolution');
    loadTemplate('dense');
    loadTemplate('solver');

    var layers = [
        convolutionLayer.getDefault(),
        dataLayer.getDefault(),
        denseLayer.getDefault(),
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