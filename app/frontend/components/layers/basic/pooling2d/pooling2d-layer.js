angular.module('pooling2dLayer', [])
    .service('pooling2dLayer', [Pooling2dLayer]);

function Pooling2dLayer() {

    this.getSubSamplingTypes = function () {
        return [
            {value: "max_pooling", text: "Max Pooling"},
            {value: "average_pooling", text: "Average Pooling"}
        ];
    };

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "Pooling2D",
            "layerType": 'pooling2d',
            "category": "basic: pooling",
            "params": {
                "subsamplingType": "max_pooling",
                "subsamplingSize": 2
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/pooling2d/pooling2d.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-pooling-2d-v1.png"
    };
}
