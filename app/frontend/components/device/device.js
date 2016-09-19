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
                        if ($scope.memChart && $scope.memLineChart) {
                            var memInfo = $scope.deviceInfo.info.mem;
                            var gpus = $scope.deviceInfo.info.gpu
                            var used = memInfo.used / 1000;
                            var free = memInfo.free / 1000;
                            var shared = memInfo.shared / 1000;
                            var total = memInfo.total / 1000;
                            var cached = memInfo.cached / 1000;
                            var buffers = memInfo.buffers / 1000;
                            var ts = $scope.deviceInfo.info.ts

                            //process RAM Charts
                            $scope.memChart.data.rows = [self.createRow(['Free', free]), self.createRow(['Used', used])];
                            $scope.memLineChart.data.rows.push(self.createRow([ts, free, used, total, cached, shared, buffers]));
                            self.truncateTimeSeries($scope.memLineChart, 20)
                                                        
                            //Process GPU Charts
                            self.processChart(self, $scope, 'gpuCharts', gpus,
                                function(i){
                                    return self.createPieChart("GPU Memory, Gb - " + i)}, 
                                function(chart, gpu){
                                    var gpuMemUsed = gpu.mem_used.match(/\d+/)[0] / 1000;
                                    var gpuMemFree = gpu.mem_free.match(/\d+/)[0] / 1000;
                                    chart.data.rows = [self.createRow(['Free', gpuMemFree]), self.createRow(['Used', gpuMemUsed])];
                            });
                            self.processChart(self, $scope, 'gpuMemLineCharts', gpus,
                                function(i){
                                    return self.createAreaChart('GPU Memory, Gb - ' + i, ["Time", "Free", "Used"])}, 
                                function(chart, gpu){
                                    var gpuMemUsed = gpu.mem_used.match(/\d+/)[0] / 1000;
                                    var gpuMemFree = gpu.mem_free.match(/\d+/)[0] / 1000;
                                    chart.data.rows.push(self.createRow([ts, gpuMemFree, gpuMemUsed]));
                            });
                            self.processChart(self, $scope, 'utilCharts', gpus,
                                function(i){
                                    return self.createAreaChart('GPU Utilization, % - ' + i, ["Time", "GPU Utilization", "Memory Utilization"])}, 
                                function(chart, gpu){
                                    var gpuMemUtil = gpu.util_mem.match(/\d+/)[0];
                                    var gpuUtil = gpu.util_gpu.match(/\d+/)[0];
                                    chart.data.rows.push(self.createRow([ts, gpuUtil, gpuMemUtil]));
                            });




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
                    chart.data = {cols: [], rows: []}
                    chart.data.cols.push({
                                id: "t",
                                label: cols[0],
                                type: "string"
                        })
                        for(var i =1; i< cols.length; i++){
                            chart.data.cols.push({
                                id: "c" + i,
                                label: cols[i],
                                type: "number"
                        })
                    }
                    chart.type = 'AreaChart';
                    chart.options = {
                        'title': name
                    };
                    return chart;
                }
                //row for line charts
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
                //restrict line charts to some number of points
                this.truncateTimeSeries = function (chart, num) {
                    if (chart.data.rows.length > num) {
                        chart.data.rows.shift();
                    }
                }
                //performs initialization and update of GPU related charts
                this.processChart = function (context, $scope, name, gpus, factoryMethod, pushRowMethod) {
                    if (!$scope[name]) {
                        $scope[name] = []
                        for (var i = 0; i < gpus.length; i++) {
                            $scope[name].push(factoryMethod(i))
                        }
                        $scope.gpuChartsAll = $scope.gpuChartsAll.concat($scope[name])

                    } else {
                        for (var i = 0; i < $scope[name].length; i++) {
                            var chart = $scope[name][i]
                            pushRowMethod(chart, gpus[i])
                            context.truncateTimeSeries(chart, 20)
                        }
                    }

                }
               
                $scope.memChart = this.createPieChart("RAM Memory, Gb");
                $scope.memLineChart = this.createAreaChart('RAM Memory, Gb', ["Time", "Free", "Used", "Total", "Shared", "Cached", "Buffers"])


            }
        });
})();