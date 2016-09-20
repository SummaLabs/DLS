/**
 * Created by ar on 11.09.16.
 */

'use strict';

angular.module('datasetImage2dPaging', ['ngMaterial', 'cl.paging'])
.component('datasetImage2dPaging', {
    restrict: 'E',
    templateUrl: '/frontend/components/preview/dataset-image2d-preview/dataset-image2d-paging.html',
     bindings: {
         paramDatabase: '@',
         paramClass:    '@'
     },
    controller: function ($scope, $http, dbinfoService) {
        var self        = this;
        self.$onInit = function () {
            $scope.currentPage = 0;
            $scope.paging = {
                totalImages: 0,
                total:  0,
                current: 1,
                align: 'center start',
                onPageChanged: loadPages
            };
            //
            self.numPerPage = 24;
            dbinfoService.getDatasetInfo('123').then(function successCallback(response) {
                var tdata = response.data;
                var tnum  = tdata[self.paramDatabase];
                self.listIndexes=[];
                $scope.paging.totalImages = tnum;
                var tmpCnt = 0;
                for(var ii=0; ii<$scope.paging.totalImages; ii+=self.numPerPage) {
                    var pStartImg = ii;
                    var pStopImg  = ii+self.numPerPage;
                    if (pStopImg>=$scope.paging.totalImages) {
                        pStopImg = $scope.paging.totalImages;
                    }
                    var tmp = {
                        from:   pStartImg,
                        to:     pStopImg
                    };
                    self.listIndexes.push(tmp);
                    tmpCnt++;
                }
                $scope.paging.total = tmpCnt;
                loadPages();
            },function errorCallback(response) {
                console.log(response);
            });
        };
        //
        function loadPages() {
            if($scope.paging.total>0) {
                console.log('Current page is : ' + $scope.paging.current);
                $scope.currentPage  = $scope.paging.current;
                self.currentIdx     = self.listIndexes[$scope.currentPage-1];
                //
                dbinfoService.getDatasetRange(
                    self.paramDatabase,self.currentIdx.from,self.currentIdx.to).then(
                    function successCallback(response) {
                        self.currentListIdx = response.data;
                    },
                    function errorCallback(response) {
                        console.log(response);
                    }
                );
            }
        }
    }
});


