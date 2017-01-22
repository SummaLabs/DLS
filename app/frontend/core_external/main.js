/**
 * Created by ar on 17.01.17.
 */

import {test_network_library, calculateShapesInModel} from './models/network_lib';

angular.module('DemoNetworkFlowParser', ['ngMaterial'])
    .controller('ControllerFlowParsing', ControllerFlowParsing);

function ControllerFlowParsing($scope, $http) {
    var self = this;
    self.testArray      = [1,2,3,4,5,6,7,8,9];
    $scope.modelAll     = null;
    $scope.modelLayers  = null;
    test_network_library();
    let pathJsonTest1 = 'data/testnet_simple_cnn_model1.json';
    let pathJsonTest2 = 'data/testnet_multi_input_multi_output_v1.json';
    $http.get(pathJsonTest2).success(function (data) {
        console.log('JSON-Load: success');
        let tmpModelJson   = data;
        $scope.modelLayers = data.layers;
        calculateShapesInModel(tmpModelJson);
        $scope.modelAll    = tmpModelJson;
        // console.log($scope.modelLayers);
    }).error(function (data) {
        console.log('JSON-Load: ERROR!!!');
    });
}




