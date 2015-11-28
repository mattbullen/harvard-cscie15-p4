// Clear the graph's container of content
function clearElement(a) {
    a = "" + a;
    if (document.getElementById(a) !== null) {
        document.getElementById(a).innerHTML = "";
    }
    return false;
};

// Capitalize string helper function
function capString(text) {
    return text.substring(0, 1).toUpperCase() + text.substring(1, text.length);
};

// From: https://stackoverflow.com/questions/8301531/dealing-with-dates-on-d3-js-axis
function getDate(date) {
    return new Date(date);
}

// Main graph rendering function
var createGraph = function(data) {
    
    // Set default rendering configurationObject, if not already supplied
    if (!configurationObject 
        || configurationObject === undefined 
        || configurationObject === null) {
        var configurationObject = {
            graphID: "graph",
            graphWidth: 650,
            circleStrokeSize: 3.0,
            yearStart: 1970,
            yearStop: 2015,
            xAxisTicks: 10,
            yAxisTicks: 10,
            yAxisLabelPadding: -36,
            margin: {
                top: 5, 
                right: 0, 
                bottom: 200, 
                left: 45
            },
            brushHeight: 8,
            brushOffset: 478
        };
    }
    
    // Clear the graph's container of any prior content
    clearElement(configurationObject.graphID);

    // Set the screen layout dimensions for the base canvas
    var baseXYBoxSize = parseFloat(configurationObject.graphWidth) || 650;
    var margin = configurationObject.margin; 
    var width = baseXYBoxSize - parseFloat(margin.left) - parseFloat(margin.right);
    var paddedWidth = width - 15;
    var height = baseXYBoxSize - parseFloat(margin.top) - parseFloat(margin.bottom);
    var dateFormatter = d3.time.format('%B %e, %Y');
    
    // Map the values in the data object
    var values = data.list;
    var minDate = getDate(values[0].date);
    var maxDate = minDate;
    var minTotal = +values[0].sets * +values[0].reps * +values[0].weight;
    var maxTotal = minTotal;
    var mappedData = values.map(function(d, i) {
        var thisDate = getDate(d.date);
        if (thisDate > maxDate) { maxDate = thisDate; }
        if (thisDate < minDate) { minDate = thisDate; }
        var thisTotal = +d.sets * +d.reps * +d.weight;
        if (thisTotal > maxTotal) { maxTotal = thisTotal; }
        if (thisTotal < minTotal) { minTotal = thisTotal; }
        // console.log(i, thisTotal, minTotal, maxTotal, minDate, maxDate);
        values[i].total = thisTotal;
        return {
            id: d.id,
            name: d.name,
            date: thisDate,
            sets: +d.sets,
            reps: +d.reps,
            weight: +d.weight,
            total: thisTotal,
            notes: d.notes
        };
    });
    mappedData = d3.nest()
        .key(function(d) { return d.name; })
        .sortKeys(d3.ascending)
        .sortValues(function(a,b) { return a.date - b.date; })
        .entries(mappedData);
    // console.log(mappedData);
    
    // Quick sort for unique damage types in the data object, needed for the descriptive paragraph
    var types = [];
    for (var i = 0; i < mappedData.length; i++) {
        var sub = mappedData[i];
        types.push(sub.key);
    }
    // console.log(types);
    var numberOfTypes = types.length;
    
    // Define the min/max canvas ranges for x and y values
    var x = d3.time.scale().range([0, paddedWidth]).domain([minDate, maxDate]);
    var xBrush = d3.time.scale().range([0, paddedWidth]).domain([minDate, maxDate]);
    var y = d3.scale.linear().range([height, 0]).domain([0, maxTotal]);
    
    // Define the x-axis dimensions, ticks, and orientation
    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(configurationObject.xAxisTicks).tickFormat(d3.time.format('%b-%Y'));
    var xAxisBrush = d3.svg.axis().scale(x).orient("bottom").ticks(configurationObject.xAxisTicks).tickFormat(d3.time.format('%b-%Y'));
    
    // Define the y-axis dimensions, ticks, and orientation
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(configurationObject.yAxisTicks);
    
    // Append the base canvas for the graph
    var graphContainer = document.getElementById(configurationObject.graphID);
    var svg = d3.select(graphContainer)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    // Clip path for circles that overlap graph borders
    var clip = svg.append("defs")
        .append("svg:clipPath")
        .attr("id", "clip");
    svg.append("svg:rect")
        .attr("id", "clip-rect")
        .attr("x", 1)
        .attr("y", 1)
        .attr("width", 589)
        .attr("height", 444)
        .style("cursor", "default")
        .style("fill", "white");      
    clip.append("use").attr("xlink:href", "#clip-rect");
    var clippedSVG = svg.append("g").attr("class", "clippedSVG").attr("clip-path", "url(#clip)");

    // Append the x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);

    // Append the y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Append the top border line
    svg.append("line")
        .attr("id", "topBorder")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width - 15)
        .attr("y2", 0)
        .style("stroke", "rgb(0, 0, 0)")
        .style("stroke-width", "1.0")
        .style("shape-rendering", "crispEdges");
        
    // Append the far right border line
    svg.append("line")
        .attr("id", "rightBorder")
        .attr("x1", width - 15)
        .attr("y1", 0)
        .attr("x2", width - 15)
        .attr("y2", height)
        .style("stroke", "rgb(0, 0, 0)")
        .style("stroke-width", "1.0")
        .style("shape-rendering", "crispEdges");
        
    // Define graph colors: these are repeated from the quadrant graph colors
    var color = d3.scale.ordinal().range([
        "#0033ff",
        "#0055bb",
        "#1c49a4",
        "#24dccc",
        "#3399ff",
        "#006f88",
        "#3674be",
        "#000099",
        "#003399"
    ]);
     
    // Define the interpolation for the graphed lines
    var valueLine = d3.svg.line()
        .x(function(d) { return x(getDate(d.date)); })
        .y(function (d) { return y(d.total); })
        .interpolate("linear"); 
        
    // Render the lines on the canvas
    var renderedLines = clippedSVG.selectAll(".type")
        .data(mappedData, function(d) { return d.key; })
        .enter()
        .append("g")
        .attr("class", "type")
        .append("path")
        .attr("class", "line")
        .attr("id", function(d) {
            return "line-" + (d.key).replace(/ /gi, "-");
        })
        .attr("d", function(d) { return valueLine(d.values); })
        .style("stroke", function(d) { return color(d.key); })
        .style("fill", "none")
        .style("opacity", "1.0");
    
    // Append a <div> to act as the container for the tooltip
    var tooltipDiv = d3.select("#" + (configurationObject.graphID || "graph"))
        .append("div")
        .attr("id", "tooltipContainer")
        .style("opacity", 0);
        
    // Append circle elements for each of the (x, y) coordinates to the canvas
    clippedSVG.selectAll("dot")
        .data(values)
        .enter()
        .append("circle")
        .attr("id", function(d) {
            return "dot-" + d.id;
        })
        .attr("class", function(d) {
            return "coordinateCircle dot dot-" + (d.name).replace(/ /gi, "-");
        })
        .attr("data-id", function(d) { return d.id; })
        .attr("data-date", function(d) { return d.date; })
        .attr("data-sets", function(d) { return d.sets; })
        .attr("data-reps", function(d) { return d.reps; })
        .attr("data-weight", function(d) { return d.weight; })
        .attr("data-total", function(d) { return d.total; })
        .attr("data-notes", function(d) { return d.notes; })
        .attr("data-state", "on")
        .attr("data-click", "off")
        .attr("r", function(d) {
            // Adjust the size for corner case dots
            if (d.total === minTotal || d.total === maxTotal) {
                var larger = +configurationObject.circleStrokeSize * 1.618;
                d3.select(this).attr("data-size-base", larger);
                return larger;
            } else {
                d3.select(this).attr("data-size-base", configurationObject.circleStrokeSize);
                return configurationObject.circleStrokeSize;
            }
        })
        .attr("cx", function(d) { return x(getDate(d.date)); })       
        .attr("cy", function(d) { return y(d.total); })
        .style("stroke", function(d, i) { return color(d.name); })
        .style("fill", function(d) { return color(d.name); })
        .style("cursor", "pointer")
        .on("click", function(d){

            var dot = d3.select(this);
            var tooltip = d3.select("#tooltipContainer");
            
            var click = dot.attr("data-click");
            if (click === "off") {
                
                // Remove any prior clicked dot states/effects
                d3.selectAll(".dot")
                    .transition()
                    .duration(250)
                    .attr("r", function(d) { return d3.select(this).attr("data-size-base"); })
                    .attr("data-click", "off");
                    
                // Toggle the click state for the selected dot
                dot.attr("data-click", "on")
                dot.transition()
                    .duration(250)
                    .attr("r", function(d) { return +d3.select(this).attr("data-size-base") + 1.618; })
                
                // Display any notes for the exercise session
                var formattedDate = dateFormatter(getDate(dot.attr("data-date")));
                d3.select("#graphData").html(formattedDate + ": " + dot.attr("data-notes"));
                
                // Set the tooltip's text content
                tooltip.html(""
                    + '<div class="boldJustified">Date</div>'
                    + formattedDate
                    + "<br/>"
                    + '<span class="boldJustified">Sets</span>'
                    + d.sets
                    + "<br/>"
                    + '<span class="boldJustified">Reps</span>'                   
                    + d.reps
                    + "<br/>"
                    + '<span class="boldJustified">Weight</span>'
                    + d.weight + " lbs"
                    + "<br/>"
                    + '<span class="boldJustified">Total</span>'
                    + (d.total).toLocaleString() + " lbs"
                    + "<br/>"
                    + '<paper-fab id="deleteSession" class="buttonHover" icon="icons:build" title="Edit this session?" on-tap="deleteExercise"></paper-fab>');
                
                // Set the tooltip's CSS
                tooltip
                    .style("position", "absolute")
                    .style("outline", "none")
                    .style("border", "1px solid #000")
                    .style("background", "#fff")
                    .style("font-family", "'Roboto', 'Noto', sans-serif")
                    .style("-webkit-font-smoothing", "subpixel-antialiased !important")
                    .style("color", "#000")
                    .style("font-size", "12px")
                    .style("line-height", "1.618")
                    .style("padding", "10px 20px 10px 22px")
                    .style("min-width", "170px");
                
                // Set the tooltip's location on the canvas
                var pageXValue = +d3.select(this).attr("cx");
                var pageYValue = +d3.select(this).attr("cy");
                var xOffset = Math.round(pageXValue + 45);
                var yOffset = Math.round(pageYValue - 120);
                tooltip
                    .style("left", "" + xOffset + "px")
                    .style("top", "" + yOffset + "px");
                        
                // Set the tooltip's opacity back to visible
                tooltip.transition()
                    .duration(250)
                    .style("opacity", "1.0");
                    
            } else {
                
                // Toggle the click state
                dot.transition()
                    .duration(250)
                    .attr("r", function(d) { return d3.select(this).attr("data-size-base"); })
                    .attr("data-click", "off");
                    
                // Remove the tooltip
                tooltip.transition()
                    .duration(250)
                    .style("padding", "0px")
                    .style("opacity", "0")
                    .style("border", "none");
                tooltip.html("");
                
                // Remove the notes
                d3.select("#graphData").html("No notes to show!");
            }
            
            return false;
        });
    
    // Define the range slider base canvas
    var context = svg.append("g")
        .attr("transform", "translate(0," + configurationObject.brushOffset + ")")
        .attr("class", "context");
    
    // Define the range slider's tick marks
    context.append("g")
        .attr("id", "xAxisBrush")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + configurationObject.brushHeight + ")")
        .call(xAxisBrush);
    
    // Define the range slider's background color
    context.append("rect")
        .attr("x", 0)
        .attr("height", configurationObject.brushHeight)
        .attr("width", width - 15)
        .attr("fill", "#ccc")
        .style("cursor", "pointer");
    
    // Define the brush
    var brush = d3.svg.brush()
        .x(xBrush) 
        .on("brush", function() {
            
            // Reset the dot sizes and click states
            d3.selectAll(".dot").each(function(d) {
                var thisDot = d3.select(this);
                var baseSize = thisDot.attr("data-size-base");
                thisDot.attr("r", baseSize).attr("data-click", "off");
            });
            
            // Remove the tooltip
            var tooltip = d3.select("#tooltipContainer");
            tooltip.style("padding", "0px")
                .style("opacity", "0")
                .style("border", "none");
            tooltip.html("");
            
            // Remove the notes
            d3.select("#graphData").html("No notes to show!");
            
            var extent = brush.extent();
            var extent0 = getDate(extent[0]);
            var extent1 = getDate(extent[1]);
            var range = extent1 - extent0;
            if (range > 10) { range = 5; }
            if (range < 1) { range = 1; }
            x.domain(brush.extent());
            svg.select(".x.axis").transition().duration(0).call(xAxis.ticks(range));
            var mappedDataSub = values.map(function(d) { 
                return {
                    name: d.name,
                    date: d.date,
                    total: +d.total
                };
            });
            mappedDataSub = d3.nest()
                .key(function(d) { return d.name; })
                .sortKeys(d3.ascending)
                .sortValues(function(a,b) { return a.date - b.date; })
                .entries(mappedDataSub);    
            // console.log(mappedDataSub);
            
            clippedSVG.selectAll(".line")
                .data(mappedDataSub, function(d) { return d.key; })
                .transition().duration(200)
                .attr("d", function(d) { return valueLine(d.values); })
                .attr("clip-path", "url(#clip)");
            
            clippedSVG.selectAll(".coordinateCircle")
                .attr("data-state", "off")
                .style("opacity", "0");
                
            clippedSVG.selectAll(".coordinateCircle")
                .data(values)
                .attr("data-state", "on")
                .transition().duration(200)
                .attr("cx", function(d) { return x(getDate(d.date)); })
                .attr("cy", function(d) { return y(d.total); })
                .attr("clip-path", "url(#clip)")
                .transition().duration(0).delay(200).style("opacity", "1.0")
        });
    
    // Append the brush to the base canvas
    context.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("height", configurationObject.brushHeight)
        .attr("fill", "#555")
        .style("cursor", "pointer");
        
    // Append the brush's top border line
    svg.append("line")
        .attr("id", "topBorderBrush")
        .attr("x1", 0)
        .attr("y1", configurationObject.brushOffset)
        .attr("x2", width - 15)
        .attr("y2", configurationObject.brushOffset)
        .style("stroke", "rgb(0, 0, 0)")
        .style("stroke-width", "1.0")
        .style("shape-rendering", "crispEdges");

    // Append the brush's left border line
    svg.append("line")
        .attr("id", "rightBorderBrush")
        .attr("x1", 0)
        .attr("y1", configurationObject.brushOffset)
        .attr("x2", 0)
        .attr("y2", configurationObject.brushOffset + configurationObject.brushHeight)
        .style("stroke", "rgb(0, 0, 0)")
        .style("stroke-width", "1.0")
        .style("shape-rendering", "crispEdges");
        
    // Append the brush's right border line
    svg.append("line")
        .attr("id", "rightBorderBrush")
        .attr("x1", width - 15)
        .attr("y1", configurationObject.brushOffset)
        .attr("x2", width - 15)
        .attr("y2", configurationObject.brushOffset + configurationObject.brushHeight)
        .style("stroke", "rgb(0, 0, 0)")
        .style("stroke-width", "1.0")
        .style("shape-rendering", "crispEdges");
    
    // Helps ensure tick visibility across browsers
    svg.selectAll(".tick")
        .style("font-family", "'Roboto', 'Noto', sans-serif")
        .style("text-rendering", "geometricPrecision")
        .style("stroke", "rgb(0, 0, 0)")
        .style("stroke-width", "1.0")
        .style("shape-rendering", "crispEdges");
        
    // Add mouse events to the graph reset button
    d3.select("#resetGraph").on("click", function(d) {
        
            // Remove the notes
            d3.select("#graphData").html("No notes to show!");
            
            // Remove the tooltip
            var tooltip = d3.select("#tooltipContainer");
                tooltip.transition()
                    .duration(250)
                    .style("padding", "0px")
                    .style("opacity", "0")
                    .style("border", "none");
                tooltip.html("");
                
            console.log("#resetGraph clicked");
            brush.clear();
            svg.selectAll(".brush").transition().duration(300).call(brush);
            x.domain([minDate, maxDate]);
            svg.select(".x.axis").transition().duration(300).call(xAxis.ticks(configurationObject.xAxisTicks));
            clippedSVG.selectAll(".line")
                .data(mappedData, function(d) { return d.key; })
                .transition().duration(300)
                .attr("d", function(d) { return valueLine(d.values); })
                .attr("clip-path", "url(#clip)")
                .style("opacity", "1.0");
            clippedSVG.selectAll(".coordinateCircle")
                .data(values)
                .attr("data-state", "on")
                .attr("data-click", "off")
                .transition().duration(300)
                .attr("r", function(d) {
                    return d3.select(this).attr("data-size-base");
                })
                .attr("cx", function(d) { return x(getDate(d.date)); })
                .attr("cy", function(d) { return y(d.total); })
                .attr("clip-path", "url(#clip)")
                .style("opacity", "1.0");
            svg.selectAll(".legendCheckMark")
                .attr("data-state", "on")
                .transition().duration(300)
                .style("opacity", "1.0");
            return false;   
        });
    
    // No legend needed when displaying individual exercises
    if (numberOfTypes === 1) { return false; }
        
    // Define the graph's legend dimensions
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "legend");
        legend.attr("transform", function(d, i) {
            if (i < 3) {
                return "translate(" + (i * 155) + ", " + (height + 78) + ")";
            } else if (i > 2 && i < 6) {
                var j = i - 3;
                return "translate(" + (j * 155) + ", " + (height + 108) + ")";
            } else {
                var j = i - 6;
                return "translate(" + (j * 155) + ", " + (height + 138) + ")";
            }
        });
        
    // Define the selection boxes in the legend
    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);
        
    // Render the legend check marks
    legend.append("image")
        .attr("xlink:href", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH3wYbFBkXJBgGFwAAAEtJREFUOMvt07ERACAIA0DC/jvHCQzmwI50NH8ICJIxlYzBLCbDKYw3MBsdoYNJSGF0oRtGMRu424TbUfVMFLV9Z3Cgl21iP/pf7ABAcQ4jwRBahgAAAABJRU5ErkJggg==")
        .attr("class", "legendCheckMark")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .attr("data-state", "on")
        .style("cursor", "pointer");
    
    // Add click functionality to the legend
    var legendClick = d3.selectAll(".legendCheckMark").on("click", function(d) {
            var formattedID = d.replace(/ /gi, "-");
            var item = d3.select(this);
            var state = "" + item.attr("data-state").toLowerCase();      // console.log("\nrenderLegend() click state: ", state);
            if (state === "off") {
                item.attr("data-state", "on");
                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("opacity", "1.0");
                svg.selectAll(".dot-" + formattedID)
                    .transition()
                    .duration(300)
                    .style("opacity", function(d) {
                        var thisDot = d3.select(this);
                        var thisState = thisDot.attr("data-state");
                        if (thisState === "on") {
                            return "1.0";
                        } else {
                            return "0";
                        }
                    })
                    .attr("r", (configurationObject.circleStrokeSize || 2.0));
                svg.select("#line-" + formattedID)
                    .transition()
                    .duration(300)
                    .style("opacity", "1.0");
                return false;
            } else {
                item.attr("data-state", "off");
                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("opacity", "0");
                svg.selectAll(".dot-" + formattedID)
                    .transition()
                    .duration(300)
                    .style("opacity", "0")
                    .attr("r", "0");
                svg.select("#line-" + formattedID)
                    .transition()
                    .duration(300)
                    .style("opacity", "0");
                return false;
            }
            return false;
        });
    
    // Define the text labels in the legend
    legend.append("text")
        .attr("x", 22)
        .attr("y", 10)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .style("font-family", "'Roboto', 'Noto', sans-serif")
        .style("font-size", "1.0em")
        .text(function(d) { return capString(d); });
    
    return this;
    
};

function updateGraph(data) {
    
    // Set default rendering configurationObject, if not already supplied
    if (!configurationObject 
        || configurationObject === undefined 
        || configurationObject === null) {
        var configurationObject = {
            graphID: "graph",
            graphWidth: 650,
            circleStrokeSize: 3.0,
            yearStart: 1970,
            yearStop: 2015,
            xAxisTicks: 10,
            yAxisTicks: 10,
            yAxisLabelPadding: -36,
            margin: {
                top: 5, 
                right: 0, 
                bottom: 200, 
                left: 45
            },
            brushHeight: 8,
            brushOffset: 478
        };
    }
    
    // Set the screen layout dimensions for the base canvas
    var baseXYBoxSize = parseFloat(configurationObject.graphWidth) || 650;
    var margin = configurationObject.margin; 
    var width = baseXYBoxSize - parseFloat(margin.left) - parseFloat(margin.right);
    var paddedWidth = width - 15;
    var height = baseXYBoxSize - parseFloat(margin.top) - parseFloat(margin.bottom);
    var dateFormatter = d3.time.format('%B %e, %Y');
    
    // Map the values in the data object
    var values = data.list; // console.log(values);
    var minDate = getDate(values[0].date);
    var maxDate = minDate;
    var minTotal = +values[0].sets * +values[0].reps * +values[0].weight;
    var maxTotal = minTotal;
    var mappedData = values.map(function(d, i) {
        var thisDate = getDate(d.date);
        if (thisDate > maxDate) { maxDate = thisDate; }
        if (thisDate < minDate) { minDate = thisDate; }
        var thisTotal = +d.sets * +d.reps * +d.weight;
        if (thisTotal > maxTotal) { maxTotal = thisTotal; }
        if (thisTotal < minTotal) { minTotal = thisTotal; }
        // console.log(i, thisTotal, minTotal, maxTotal, minDate, maxDate);
        values[i].total = thisTotal;
        return {
            name: d.name,
            date: thisDate,
            sets: +d.sets,
            reps: +d.reps,
            weight: +d.weight,
            total: thisTotal
        };
    });
    mappedData = d3.nest()
        .key(function(d) { return d.name; })
        .sortKeys(d3.ascending)
        .sortValues(function(a,b) { return a.date - b.date; })
        .entries(mappedData);
    // console.log(mappedData);
    
    // Define the min/max canvas ranges for x and y values
    var x = d3.time.scale().range([0, paddedWidth]).domain([minDate, maxDate]);
    var xBrush = d3.time.scale().range([0, paddedWidth]).domain([minDate, maxDate]);
    var y = d3.scale.linear().range([height, 0]).domain([0, maxTotal]);
    
    // Define the x-axis dimensions, ticks, and orientation
    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(configurationObject.xAxisTicks).tickFormat(d3.time.format('%b-%Y'));
    var xAxisBrush = d3.svg.axis().scale(x).orient("bottom").ticks(configurationObject.xAxisTicks).tickFormat(d3.time.format('%b-%Y'));
    
    // Define the y-axis dimensions, ticks, and orientation
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(configurationObject.yAxisTicks);
    
    // Define graph colors: these are repeated from the quadrant graph colors
    var color = d3.scale.ordinal().range([
        "#0033ff",
        "#0055bb",
        "#1c49a4",
        "#24dccc",
        "#3399ff",
        "#006f88",
        "#3674be",
        "#000099",
        "#003399"
    ]);
     
    // Define the interpolation for the graphed lines
    var valueLine = d3.svg.line()
        .x(function(d) { return x(getDate(d.date)); })
        .y(function (d) { return y(d.total); })
        .interpolate("linear");
    
    d3.selectAll(".line").data(mappedData, function(d) { return d.key; }).transition().attr("d", function(d) { return valueLine(d.values); })
    d3.select("g.x.axis").transition().call(xAxis);
    d3.select("g.y.axis").transition().call(yAxis);
    
    // Append circle elements for each of the (x, y) coordinates to the canvas
    var dots = d3.selectAll(".dot").data(values);
    dots.transition()
        .attr("cx", function(d) { return x(getDate(d.date)); })       
        .attr("cy", function(d) { return y(d.total); })
        .attr("id", function(d) {
            return "dot-" + d.id;
        })
        .attr("r", function(d) {
            // Adjust the size for corner case dots
            if (d.total === minTotal || d.total === maxTotal) {
                var larger = +configurationObject.circleStrokeSize * 1.618;
                d3.select(this).attr("data-size-base", larger);
                return larger;
            } else {
                d3.select(this).attr("data-size-base", configurationObject.circleStrokeSize);
                return configurationObject.circleStrokeSize;
            }
        });
    var clippedSVG = d3.select(".clippedSVG");
    clippedSVG.data(values)
        .append("circle")
        .filter(function(d) {
            var exists = d3.select("#dot-" + d.id);
            if (exists) { return true; } else { return false; }
        })
        .attr("id", function(d) {
            return "dot-" + d.id;
        })
        .attr("class", function(d) {
            return "coordinateCircle dot dot-" + (d.name).replace(/ /gi, "-");
        })
        .attr("data-id", function(d) { return d.id; })
        .attr("data-date", function(d) { return d.date; })
        .attr("data-sets", function(d) { return d.sets; })
        .attr("data-reps", function(d) { return d.reps; })
        .attr("data-weight", function(d) { return d.weight; })
        .attr("data-total", function(d) { return d.total; })
        .attr("data-notes", function(d) { return d.notes; })
        .attr("data-state", "on")
        .attr("data-click", "off")
        .attr("cx", function(d) { return x(getDate(d.date)); })       
        .attr("cy", function(d) { return y(d.total); })
        .attr("r", function(d) {
            // Adjust the size for corner case dots
            if (d.total === minTotal || d.total === maxTotal) {
                var larger = +configurationObject.circleStrokeSize * 1.618;
                d3.select(this).attr("data-size-base", larger);
                return larger;
            } else {
                d3.select(this).attr("data-size-base", configurationObject.circleStrokeSize);
                return configurationObject.circleStrokeSize;
            }
        })
        .style("stroke", function(d, i) { return color(d.name); })
        .style("fill", function(d) { return color(d.name); })
        .style("cursor", "pointer")
        .on("click", function(d){

            var dot = d3.select(this);
            var tooltip = d3.select("#tooltipContainer");
            
            var click = dot.attr("data-click");
            if (click === "off") {
                
                // Remove any prior clicked dot states/effects
                d3.selectAll(".dot")
                    .transition()
                    .duration(250)
                    .attr("r", function(d) { return d3.select(this).attr("data-size-base"); })
                    .attr("data-click", "off");
                    
                // Toggle the click state for the selected dot
                dot.attr("data-click", "on")
                dot.transition()
                    .duration(250)
                    .attr("r", function(d) { return +d3.select(this).attr("data-size-base") + 1.618; })
                    
                // Display any notes for the exercise session
                var formattedDate = dateFormatter(getDate(dot.attr("data-date")));
                d3.select("#graphData").html(formattedDate + ": " + dot.attr("data-notes"));
                
                // Set the tooltip's text content
                tooltip.html(""
                    + '<div class="boldJustified">Date</div>'
                    + formattedDate
                    + "<br/>"
                    + '<span class="boldJustified">Sets</span>'
                    + d.sets
                    + "<br/>"
                    + '<span class="boldJustified">Reps</span>'                   
                    + d.reps
                    + "<br/>"
                    + '<span class="boldJustified">Weight</span>'
                    + d.weight + " lbs"
                    + "<br/>"
                    + '<span class="boldJustified">Total</span>'
                    + (d.total).toLocaleString() + " lbs"
                    + "<br/>"
                    + '<paper-fab id="deleteSession" class="buttonHover" icon="icons:build" title="Edit this session?" on-tap="deleteExercise"></paper-fab>');
                
                // Set the tooltip's CSS
                tooltip
                    .style("position", "absolute")
                    .style("outline", "none")
                    .style("border", "1px solid #000")
                    .style("background", "#fff")
                    .style("font-family", "'Roboto', 'Noto', sans-serif")
                    .style("-webkit-font-smoothing", "subpixel-antialiased !important")
                    .style("color", "#000")
                    .style("font-size", "12px")
                    .style("line-height", "1.618")
                    .style("padding", "10px 20px 10px 22px")
                    .style("min-width", "170px");
                
                // Set the tooltip's location on the canvas
                var pageXValue = +d3.select(this).attr("cx");
                var pageYValue = +d3.select(this).attr("cy");
                var xOffset = Math.round(pageXValue + 45);
                var yOffset = Math.round(pageYValue - 120);
                tooltip
                    .style("left", "" + xOffset + "px")
                    .style("top", "" + yOffset + "px");
                        
                // Set the tooltip's opacity back to visible
                tooltip.transition()
                    .duration(250)
                    .style("opacity", "1.0");
                    
            } else {
                
                // Toggle the click state
                dot.transition()
                    .duration(250)
                    .attr("r", function(d) { return d3.select(this).attr("data-size-base"); })
                    .attr("data-click", "off");
                    
                // Remove the tooltip
                tooltip.transition()
                    .duration(250)
                    .style("padding", "0px")
                    .style("opacity", "0")
                    .style("border", "none");
                tooltip.html("");
                
                // Remove the notes
                d3.select("#graphData").html("No notes to show!");
            
            }
            
            return false;
        });       
    dots.exit().remove();
    
    // Redefine the brush
    var brush = d3.svg.brush()
        .x(xBrush) 
        .on("brush", function() {
            
            // Reset the dot sizes and click states
            d3.selectAll(".dot").each(function(d) {
                var thisDot = d3.select(this);
                var baseSize = thisDot.attr("data-size-base");
                thisDot.attr("r", baseSize).attr("data-click", "off");
            });
            
            // Remove the tooltip
            var tooltip = d3.select("#tooltipContainer");
            tooltip.style("padding", "0px")
                .style("opacity", "0")
                .style("border", "none");
            tooltip.html("");
            
            // Remove the notes
            d3.select("#graphData").html("No notes to show!");
            
            // Remove the tooltip
                tooltip.transition()
                    .duration(250)
                    .style("padding", "0px")
                    .style("opacity", "0")
                    .style("border", "none");
                tooltip.html("");
                
            var extent = brush.extent();
            var extent0 = getDate(extent[0]);
            var extent1 = getDate(extent[1]);
            var range = extent1 - extent0;
            if (range > 10) { range = 5; }
            if (range < 1) { range = 1; }
            x.domain(brush.extent());
            d3.select(".x.axis").transition().duration(0).call(xAxis.ticks(range));
            var mappedDataSub = values.map(function(d) { 
                return {
                    name: d.name,
                    date: d.date,
                    total: +d.total
                };
            });
            mappedDataSub = d3.nest()
                .key(function(d) { return d.name; })
                .sortKeys(d3.ascending)
                .sortValues(function(a,b) { return a.date - b.date; })
                .entries(mappedDataSub);    
            // console.log(mappedDataSub);
            
            clippedSVG.selectAll(".line")
                .data(mappedDataSub, function(d) { return d.key; })
                .transition().duration(200)
                .attr("d", function(d) { return valueLine(d.values); })
                .attr("clip-path", "url(#clip)");
            
            clippedSVG.selectAll(".coordinateCircle")
                .attr("data-state", "off")
                .style("opacity", "0");
                
            clippedSVG.selectAll(".coordinateCircle")
                .data(values)
                .attr("data-state", "on")
                .transition().duration(200)
                .attr("cx", function(d) { return x(getDate(d.date)); })
                .attr("cy", function(d) { return y(d.total); })
                .attr("clip-path", "url(#clip)")
                .transition().duration(0).delay(200).style("opacity", "1.0")
        });
    
    brush.clear();
    d3.selectAll(".x.brush").transition().duration(300).call(brush);
    d3.select("#xAxisBrush").call(xAxisBrush);
    
    // Add mouse events to the graph reset button
    d3.select("#resetGraph").on("click", function(d) {
            
            // Remove the notes
            d3.select("#graphData").html("No notes to show!");
            
            // Remove the tooltip
            var tooltip = d3.select("#tooltipContainer");
                tooltip.transition()
                    .duration(250)
                    .style("padding", "0px")
                    .style("opacity", "0")
                    .style("border", "none");
                tooltip.html("");
                
            brush.clear();
            d3.selectAll(".brush").transition().duration(300).call(brush);
            x.domain([minDate, maxDate]);
            d3.select(".x.axis").transition().duration(300).call(xAxis.ticks(configurationObject.xAxisTicks));
            clippedSVG.selectAll(".line")
                .data(mappedData, function(d) { return d.key; })
                .transition().duration(300)
                .attr("d", function(d) { return valueLine(d.values); })
                .attr("clip-path", "url(#clip)")
                .style("opacity", "1.0");
            clippedSVG.selectAll(".coordinateCircle")
                .data(values)
                .attr("data-state", "on")
                .attr("data-click", "off")
                .transition().duration(300)
                .attr("r", function(d) {
                    return d3.select(this).attr("data-size-base");
                })
                .attr("cx", function(d) { return x(getDate(d.date)); })
                .attr("cy", function(d) { return y(d.total); })
                .attr("clip-path", "url(#clip)")
                .style("opacity", "1.0");
            d3.selectAll(".legendCheckMark")
                .attr("data-state", "on")
                .transition().duration(300)
                .style("opacity", "1.0");
            return false;   
        });
}
























