angular.module('dataoutputLayer', [])
    .service('dataoutputLayer', [DataOutputLayer]);

function DataOutputLayer() {
    
    this.getLossFunctions = function () {
        return [
            {value: "mean_squared_error", text: "Mean Squared Error"},
            {value: "mean_absolute_error", text: "Mean Absolute Error"},
            {value: "mean_absolute_percentage_error", text: "Mean Absolute Percentage Error"},
            {value: "mean_squared_logarithmic_error", text: "Mean Squared Logarithmic Error"},
            {value: "squared_hinge", text: "Squared Hinge"},
            {value: "hinge", text: "Hinge"},
            {value: "binary_crossentropy", text: "Binary Crossentropy"},
            {value: "categorical_crossentropy", text: "Categorical Cross Entropy"},
            {value: "kullback_leibler_divergence", text: "Kullback Leibler Divergence"},
            {value: "poisson", text: "Poisson"},
            {value: "cosine_proximity", text: "Cosine Proximity"}

        ];
    };
    

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "DataOutput",
            "layerType": 'dataoutput',
            "category": "input/output",
            "params": {
                "lossFunction": "categorical_crossentropy",
                "datasetId": ""
            }
        }
    };
    
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/dataoutput/dataoutput-node.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/components/layers/basic/dataoutput/dataoutput-node.png"
    };
}