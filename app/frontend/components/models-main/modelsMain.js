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
                        { name: 'Model1111111111111111111111111111111111111111111111111111111'},
                        { name: 'Model2222222222222222222222222222222222222222222222222222222'},
                        { name: 'Model3222222222222222222222222222222222222222222222222222222'},
                        { name: 'Model4222222222222222222222222222222222222222222222222222222'}
                    ];
                    this.selected = this.models[0];
                };

                this.$selectModel = function( model ) {
                    this.selected = angular.isNumber(model) ? $scope.models[model] : model;
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