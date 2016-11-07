angular.module('convolutionLayer', [])
    .service('convolutionLayer', [ConvolutionLayer]);

function ConvolutionLayer() {
    
    this.getActivationFunctions = function () {
        return [
            {value: "softplus", text: "SoftPlus"},
            {value: "softsign", text: "SoftSign"},
            {value: "relu", text: "ReLU"},
            {value: "tanh", text: "Tanh"},
            {value: "sigmoid", text: "Sigmoid"},
            {value: "hard_sigmoid", text: "Hard Sigmoid"},
            {value: "linear", text: "Linear"}
        ];
    };

    this.getSubSamplingTypes = function () {
        return [
            {value: "max_pooling", text: "Max Pooling"},
            {value: "average_pooling", text: "Average Pooling"}
        ];
    };

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "convol",
            "layerType": 'convolution',
            "category": "layer",
            "params": {
                "filtersCount": 64,
                "filterWidth": 3,
                "filterHeight": 3,
                "activationFunction": "relu",
                "subsamplingType": "max_pooling",
                "subsamplingSize": 2,
                "isTrainable": true
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/dense/layer_with_shapes_exp.svg";  
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/convol.gif"
    };
}
