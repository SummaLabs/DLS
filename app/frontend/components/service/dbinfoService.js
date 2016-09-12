/**
 * Created by ar on 12.09.16.
 */

angular.module('dbinfoService', [])
    .service('dbinfoService', [DBInfoService]);

function DBInfoService($http) {
    this.myData = [1,2,3,4,5,6];
    this.updateDataFromServer = function () {
        var tmp = [1,2,3,5];
        for(var ii=0; ii<10; ii++) {
            tmp.push({
                idx:    ii,
                data:   'data: ' + ii
            });
        }
        this.myData = tmp;
    };
    this.getData = function () {
        return [1,2,3,4,5];
    };
    return {
        data: this.myData
    }
}