var colorMatrixController = ['$scope', function($scope){
	console.log("ColorMatrixController :: ReadyState");
}];

var colorMatrixDirective = ['$window', '$timeout', '$http', function($window, $timeout, $http){

	return {
		restrict: 'E',
		template: '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>',
		scope: {},
		link: function(scope, element, attrs){
		
		scope.div_id = "ABC";
		
		drawColorMatrix();
		
		function drawColorMatrix(){
			 var margin = { top: 70, right: 0, bottom: 100, left: 55 },
			  width = parseInt(d3.select(element[0].parentNode).style("width")) - margin.left - margin.right,
			  height = parseInt(d3.select(element[0].parentNode).style("height")) - margin.top - margin.bottom,
			  buckets = 10,
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

                var dashboardName = data.responseData.map(function(obj){ return obj[Object.keys(obj)[1]]; });
                var plotDate = data.responseData.map(function(obj){ return  obj[Object.keys(obj)[0]]; });

                dashboardName = dashboardName.filter(uniqueValues);
                plotDate = plotDate.filter(uniqueValues);

				var gridSize = Math.floor(width / (plotDate.length * 1.09)),
				legendElementWidth = 20,
				height = ((dashboardName.length) * gridSize);
            
				var tip = d3.tip()
				  .attr('class', 'd3-tip')
				  .offset([-10, 0])
				  .html(function(d) {
					return "<p>" + d[Object.keys(d)[0]] + "</p><br/><strong>" + d[Object.keys(d)[1]] + ":</strong> <span>" + d[Object.keys(d)[2]] + "</span>";
				});
				
				/*gridSize = Math.floor(width / 24),
				
                width = parseInt(width.substring(0, width.length-2));
				height = ((dashboardName.length) * gridSize);*/
				
				var svg = d3.select(element[0])
							.append("svg")
							.attr("width", width + margin.left + margin.right)
							.attr("height", height + margin.top)
							.append("g")
							.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
							
				svg.call(tip);

                var colorScale = d3.scale.quantile()
                        .domain([0, buckets - 1, d3.max(data.responseData, function (d) { return  d[Object.keys(d)[2]]; })])
                        .range(colors);

                var yAxisLabels = svg.selectAll(".yAxisLabel")
                        .data(dashboardName)
                        .enter().append("text")
						.style("font-size", "10px")
						.text(function (d) { return d; })
						.attr("x", 30)
                        .attr("y", function (d, i) { return (i * gridSize) + 5; })
                        .style("text-anchor", "end")
                        .attr("transform", "translate(-6," + (gridSize - 10) + ")");

                var xAxisLabels = svg.selectAll(".xAxisLabel")
                        .data(plotDate)
                        .enter().append("text")
						.style("font-size", "10px")
                        .text(function(d, i) { return (d.toString().length > 6) ? (d.toString().substring(0, 6) + "..") : d; })
                        .attr("x", 20)
                        .attr("y", function(d, i) { return (i * gridSize) + 23; })
                        .style("text-anchor", "middle")
                        .attr("transform", "translate(" + gridSize + ", -6) rotate(-90)");;

                var heatMap = svg.selectAll(".hour")
                        .data(data.responseData)
                        .enter().append("rect")
                        .attr("x", function(d, i) { return ((plotDate.indexOf( d[Object.keys(d)[0]])) * gridSize) + 30; })
                        .attr("y", function(d) { return (dashboardName.indexOf(d[Object.keys(d)[1]])) * gridSize; })
                        .attr("class", "hour bordered")
                        .attr("width", gridSize)
                        .attr("height", gridSize)
                        .style("fill", colors[0])
						.on("mouseover", tip.show)
						.on("mouseout", tip.hide);

                heatMap.transition()
                        .ease("linear")
                        .duration(1000).delay(500)
                        .style("fill", function(d) { return (d[Object.keys(d)[2]] <=0) ? colorScale(0) : colorScale(d[Object.keys(d)[2]]); });

                heatMap.append("title").text(function(d) { return d[Object.keys(d)[1]] + " : " + d[Object.keys(d)[0]] + " => " + d[Object.keys(d)[2]]; });

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

var sortableBarController = ['$scope', function($scope){
	console.log("SortableBarController :: ReadyState");
}];

var sortableBarDirective = ['$window', '$timeout', '$http', function($window, $timeout, $http){

	return {
		restrict: 'E',
		template: '<label class="pull-right"><input id="sort-by-value" class="sort-by-value" type="checkbox"> Sort by value</label><div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>',
		scope: {},
		link: function(scope, element, attrs){
		
		drawSortableBarChart();
		
		function drawSortableBarChart(){
			
			var margin = {top: 20, right: 20, bottom: 30, left: 40},
			width = parseInt(d3.select(element[0].parentNode).style("width")) - margin.left - margin.top,
			height = 188 - margin.top - margin.bottom;

		if(attrs.metadataUrl != undefined){
				$http.get(attrs.metadataUrl)
				.then(function(response) {
							metadataAttributes = response.data.metadata.attributes;
				});
		}
		
		getSortableBarData();
	
	function getSortableBarData(){
			
			var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], .1, 0);

			var y = d3.scale.linear()
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom")
				.tickSize(0);

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left")
				.ticks(Math.max(width/200, 4))
				.tickSize(0);
				
			var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10, 0])
			  .html(function(d) {
				return "<strong>" + d[Object.keys(d)[0]] + ":</strong> <span>" + d[Object.keys(d)[2]] + "</span>";
			  });

			var svg = d3.select(element[0]).append("svg")
				.attr("id", "bar-svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
			svg.call(tip);
			
    d3.json(attrs.url,
            function(error, data) {

                data.responseData.forEach(function(d) {
                    d.category = d[Object.keys(d)[2]];
                });

              x.domain(data.responseData.map(function(d) { return d[Object.keys(d)[0]]; }));
			  y.domain([0, d3.max(data.responseData, function(d) { return d[Object.keys(d)[2]]; })]);

			  svg.append("g")
				.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
				  .call(xAxis)
				  .selectAll("text")
					.attr("transform", "translate(6,0)")
					.text(function(d) {
						return (d.length > 5) ? d.substring(0, 4) + ".." : d ;
					});

			  svg.append("g")
				  .attr("class", "y axis")
				  .call(yAxis)
				.append("text")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", ".71em")
				  .style("text-anchor", "end");

			  svg.selectAll(".bar")
				  .data(data.responseData)
				.enter().append("rect")
				  .attr("class", "bar")
				  .attr("x", function(d, i) { return x(d[Object.keys(d)[0]]) + 10; })
				  .attr("width", x.rangeBand() - 13)
				  .attr("y", function(d) { return y(d[Object.keys(d)[2]]); })
				  .attr("height", function(d) { return height - y(d[Object.keys(d)[2]]); })
				  .style("fill", DigitalPulseChartingTheme.theme.colors[0])
				  .on("mouseover", tip.show)
				  .on("mouseout", tip.hide);

			  d3.select(".sort-by-value").on("change", change);

			  function change() {
			  
				var x0 = x.domain(data.responseData.sort(this.checked
					? function(a, b) { return b[Object.keys(b)[2]] - a[Object.keys(a)[2]]; }
					: function(a, b) { return d3.ascending(a[Object.keys(a)[0]], b[Object.keys(b)[0]]); })
					.map(function(d) { return d[Object.keys(d)[0]]; }))
					.copy();

				var transition = svg.transition().duration(750),
					delay = function(d, i) { return i * 50; };

				transition.selectAll(".bar")
					.delay(delay)
					.attr("x", function(d) { return x0(d[Object.keys(d)[0]]) + 10; });

				transition.select(".x.axis")
					.call(xAxis)
				  .selectAll("g")
					.delay(delay)
				.selectAll("text")  
					.attr("transform", "translate(6,0)")
					.text(function(d) {
						return (d.length > 5) ? d.substring(0, 4) + ".." : d ;
					});
			  }
			  
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
