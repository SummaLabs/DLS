angular.module('pooling3dLayer', [])
    .service('pooling3dLayer', [Pooling3dLayer]);

function Pooling3dLayer() {

    this.getSubSamplingTypes = function () {
        return [
            {value: "max_pooling", text: "Max Pooling"},
            {value: "average_pooling", text: "Average Pooling"}
        ];
    };

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "Pooling3D",
            "layerType": 'pooling3d',
            "category": "basic: pooling",
            "params": {
                "subsamplingType": "max_pooling",
                "subsamplingSizeWidth":  2,
                "subsamplingSizeHeight": 2,
                "subsamplingSizeDepth":  2
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/pooling3d/pooling3d.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-pooling-3d-v1.png"
    };
}
