angular.module('dataLayer', [])
    .service('dataLayer', [DataLayer]);

function DataLayer() {
    
    this.getDataTypes = function () {
        return [
            {value: "Image", text: "Image"},
            {value: "CSV", text: "CSV"}
        ];
    };

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "data",
            "layerType": 'data',
            "category": "input",
            "params": {
                "datasetType": "",
                "datasetId": ""
            }
        }
    };
            
    this.getTemplatePath = function () {
      return "frontend/components/layers/dense/layer_with_shapes_exp.svg";  
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/data.gif"
    };
}