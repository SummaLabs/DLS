angular.module('pooling1dLayer', [])
    .service('pooling1dLayer', [Pooling1dLayer]);

function Pooling1dLayer() {

    this.getSubSamplingTypes = function () {
        return [
            {value: "max_pooling", text: "Max Pooling"},
            {value: "average_pooling", text: "Average Pooling"}
        ];
    };

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "Pooling1D",
            "layerType": 'pooling1d',
            "category": "basic: pooling",
            "params": {
                "subsamplingType": "max_pooling",
                "subsamplingSizeWidth": 2
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/pooling1d/pooling1d.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-pooling-1d-v1.png"
    };
}
