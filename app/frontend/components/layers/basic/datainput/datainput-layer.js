angular.module('datainputLayer', [])
    .service('datainputLayer', [DataInputLayer]);

function DataInputLayer() {
    
    this.getDataTypes = function () {
        return [
            {value: "Image2D", text: "Image2D"},
            {value: "CSV", text: "CSV"}
        ];
    };

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "DataInput",
            "layerType": "datainput",
            "category": "input/output",
            "params": {
                "datasetType": "",
                "datasetId": ""
            }
        }
    };
            
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/datainput/datainput-node.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/components/layers/basic/datainput/datainput-node.png"
    };
}