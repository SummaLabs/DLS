angular.module('convolution1dLayer', [])
    .service('convolution1dLayer', [Convolution1dLayer]);

function Convolution1dLayer() {
    
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
            "name": "Convolution1D",
            "layerType": 'convolution1d',
            "category": "basic: convolution",
            "params": {
                "filtersCount": 16,
                "filterWidth": 3,
                "activationFunction": "linear",
                "isTrainable": true
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/convolution1d/convolution1d.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-convolution1d-v1.png"
    };
}
