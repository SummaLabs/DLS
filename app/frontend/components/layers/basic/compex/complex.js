angular.module('complex', [])
    .service('complex', ['$http', Complex]);

function Complex($http) {

    // let structurePath = "frontend/components/layers/basic/compex/complex.json";
    let data = {
        "complex": 0,
        "name": "Complex",
        "layerType": 'complex',
        "category": "complex",
        "structure": "",
    };

    let future = loadStructure('complex');
    future.then(function succes(response) {
       data.structure = response.data;

    }, function error(response) {

    });
    
    this.getDefault = function () {
        return data;
    };
    
    this.getIconPath = function () {
        return "frontend/assets/img/palette/basic/layer-convolution2d-v1.png"
    };

    // this.getStructurePath = function () {
    //     return structurePath;
    // }
    
    function loadStructure(name) {
        return $http({
            method: "GET",
                url: "/network/complex/" + name
        })
    }
}
