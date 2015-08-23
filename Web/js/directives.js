//'use strict';

/* Directives */


angular.module('myApp.directives', [])
  .directive('appVersion', ['version', function (version) {
      return function (scope, elm, attrs) {
          elm.text(version);
      };
  }])
.directive('rotate', function () {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(attrs.degrees, function (rotateDegrees) {
                var transformedRotation = rotateDegrees;
                element.css({
                    '-moz-transform': 'rotate(' + transformedRotation + 'deg)',
                    '-webkit-transform': 'rotate(' + transformedRotation + 'deg)',
                    '-o-transform': 'rotate(' + transformedRotation + 'deg)',
                    '-ms-transform': 'rotate(' + transformedRotation + 'deg)'
                });
            });
        }
    }
});;
