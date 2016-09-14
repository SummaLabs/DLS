/**
 * Created by ar on 12.09.16.
 */

angular.module('dbinfoService', [])
    .service('dbinfoService', ['$http', DBInfoService]);

function DBInfoService($http) {
    this.getServerPathFromUrlPath = function(urlPath) {
        return $http({
            method: "GET",
            url: "/dbpreview/getserverpath/" + urlPath
        });
    };
    this.chekServerPathFromUrlPath = function (urlPath) {
        return $http({
            method: "GET",
            url: "/dbpreview/checkpath/" + urlPath
        });
    };
    //
    this.getDatasetInfo = function (dbId) {
        return $http({
                method: 'POST',
                url: '/dbpreview/datasetinfo/',
                data: {
                    dbid:   dbId
                }
            });
    };
    this.getDatasetRange = function (dbId, pfrom, pto) {
        return $http({
            method: 'POST',
            url:    '/dbpreview/datasetrange/',
            params: {
                from:   pfrom,
                to:     pto,
                dbid:   dbId
            }
        });
    }
}