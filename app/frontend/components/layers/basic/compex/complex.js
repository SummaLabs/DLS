angular.module('complex', [])
    .service('complex', [Complex]);

function Complex() {

    let structurePath = "frontend/components/layers/basic/compex/complex.json";
    let data = {
        "complex": 0,
        "name": "Complex",
        "layerType": 'complex',
        "category": "complex",
        "structure": "",
    };

    let future = loadStructure(name);
    future.then(function succes(response) {
       data.structure = response.structure;
    }, function error(response) {

    });
    
    this.getDefault = function () {
        return data;
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-convolution2d-v1.png"
    };

    this.getStructurePath = function () {
        return structurePath;
    }
    
    function loadStructure(name) {
        return $http({
            method: "GET",
            url: "/network/complex/" + name
        })
    }
}
