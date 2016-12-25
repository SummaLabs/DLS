angular.module('convolution2dLayer', [])
    .service('convolution2dLayer', [Convolution2dLayer]);

function Convolution2dLayer() {
    
    this.getActivationFunctions = function () {
        return [
            {value: "softplus",     text: "SoftPlus"},
            {value: "softsign",     text: "SoftSign"},
            {value: "relu",         text: "ReLU"},
            {value: "tanh",         text: "Tanh"},
            {value: "sigmoid",      text: "Sigmoid"},
            {value: "hard_sigmoid", text: "Hard Sigmoid"},
            {value: "linear",       text: "Linear"}
        ];
    };

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "Convolution2D",
            "layerType": 'convolution2d',
            "category": "basic: convolution",
            "params": {
                "filtersCount": 16,
                "filterWidth": 3,
                "filterHeight": 3,
                "activationFunction": "relu",
                "isTrainable": true
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/convolution2d/convolution2d.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-convolution2d-v1.png"
    };
}
