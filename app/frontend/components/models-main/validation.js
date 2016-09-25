(function () {
    'use strict';

    angular
        .module('validation', ['ngMaterial'])
        .directive('validation', ['$compile', function ($compile) {

            function buildTemplate(modelType, modelId) {
                var inferenceType =
                {
                    'image-classification': '<classify-data-set model-id="' + modelId + '"></classify-data-set>'
                };
                return inferenceType[modelType];
            }

            return {
                scope: {
                    model: '@'
                },
                link: function (scope, element) {

                    scope.$watch('model', function (value) {
                        if (value) {
                            element.empty();
                            var modelJson = JSON.parse(scope.model);
                            var template = buildTemplate(modelJson.type, modelJson.name);
                            var compiled = $compile(template)(scope);
                            element.append(compiled);
                        }
                    });
                }
            };
        }]);

})();