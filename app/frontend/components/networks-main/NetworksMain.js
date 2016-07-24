(function () {
    'use strict';

    angular.module('networkMain', ['ngMaterial'])
        .component('networkMain', {
            templateUrl: '/frontend/components/networks-main/networks-main.html',
            bindings: {
                networkTemplates: '<',
                savedNetworks: '<'
            },
            controller: function ($mdDialog) {
                this.$onInit = function () {
                    this.networkTemplates = [
                        { name: 'Network Architecture Template 1'},
                        { name: 'Network Architecture Template 2'},
                        { name: 'Network Architecture Template 3'},
                        { name: 'Network Architecture Template 4'}
                    ];

                    this.savedNetworks = [
                        { name: 'Saved Network Architecture 1'},
                        { name: 'Saved Network Architecture 2'},
                        { name: 'Saved Network Architecture 3'},
                        { name: 'Saved Network Architecture 4'}
                    ];
                };

                this.createDialog = function() {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .title('Primary Action')
                            .textContent('Primary actions can be used for one click actions')
                            .ariaLabel('Primary click demo')
                            .ok('Awesome!')
                            .targetEvent(event)
                    );
                };
            }
        });
})();