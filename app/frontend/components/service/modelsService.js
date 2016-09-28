/**
 * Created by ar on 12.09.16.
 */

angular.module('modelsService', [])
    .service('modelsService', ['$http', DLSModelsService]);

function DLSModelsService($http) {
    var self = this;
    self.checkNetworkFast = function (network) {
        return $http({
                method: 'POST',
                url:    '/models/checkmodel/',
                data:   network,
                headers: {'Content-Type': 'application/json;charset=utf-8'}
            });
    };
    self.calcModelShape = function (network) {
        return $http({
                method: 'POST',
                url:    '/models/calcshape/',
                data:   network,
                headers: {'Content-Type': 'application/json;charset=utf-8'}
            });
    };
    self.getListModelsInfo = function (network) {
        return $http({
            method: 'POST',
            url:    '/models/listinfo/'
        });
    }
}
