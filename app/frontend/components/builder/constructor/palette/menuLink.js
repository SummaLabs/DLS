(function(){
  'use strict';

  angular.module('palette')
    .directive('menuLink', function () {
      return {
        scope: {
          section: '='
        },
        templateUrl: 'frontend/components/builder/constructor/palette/menuLink.html',
        link: function ($scope, $element) {

        }
      };
    })
})();