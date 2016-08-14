angular.module('networkDataLoaderService', [])
    .service('networkDataLoaderService', ['$http', NetworkDataLoaderService]);

function NetworkDataLoaderService($http) {
    
    this.loadSavedNetworksNames = function () {
        var network_names = [];
        $http({
            method: "GET",
            url: "/network/saved/names"
        }).then(function mySucces(response) {
            response.data.forEach(function(net_name) {
                network_names.push(net_name)
            });
        }, function myError(response) {
            console.log(response);
        });

        return network_names;
    };

    this.loadNetworkByName = function (name) {
        return $http({
            method: "GET",
            url: "/network/load/" + name
        })
    };

    this.saveNetwork = function (network) {
        return $http({
            url: '/network/save',
            method: 'POST',
            data:network,
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        })
    };
}