//'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('StasjonerCtrl', ['$scope', '$http', function ($scope, $http) {
      $scope.map1 = { center: { latitude: 59, longitude: 10 }, zoom1: 6 };
      //Bør refaktoreres til en service
      $scope.changeIsMySpot = function (station) {
          if (typeof (Storage) !== "undefined") {
              var mySpots = JSON.parse(localStorage.getItem("MySpots")) || [];
              if (!station.isMySpot)
                  mySpots.pop(station.StationID);
              else
                  mySpots.push(station.StationID);
              var savestring = JSON.stringify(mySpots)
              localStorage.setItem("MySpots", savestring);
          }
      }

      $scope.windowOptions = {
          visible: true
      };

      $scope.stations = []
      $scope.stationsProm = $http.get('https://jsonp.afeld.me/?url=http://vindsiden.no/api/stations/')
          .success(function (data) {
              $scope.stations = _.map(data, function (a, b, c) {
                  //For Kart
                  a.longitude = a.Longitude;
                  a.latitude = a.Latitude;
                  a.options = {
                      labelInBackground: false,
                  };
                  return a;
              });

              if (typeof (Storage) !== "undefined") {
                  var mySpots = JSON.parse(localStorage.getItem("MySpots")) || [];

                  _.forEach(mySpots, function (a) {
                      $scope.stations = _.map($scope.stations, function (b) {
                          if (b.StationID == a)
                              b.isMySpot = true;
                          return b;
                      });
                  });
              }

              _.forEach(data, function (a, b, c) {
                  getMeasurements(a);
              });
          });

      var getMeasurements = function (a, b, c) {
          if (!a.StationID) return;
          var http = $http.get('https://jsonp.afeld.me/?url=http://vindsiden.no/api/measurements/' + a.StationID + "?date=" + new Date().toJSON().slice(0, 10))// 2014-09-13)
          http.success(function (a, b, c, d, e) {
              if (!a || a.length < 1) return;
              var last = a[a.length - 1];
              var split = d.url.split('/');
              var id = split[split.length - 1].split('?')[0];

              //Refaktoreres med _.. Kode byttes ut eller omskrives, pga dirty.
              for (var i = 0; i <= $scope.stations.length; i++) {
                  if (!!$scope.stations[i])
                      if ($scope.stations[i].StationID == id) {
                          $scope.stations[i].measurements = a;
                          $scope.stations[i].Now = a[a.length - 1];

                          $scope.stations[i].Prev = a[a.length - 2];
                          $scope.stations[i].Prevprev = a[a.length - 3];

                          var style = "-moz-transform: rotate(" + last.DirectionAvg + 'deg);' +
                            "-webkit-transform: rotate(" + last.DirectionAvg + 'deg);' +
                            "-o-transform: rotate(" + last.DirectionAvg + 'deg);' +
                            "-ms-transform': rotate(" + last.DirectionAvg + 'deg)';

                          //var label =
                          //    "<a href='vindsiden.no' title='This is my tooltip'><strong>↓" +
                          //    '<img height="16" width="16" src="../img/arrow_up.png" ' +
                          //    'style="' +
                          //    style +
                          //    '"/>' +
                          //    last.WindAvg.toFixed(1) +
                          //    "</strong></a>";

                          var label ='<h5><div style="' + style + '"><strong>↓</strong>'+last.WindAvg.toFixed(1)+'</div></h5>';
                          
                          $scope.stations[i].options = {
                              labelContent: label,
                              labelInBackground: false
                          };
                      }
              }
          });
      }
  }])
.controller('StasjonCtrl', ['$scope', '$http', '$routeParams', '$timeout', function ($scope, $http, $routeParams, $timeout) {
    $scope.Id = $routeParams.Id;

    $scope.station = $http.get('https://jsonp.afeld.me/?url=http://vindsiden.no/api/stations/' + $scope.Id)
        .success(function (data) {
            $scope.station = data;
            $scope.map1.center = { latitude: data.Latitude, longitude: data.Longitude };
            $scope.map1.location = { latitude: data.Latitude, longitude: data.Longitude };
        });

    $scope.map1 = { center: { latitude: 45, longitude: -73 }, location: { latitude: 45, longitude: -73 }, zoom1: 9 };

    $scope.measurements = $http.get('https://jsonp.afeld.me/?url=http://vindsiden.no/api/measurements/' + $scope.Id + "?date=" + new Date().toJSON().slice(0, 10))// 2014-09-13)
        .success(function (data) {
            $scope.measurements = data;

            var avr = _.map(data, function (a, b, c) {
                return [Date.parse(a.Time), a.WindAvg];
            });
            $scope.chartConfig.series.push({
                name: "Gjennomsnitt",
                data: avr,
                color: 'black',
                zIndex: 5
            });

            var ranges = _.map(data, function (a, b, c) {
                return [Date.parse(a.Time), a.WindMin, a.WindMax];
            });
            $scope.chartConfig.series.push({
                name: 'Min-max',
                data: ranges,
                fillOpacity: 0.2,
                type: 'arearange'
            });

            var temp = _.map(data, function (a, b, c) {
                return [Date.parse(a.Time), a.Temperature1];
            });
            $scope.chartConfig.series.push({
                name: "Temperatur",
                data: temp,
                color: 'red',
                visible: false
            });

            var dir = _.map(data, function (a, b, c) {
                return [Date.parse(a.Time), a.DirectionAvg];
            });

            $scope.chartConfig.series.push({
                name: "Retning",
                data: dir,
                color: 'yellow',
                visible: false
            });

            //$scope.drawWindDirection();

            $timeout(function () {
                $scope.drawWindDirection();
            }, 1000);

            
        });

    $scope.drawWindDirection = function () {
        var data = $scope.measurements;

        var minTicks = Date.parse(_.min(data, function (a, b, c) { return Date.parse(a.Time) }).Time);
        var maxTicks = Date.parse(_.max(data, function (a, b, c) { return Date.parse(a.Time) }).Time);
        var deltaTicks = maxTicks - minTicks;
        debugger;
        var deltaPixels = $scope.hgChart.plotSizeX;

        var antallTickPerPix = deltaTicks / deltaPixels;
        var dir = _.each(data, function (a, b, c) {

            var x = $scope.hgChart.plotLeft +5+ ((Date.parse(a.Time) - Date.parse(data[0].Time)) / antallTickPerPix);
            var y = 30;

            $scope.hgChart.renderer.text('↓', x, y).attr({
                rotation: a.DirectionAvg,
                zIndex: 10
            }).css({
                fontSize: '18pt',
                color: 'black'                
            }).add();
        });
    }


    $scope.chartConfig = {
        chart: {
            type: 'spline'
        },
        //tooltip: {
        //    valueDecimals: 2,
        //},
        yAxis: {
            min: 0,
            tickInterval: 5,
            minorTickInterval: 1,
            gridLineWidth: 2,
            title: { text: '' },
            opposite:true,
            plotBands: [{
                from: 8,
                to: 15,
                color: 'rgba(0, 255, 0, 0.05)'
            }, {
                from: 18,
                to: 100,
                color: 'rgba(255, 0, 0, 0.05)',

            }]
        },
        series: [],
        title: {
            text: ''
        },
        xAxis: {
            type: 'datetime',
            tickInterval: 60 * 60 * 1000,
            gridLineWidth: 1,
            //tickInterval: 6,
            //minorTickInterval: 60 * 60 * 1000*2,
            //gridLineWidth: 2,
            labels: {
                formatter: function () {
                    return Highcharts.dateFormat('%H', this.value);
                }
            }
        },
        func: function (chart) {
            $scope.hgChart = chart;
        }
    }
}]);
