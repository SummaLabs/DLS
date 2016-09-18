(function () {
    'use strict';
    angular.module('device', ['ngMaterial', "googlechart"])
        .component('device', {
            templateUrl: '/frontend/components/device/device.html',
            controller: function ($mdDialog, $rootScope, deviceService, $scope) {
                this.$onInit = function () {

                    var socket = io.connect('http://' + document.domain + ':' + location.port);
                    var self = this;
                    $scope.gpuChartsAll = []
                    socket.on('system_monitor', function (msg) {
                        console.log(msg)
                        $scope.deviceInfo = {
                                info: JSON.parse(msg)
                            }
                            //console.log(self.deviceInfo.info)

                        if ($scope.memChart) {
                            var memInfo = $scope.deviceInfo.info.mem;
                            var gpus = $scope.deviceInfo.info.gpu
                            var used = memInfo.used / 1000;
                            var free = memInfo.free / 1000;
                           

                            var ts = $scope.deviceInfo.info.ts

                            $scope.memChart.data.rows = [self.createRow(['Free', free]), self.createRow(['Used', used])];

                            $scope.gpuMemLineChart = self.createAreaChart('GPU Memory, Gb', ["Time", "Free", "Used"])
                            $scope.utilChart = self.createAreaChart('GPU Utilization, %', ["Time", "GPU Utilization", "Memory Utilization"])
                            
                            //TODO refactor
                            if (!$scope.gpuCharts) {
                                $scope.gpuCharts = []
                                for (var i = 0; i < gpus.length; i++) {
                                    $scope.gpuCharts.push(self.createPieChart("GPU Memory, Gb - " + i))
                                }
                                $scope.gpuChartsAll = $scope.gpuChartsAll.concat($scope.gpuCharts)

                            } else {
                                for(var i = 0; i < $scope.gpuCharts.length; i++){
                                    var chart = $scope.gpuCharts[i]
                                    var gpuMemUsed = gpus[i].mem_used.match(/\d+/)[0] / 1000;
                                    var gpuMemFree = gpus[i].mem_free.match(/\d+/)[0] / 1000;
                                    chart.data.rows = [self.createRow(['Free', gpuMemFree]), self.createRow(['Used', gpuMemUsed])];
                                }
                            }
                            
                            
                            if (!$scope.gpuMemLineCharts) {
                                $scope.gpuMemLineCharts = []
                                for (var i = 0; i < gpus.length; i++) {
                                    $scope.gpuMemLineCharts.push(self.createAreaChart('GPU Memory, Gb - ' + i, ["Time", "Free", "Used"]))
                                   
                                }
                                 $scope.gpuChartsAll = $scope.gpuChartsAll.concat($scope.gpuMemLineCharts)

                            } else {
                                for(var i = 0; i < $scope.gpuMemLineCharts.length; i++){
                                    var chart = $scope.gpuMemLineCharts[i]
                                    var gpuMemUsed = gpus[i].mem_used.match(/\d+/)[0] / 1000;
                                    var gpuMemFree = gpus[i].mem_free.match(/\d+/)[0] / 1000;
                                    chart.data.rows.push(self.createRow([ts, gpuMemFree, gpuMemUsed]));
                                    self.truncateTimeSeries(chart, 20)
                                }
                            }
                            
                            
                            if (!$scope.utilCharts) {
                                $scope.utilCharts = []
                                for (var i = 0; i < gpus.length; i++) {
                                    $scope.utilCharts.push(self.createAreaChart('GPU Utilization, % - ' + i, ["Time", "GPU Utilization", "Memory Utilization"]))
                                    
                                }
                                $scope.gpuChartsAll = $scope.gpuChartsAll.concat($scope.utilCharts)

                            } else {
                                for(var i = 0; i < $scope.utilCharts.length; i++){
                                    var chart = $scope.utilCharts[i]
                                    var gpuMemUtil = gpus[i].util_mem.match(/\d+/)[0];
                                    var gpuUtil = gpus[i].util_gpu.match(/\d+/)[0];
                                    chart.data.rows.push(self.createRow([ts, gpuUtil, gpuMemUtil]));
                                    self.truncateTimeSeries(chart, 20)
                                }
                            }

                      


                        }
                        $scope.$apply()
                    });
                };
                this.createPieChart = function (name) {
                    var chart = {};
                    chart.type = "PieChart";
                    chart.data = {
                        "cols": [
                            {
                                id: "t",
                                label: "Topping",
                                type: "string"
                        },
                            {
                                id: "s",
                                label: "Slices",
                                type: "number"
                        }],
                        "rows": []
                    };
                    chart.options = {
                        'title': name
                    };
                    return chart;
                };
                this.createAreaChart = function (name, cols) {
                    var chart = {};
                    chart.data = {
                        "cols": [
                            {
                                id: "t",
                                label: cols[0],
                                type: "string"
                        },
                            {
                                id: "f",
                                label: cols[1],
                                type: "number"
                        },
                            {
                                id: "u",
                                label: cols[2],
                                type: "number"
                        }
    ],
                        "rows": [

    ]
                    };
                    // $routeParams.chartType == BarChart or PieChart or ColumnChart...
                    chart.type = 'AreaChart';
                    chart.options = {
                        'title': name
                    };
                    return chart;
                }

                this.createRow = function (vals) {
                    var row = {
                        c: []
                    }
                    for (var i in vals) {
                        row.c.push({
                            v: vals[i]
                        })
                    }
                    return row;
                }
                this.truncateTimeSeries = function (chart, num) {
                    if (chart.data.rows.length > num) {
                        chart.data.rows.shift();
                    }
                }

                $scope.memChart = this.createPieChart("RAM Memory, Gb");


            }
        });
})();