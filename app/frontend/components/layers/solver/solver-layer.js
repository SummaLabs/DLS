angular.module('solverLayer', [])
    .service('solverLayer', [SolverLayer]);

function SolverLayer() {
    
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

    this.getOptimizers = function () {
        return [
            {value: "SGD", text: "Stochastic gradient descent (SGD)"},
            {value: "RMSprop", text: "RMSProp optimizer"},
            {value: "Adagrad", text: "Adagrad optimizer"},
            {value: "Adadelta", text: "Adadelta optimizer"},
            {value: "Adam", text: "Adam optimizer"},
            {value: "Adamax", text: "Adamax optimizer"},
            {value: "Nadam", text: "Nesterov Adam optimizer"}
        ];
    };

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "solver",
            "layerType": 'solver',
            "category": "output",
            "params": {
                "lossFunction": "categorical_crossentropy",
                "epochsCount": 2048,
                "snapshotInterval": 100,
                "validationInterval": 100,
                "batchSize": 1024,
                "learningRate": 0.01,
                "optimizer": "SGD"
            }
        }
    };
    
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/dense/dense.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/solver.gif"
    };
}