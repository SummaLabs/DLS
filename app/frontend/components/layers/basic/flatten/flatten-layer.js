angular.module('flattenLayer', [])
    .service('flattenLayer', [FlattenLayer]);

function FlattenLayer() {

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "Flatten",
            "layerType": 'flatten',
            "category": "basic",
            "params": {
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/flatten/flatten.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-flatten-v1.png"
    };
}
