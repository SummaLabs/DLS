angular.module('denseLayer', [])
    .service('denseLayer', [DenseLayer]);

function DenseLayer() {
    
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

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "dense",
            "layerType": 'dense',
            "category": "layer",
            "params": {
                "neuronsCount": 1024,
                "activationFunction": "relu",
                "isTrainable": true
            }
        }
    };
    
    this.getTemplatePath = function () {
      return "frontend/components/layers/dense/layer_with_shapes_exp.svg";  
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/dense.gif"
    };
}
