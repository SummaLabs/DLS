/**
 * Created by ar on 11.09.16.
 */

'use strict';

angular.module('datasetImage2dPreview', ['ngMaterial', 'datasetImage2dPaging', 'cl.paging'])
.component('datasetImage2dPreview', {
    templateUrl: '/frontend/components/preview/dataset-image2d-preview/dataset-image2d-preview.html',
    bindings: {
        listClasses: '<'
    },
    controller: function ($scope, $http) {
        var self = this;
        self.listClasses = [];
        self.$onInit = function () {
            var urlInfo = '/dbpreview/datasetinfo/';
            self.listClasses = [];
            $http({
                method: 'GET',
                url: urlInfo
            }).then(function successCallback(response) {
                var tdata = response.data;
                var lstKeys = Object.keys(tdata);
                var tret=[];
                for(var ii=0; ii<lstKeys.length; ii++) {
                    var tkey = lstKeys[ii];
                    var tnum = tdata[tkey];
                    tret.push({
                        info:   tkey,
                        idx:    tkey,
                        num:    tnum
                    });
                }
                self.listClasses = tret;
                console.log(self.listClasses);
            }, function errorCallback(response) {
                console.log(response);
            });
        };
    }
});