(function () {
    'use strict';

    angular.module('mainDataSet', ['ngMaterial'])
        .component('mainDataSet', {
            templateUrl: '/frontend/components/data-set-main/main-data-set.html',
            bindings: {
                models: '<'
            },
            controller: function ($mdDialog) {
                this.$onInit = function () {
                    this.models = [
                        { name: 'Data Set 1'},
                        { name: 'Data Set 2'},
                        { name: 'Data Set 3'},
                        { name: 'Data Set 4'}
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