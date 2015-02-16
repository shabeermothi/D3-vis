var colorMatrixController = ['$scope', function($scope){
    console.log("ColorMatrixController :: ReadyState");
}];

var colorMatrixDirective = ['$window', '$timeout', '$http', function($window, $timeout, $http){

    return {
        restrict: 'E',
        template: '<div id="color-matrix-container" class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>',
        scope: {},
        link: function(scope, element, attrs){

            drawColorMatrix();

            function drawColorMatrix(){

                alert("Width of parent ==> "+ d3.select("#color-matrix-container").style("width"));

                var margin = { top: 70, right: 0, bottom: 100, left: 55 },
                    width = d3.select("#color-matrix-container").style("width"),
                    height = d3.select("#color-matrix-container").style("height"),
                    legendSize = Math.floor(260 / 24),
                    legendElementWidth = legendSize*2,
                    buckets = 15,
                    colorScheme = {
                        dark : ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
                        light: ['#f6faaa','#FEE08B','#FDAE61','#F46D43','#D53E4F','#9E0142'],
                        binary: ['#ff0000', '#00ff00']
                    },
                    colors = [],
                    metadataAttributes = {};

                if(attrs.metadataUrl != undefined){
                    $http.get(attrs.metadataUrl)
                        .then(function(response) {
                            metadataAttributes = response.data.metadata.attributes;
                            colors = (metadataAttributes.colorScheme) ? colorScheme[metadataAttributes.colorScheme] : colorScheme['light'];

                            getColorMatrixData();
                        });
                }else{
                    colors = colorScheme['light'];
                    getColorMatrixData();
                }

                function getColorMatrixData(){

                    d3.json(attrs.url,
                        function(error, data) {

                            data.responseData.forEach(function(d) {
                                d.usage = d[Object.keys(d)[2]];
                                d.dashboard = d[Object.keys(d)[1]]
                                d.timestamp = d[Object.keys(d)[0]];
                            });

                            var uniqueValues = function(value, index, self){
                                return self.indexOf(value) === index;
                            };

                            var dashboardName = data.responseData.map(function(obj){ return obj.dashboard; });
                            var plotDate = data.responseData.map(function(obj){ return obj.timestamp; });

                            dashboardName = dashboardName.filter(uniqueValues);
                            plotDate = plotDate.filter(uniqueValues);

                            gridSize = 20;

                            width = width;
                            height = ((dashboardName.length) * gridSize);

                            var svg = d3.select("#color-matrix-container")
                                .append("svg")
                                .attr("width", width)
                                .attr("height", height + margin.top + margin.bottom)
                                .append("g")
                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                            var colorScale = d3.scale.quantile()
                                .domain([0, buckets - 1, d3.max(data.responseData, function (d) { return d.usage; })])
                                .range(colors);

                            var yAxisLabels = svg.selectAll(".yAxisLabel")
                                .data(dashboardName)
                                .enter().append("text")
                                .text(function (d) { return (d.length > 11) ? (d.substring(0, 9) + "..") : d; })
                                .attr("x", 30)
                                .attr("y", function (d, i) { return i * gridSize; })
                                .style("text-anchor", "end")
                                .attr("transform", "translate(-6," + (gridSize - 10) + ")")
                                .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "yAxisLabel mono axis axis-workweek" : "yAxisLabel mono axis"); });

                            var xAxisLabels = svg.selectAll(".xAxisLabel")
                                .data(plotDate)
                                .enter().append("text")
                                .text(function(d, i) { return (i%2 != 0) ? d : ""; })
                                .attr("x", 30)
                                .attr("y", function(d, i) { return (i * gridSize) + 30; })
                                .style("text-anchor", "middle")
                                .attr("transform", "translate(" + gridSize + ", -6) rotate(-90)")
                                .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "xAxisLabel mono axis axis-worktime" : "xAxisLabel mono axis"); });

                            var heatMap = svg.selectAll(".hour")
                                .data(data.responseData)
                                .enter().append("rect")
                                .attr("x", function(d) { return ((plotDate.indexOf(d.timestamp)) * gridSize) + 30; })
                                .attr("y", function(d) { return (dashboardName.indexOf(d.dashboard)) * gridSize; })
                                .attr("rx", 4)
                                .attr("ry", 4)
                                .attr("class", "hour bordered")
                                .attr("width", gridSize)
                                .attr("height", gridSize)
                                .style("fill", colors[0]);

                            heatMap.transition()
                                .ease("linear")
                                .duration(1000).delay(500)
                                .style("fill", function(d) { return colorScale(d.usage); });

                            heatMap.append("title").text(function(d) { return d.dashboard + " : " + d.timestamp + " => " + d.usage; });

                            var legend = svg.selectAll(".legend")
                                .data([0].concat(colorScale.quantiles()), function(d) { return d; })
                                .enter().append("g")
                                .attr("class", "legend");

                            legend.append("rect")
                                .attr("x", function(d, i) { return legendElementWidth * i; })
                                .attr("y", -70)
                                .attr("width", legendElementWidth)
                                .attr("height", gridSize / 2)
                                .attr("transform", "translate(-55, 0)")
                                .style("fill", function(d, i) { return colors[i]; });
                        });

                }
            }
        }

    }

}];

angular.module("ColorMatrix", [])
        .directive("colorMatrix", colorMatrixDirective)
        .controller("ColorMatrixController", colorMatrixController);

var chartingApp = angular.module("D3Charting", ["ColorMatrix"]);