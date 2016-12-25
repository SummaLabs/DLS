angular.module('upsampling2dLayer', [])
    .service('upsampling2dLayer', [UpSampling2dLayer]);

function UpSampling2dLayer() {

    // this.getSubSamplingTypes = function () {
    //     return [
    //         {value: "max_pooling", text: "Max Pooling"},
    //         {value: "average_pooling", text: "Average Pooling"}
    //     ];
    // };

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "Upsampling2D",
            "layerType": 'upsampling2d',
            "category": "basic: upsampling",
            "params": {
                "subsamplingSizeWidth":  2,
                "subsamplingSizeHeight": 2
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/upsampling2d/upsampling2d.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-upsampling-2d-v1.png"
    };
}
