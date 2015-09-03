//'use strict';
moment.defineLocale('en', {
    relativeTime: {
        future: "in %s",
        past: "%s",
        s: function (number, withoutSuffix, key, isFuture) {
            return number + ' s';
        },
        m: "1m",
        mm: function (number, withoutSuffix, key, isFuture) {
            return number + 'm';
        },
        h: "1h",
        hh: "%h",
        d: "1d",
        dd: "%dd",
        M: "1m",
        MM: "%dm",
        y: "1y",
        yy: "%dy"
    }
});

// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'ngAnimate',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'angularMoment',
  'highcharts-ng',
  'uiGmapgoogle-maps'
]).
constant('amTimeAgoConfig', {
    withoutSuffix: true
}).
config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/om', { templateUrl: 'partials/om.html'});
    $routeProvider.when('/stasjoner', { templateUrl: 'partials/stasjoner.html', controller: 'StasjonerCtrl' });
    $routeProvider.when('/stasjoner2', { templateUrl: 'partials/stasjoner2.html', controller: 'StasjonerCtrl' });

    $routeProvider.when('/mine', { templateUrl: 'partials/mine.html', controller: 'StasjonerCtrl' });

    $routeProvider.when('/kart', { templateUrl: 'partials/kart.html', controller: 'StasjonerCtrl' });
    $routeProvider.when('/stasjon/:Id', { templateUrl: 'partials/stasjon.html', controller: 'StasjonCtrl' });
  $routeProvider.otherwise({ redirectTo: '/stasjoner' });
}]);
