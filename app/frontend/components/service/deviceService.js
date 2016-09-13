angular.module('deviceService', [])
    .service('deviceService', ['$rootScope', '$http', DeviceService]);



function DeviceService($rootScope, $http) {
    var self = this;
    
    this.loadDeviceInfo = function() {
        var deviceInfo = {info: {}};
        $http({
            method: "GET",
            url: "/device/info"
        }).then(function mySucces(response) {
            deviceInfo.info = response.data
        }, function myError(response) {
            console.log(response);
        });
        return deviceInfo;
    };
    
    
}