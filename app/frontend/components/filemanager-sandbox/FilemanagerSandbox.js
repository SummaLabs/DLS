/**
 * Created by MSU on 06/08/2016.
 */

(function () {
    'use strict';

    angular.module('filemanagerSandbox', ['ngMaterial'])
        .component('filemanagerSandbox', {
            templateUrl: '/frontend/components/filemanager-sandbox/filemanager-sandbox.html',
            bindings: {

            },
            controller: function () {

                this.$onInit = function () {
                    console.log("Sandbox init");
                };

            }
        });
})();