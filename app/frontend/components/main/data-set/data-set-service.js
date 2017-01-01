/**
 * Created by ar on 12.09.16.
 */

angular.module('datasetService', [])
    .service('datasetService', ['$http', DataSetService]);

function DataSetService($http) {
    var self = this;
    
    self.getDataSetsMetadata = function () {
        return $http({
                method: 'GET',
                url: '/dataset/all/metadata/list'
            });
    };
    
    self.getDataSetMetadata = function (id) {
        return $http({
                method: 'GET',
                url: '/dataset/' + id + '/metadata'
            });
    };
    
    self.getDataSetMetadataHists = function (id) {
        return $http({
                method: 'GET',
                url: '/dataset/' + id + '/metadata/hists'
            });
    };
    
    self.getDataSetImgPreview = function (id) {
        return $http({
                method: 'GET',
                url: '/dataset/' + id + '/img/preview'
            });
    };
    
    self.getDataSetImgMean = function (id) {
        return $http({
                method: 'GET',
                url: '/dataset/' + id + '/img/mean'
            });
    };
    
    self.getDataSetMetadataInRange = function (id, type, label, from, to) {
        return $http({
            method: 'POST',
            url:    '/dataset/metadata/range',
            params: {
                id:       id,
                type:     type,
                label:    label,
                from:     from,
                to:       to
            }
        });
    };
    
    self.getServerPathFromUrlPath = function(urlPath) {
        return $http({
            method: "GET",
            url: "/dbpreview/getserverpath/" + urlPath
        });
    };
    
    self.chekServerPathFromUrlPath = function (urlPath) {
        return $http({
            method: "GET",
            url: "/dbpreview/checkpath/" + urlPath
        });
    };
    
    self.getDatasetInfo = function (dbId) {
        return $http({
                method: 'POST',
                url: '/dbpreview/datasetinfo/',
                data: {
                    dbid:   dbId
                }
            });
    };
    
    self.getDatasetRange = function (dbId, pfrom, pto) {
        return $http({
            method: 'POST',
            url:    '/dbpreview/datasetrange/',
            params: {
                from:   pfrom,
                to:     pto,
                dbid:   dbId
            }
        });
    };

    self.deleteDataset = function (dbId){
        console.log(dbId);
        return $http({
            method: "GET",
            url: "/dbpreview/delete/"+ dbId
        })
    };
}