angular.module('denseLayer', [])
    .service('denseLayer', [DenseLayer]);

function DenseLayer() {
    
    this.getActivationFunctions = function () {
        return [
            {value: "softmax",      text: "SoftMax"},
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
            "name": "Dense",
            "layerType": "dense",
            "category": "basic: dense",
            "params": {
                "neuronsCount": 128,
                "activationFunction": "linear",
                "isTrainable": true
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/dense/dense.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-dense-v1.png"
    };
}
