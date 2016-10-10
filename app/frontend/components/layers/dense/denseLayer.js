angular.module('denseLayer', [])
    .service('denseLayer', [denseLayer]);

function denseLayer() {

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

    this.getDefaultSettings = function () {
        return {
            "neuronsCount": 1024,
            "activationFunction": "relu",
            "isTrainable": true
        }
    }
}
