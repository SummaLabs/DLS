(function () {
    'use strict';

    angular.module('networkMain', ['ngMaterial'])
        .component('networkMain', {
            templateUrl: '/frontend/components/networks-main/networks-main.html',
            bindings: {
                networkTemplates: '<',
                savedNetworks: '<'
            },
            controller: function ($scope, $mdDialog, $rootScope, $state, networkDataService) {
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
                        $state.go('designer');
                    };
                    if (!networkDataService.isChangesSaved()) {
                        showSaveNetworkDialog($event, loadNetworkFunc);
                    } else {
                        loadNetworkFunc.call();
                    }
                };

                this.removeNetworkByName = function ($event, name) {
                    var future = networkDataService.deleteNetwork(name);
                    if (future) {
                        future.then(function mySucces(response) {
                            if (response.data[0] && response.data[0] === 'ok') {
                                for (let a = 0; a < self.savedNetworks.length; a++) {

                                    if (self.savedNetworks[a] === name) {
                                        self.savedNetworks.splice(a, 1);
                                    }
                                }
                            }
                        }, function myError(response) {

                        });
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