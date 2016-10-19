(function () {
    'use strict';

    angular
        .module('validation', ['ngMaterial'])
        .directive('validation', ['$compile', function ($compile) {

            function buildTemplate(modelType, modelId) {
                var inferenceType =
                {
                    'image2d-classification': '<roc-analysis model-id="' + modelId + '"></roc-analysis>'
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
                            var template = buildTemplate(modelJson.type, modelJson.id);
                            var compiled = $compile(template)(scope);
                            element.append(compiled);
                        }
                    });
                }
            };
        }]);

})();