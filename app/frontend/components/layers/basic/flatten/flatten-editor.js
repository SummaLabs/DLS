'use strict';

angular
.module('flattenEditor', ['ngMaterial'])
.directive('flattenEditor', function () {
    return {
        scope: {
            layerData: '='
        },
        templateUrl: "frontend/components/layers/basic/flatten/flatten-editor.html",
        controller: function () {
            this.$onInit = function () {
            }
        }
    };
});