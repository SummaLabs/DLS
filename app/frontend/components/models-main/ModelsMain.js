(function () {
    'use strict';

    angular.module('modelMain', ['ngMaterial'])
        .component('modelMain', {
            templateUrl: '/frontend/components/models-main/models-main.html',
            bindings: {
                models: '<'
            },
            controller: function ($mdDialog) {
                this.$onInit = function () {
                    this.models = [
                        { name: 'Model 1'},
                        { name: 'Model 2'},
                        { name: 'Model 3'},
                        { name: 'Model 4'}
                    ]
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