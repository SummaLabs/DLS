angular.module('activationLayer', [])
    .service('activationLayer', [ActivationLayer]);

function ActivationLayer() {
    
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
            "name": "Activation",
            "layerType": 'activation',
            "category": "basic",
            "params": {
                "activationFunction": "linear"
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/activation/activation.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-activation-v1.png"
    };
}
