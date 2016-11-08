angular.module('convolutionLayer', [])
    .service('convolutionLayer', [ConvolutionLayer]);

function ConvolutionLayer() {
    
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
            "layerType": 'Convolution2D',
            "category": "layer",
            "params": {
                "filtersCount": 64,
                "filterWidth": 3,
                "filterHeight": 3,
                "activationFunction": "linear",
                "isTrainable": true
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/convolution2d/convolution2d.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/convol.gif"
    };
}
