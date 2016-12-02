angular.module('convolution3dLayer', [])
    .service('convolution3dLayer', [Convolution3dLayer]);

function Convolution3dLayer() {
    
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
            "name":         "Convolution3D",
            "layerType":    "convolution3d",
            "category":     "basic: convolution",
            "params": {
                "filtersCount": 16,
                "filterWidth":  3,
                "filterHeight": 3,
                "filterDepth":  3,
                "activationFunction": "linear",
                "isTrainable":  true
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/convolution3d/convolution3d.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-convolution3d-v1.png"
    };
}
