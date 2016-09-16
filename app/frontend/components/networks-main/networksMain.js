(function () {
    'use strict';

    angular.module('networkMain', ['ngMaterial'])
        .component('networkMain', {
            templateUrl: '/frontend/components/networks-main/networks-main.html',
            bindings: {
                networkTemplates: '<',
                savedNetworks: '<'
            },
            controller: function ($mdDialog, $rootScope, $location, networkDataService) {
                var self = this;
                this.$onInit = function () {
                    this.networkTemplates = [
                        { name: 'Network Architecture Template 1'},
                        { name: 'Network Architecture Template 2'},
                        { name: 'Network Architecture Template 3'},
                        { name: 'Network Architecture Template 4'}
                    ];

                    self.savedNetworks = [];
                    var future = networkDataService.loadSavedNetworks();
                    future.then(function mySucces(response) {
                        response.data.forEach(function (net_name) {
                            self.savedNetworks.push(net_name)
                        });
                    }, function myError(response) {
                    });
                };

                this.createOpenNetworkDialog = function ($event, name) {
                    var loadNetworkFunc = function () {
                        networkDataService.loadNetwork(name);
                        networkDataService.setChangesSaved(true);
                        // $rootScope.$broadcast('switchTab', {id: 1});
                        $location.url("/designer");
                    };
                    if (!networkDataService.isChangesSaved()) {
                        showSaveNetworkDialog($event, loadNetworkFunc);
                    } else {
                        loadNetworkFunc.call();
                    }
                };

                function showSaveNetworkDialog($event, loadNetworkFunc) {
                    var parentEl = angular.element(document.body);
                    $mdDialog.show({
                        clickOutsideToClose: true,
                        parent: parentEl,
                        targetEvent: $event,
                        templateUrl: '/frontend/components/dialog/save-network.html',
                        locals: {},
                        controller: DialogController
                    });

                    function DialogController($scope, $mdDialog) {
                        $scope.network =
                        {
                            name: networkDataService.getNetwork().name,
                            description: networkDataService.getNetwork().description
                        };

                        $scope.saveNetwork = function () {
                            networkDataService.saveNetwork($scope.network.name, $scope.network.description);
                            $mdDialog.hide();
                            loadNetworkFunc.call();
                        };

                        $scope.closeDialog = function () {
                            $mdDialog.hide();
                        }
                    }
                }
            }
        });
})();