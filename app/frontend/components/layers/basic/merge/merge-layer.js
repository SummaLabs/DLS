angular.module('mergeLayer', [])
    .service('mergeLayer', [MergeLayer]);

function MergeLayer() {
    
    this.getMergeTypes = function () {
        return [
            {value: "concat",   text: "Concatenation"},
            {value: "sum",      text: "Sum"},
            {value: "mul",      text: "Multiplication"},
            {value: "ave",      text: "Averaging"},
            {value: "cos",      text: "Cosine"},
            {value: "dot",      text: "Dot Porduct"},
            {value: "max",      text: "Maximum"}
        ];
    };

    this.getMergeAxis = function () {
        return ["-1", "0", "1", "2", "3"];
    };

    this.getDefault = function () {
        return {
            "id": 0,
            "name": "Merge",
            "layerType": "merge",
            "category": "basic",
            "params": {
                "mergeType":    "concat",
                "mergeAxis":    "-1"
            }
        }
    };
        
    this.getTemplatePath = function () {
      return "frontend/components/layers/basic/merge/merge.svg";
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-merge-v1.png"
    };
}
