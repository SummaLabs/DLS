angular.module('complex', [])
    .service('complex', ['$http', Complex]);

function Complex($http) {

    // let structurePath = "frontend/components/layers/basic/compex/complex.json";
    let complexLayers = {
        inception: {
            "name": "Inception",
            "layerType": 'inception',
            "category": "complex",
            "structure": "",
            "iconPath": "frontend/assets/icon/img/img-model1.png"

        },
        resnet: {
            "name": "Resnet",
            "layerType": 'resnet',
            "category": "complex",
            "structure": "",
            "iconPath": "frontend/assets/icon/img/img-model1.png"
        },
        vgg: {
            "name": "Vgg",
            "layerType": 'vgg',
            "category": "complex",
            "structure": "",
            "iconPath": "frontend/assets/icon/img/img-model1.png"
        }
    };

    loadLayer("layer_inception_v1", complexLayers.inception);
    loadLayer("layer_resnet_v1", complexLayers.resnet);
    loadLayer("layer_vgg_v1", complexLayers.vgg);

    this.getInception = function () {
        return complexLayers.inception;
    };
    this.getResnet = function () {
        return complexLayers.resnet;
    };
    this.getVgg = function () {
        return complexLayers.vgg;
    };
    let self = this;
    this.getAssessor = function(type) {
        return {
            getIconPath: function () {
                return self.getIconPath(type);
            }
        };
    };
    
    this.getIconPath = function (type) {
        return complexLayers[type].iconPath;
    };

    function loadLayer(path, layer) {
        loadStructure(path).then(
            function succes(response) {
                layer.structure = response.data;

            }, function error(response) {

            }
        );
    }

    function loadStructure(name) {
        return $http({
            method: "GET",
                url: "/network/complex/" + name
        })
    }

}
