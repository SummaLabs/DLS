(function () {
    'use strict';

    angular.module('modelMain', ['ngMaterial'])
        .component('modelMain', {
            templateUrl: '/frontend/components/models-main/models-main.html',
            bindings: {
                models: '<',
                selected:'<'
            },
            controller: function (modelService, $rootScope) {

                var self = this;
                this.$onInit = function () {
                    self.models = [];
                    var future = modelService.loadAllModels();
                    future.then(function mySucces(response) {
                        response.data.forEach(function (model) {
                            self.models.push(model)
                            self.selected = self.models[0];
                        });
                    }, function myError(response) {
                        console.log(response);
                    });
                    
                };

                this.$selectModel = function( model ) {
                    self.selected = angular.isNumber(model) ? $scope.models[model] : model;
                };

            }
        });
})();