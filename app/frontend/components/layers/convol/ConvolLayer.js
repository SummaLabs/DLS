angular.module('convolLayer', [])
    .service('convolLayer', [ConvolLayerService]);

function ConvolLayerService() {

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

    this.getSubsamplingTypes = function () {
        return [
            {value: "max_pooling", text: "Max Pooling"},
            {value: "average_pooling", text: "Average Pooling"}
        ];
    };

    this.getDefaultSettings = function () {
        return {
            "filtersCount": 64,
            "filterWidth": 3,
            "filterHeight": 3,
            "activationFunction": "relu",
            "subsamplingType": "max_pooling",
            "subsamplingSize": 2,
            "isTrainable": true
        }
    }
}
