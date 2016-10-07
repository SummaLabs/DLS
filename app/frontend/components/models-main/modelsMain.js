(function () {
    'use strict';

    angular.module('modelMain', ['ngMaterial'])
        .component('modelMain', {
            templateUrl: '/frontend/components/models-main/models-main.html',
            bindings: {
                models: '<',
                selected:'<'
            },
            controller: function (modelService, modelsService) {
                var self = this;
                this.$onInit = function () {
                    self.models = [];

                    modelsService.listInfo().then(
                        function successCallback(response) {
                            response.data.forEach(function (model) {
                                var info = model.info;
                                self.models.push({
                                    'name': info.name,
                                    'network': "Test Network",
                                    'dataSet': info['dataset-name'],
                                    'type': info.type,
                                    'date': info.date.str + " " + info.time.str,
                                    'size': info.size.str
                                });
                            });
                            self.selected = self.models[0];
                        },
                        function errorCallback(response) {
                            console.log(response.data);
                        })
                };

                this.$selectModel = function( model ) {
                    self.selected = angular.isNumber(model) ? $scope.models[model] : model;
                };

            }
        });
})();