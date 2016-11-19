$(function () {

    var DEFAULTS = {
        tick_count: 10,
        x_tick_count: 16,

        top_circle_radius: 6,

        brush_height: 200,

        graph_width: 800,
        graph_height: 500
    };

    var margin = {top: 20, right: 20, bottom: 50, left: 60},
        width = DEFAULTS.graph_width - margin.left - margin.right,
        height = DEFAULTS.graph_height - margin.top - margin.bottom;


// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin

d3.tsv("../tcga-cases.tsv", function(error, data) {

    var svg = d3.select(".scatter-plot").append("svg")
    .attr("width", width + margin.left + margin.right + DEFAULTS.graph_width)
    .attr("height", height + margin.top + margin.bottom + DEFAULTS.brush_height)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


    // Set the ranges
    var x = d3.scale.linear().range([0, width]);

    var x1 = d3.scale.linear().range([0, width]);
    x1.domain([0,d3.max(data, function(d) { return +d.case_days_to_death; })])

    var y = d3.scale.linear().range([height, 0]);

// Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(10);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(10);

    var color = d3.scale.category20()
    color.domain(_.uniq(data.map(function(d) { return d.case_pathologic_stage; })));

    var selected_gender = ["MALE", "FEMALE"]

    var draw = function (brush_extent) {

        console.log("brush_extent", brush_extent);

        svg.select('.wrapper').remove();

        var g = svg.append('g')
            .attr('class', 'wrapper')

        var filtered_data = _.filter(data, function (d) {
            return +d.case_days_to_death >= brush_extent[0] && +d.case_days_to_death <= brush_extent[1] &&
                    _.indexOf(selected_gender, d.case_gender ) > -1;
        });

        var min = brush_extent[0]
        var max = brush_extent[1]

        x.domain([min, max]);
        y.domain([0,100]);

        // Add the valueline path.

        // Add the X Axis
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        g.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        g.selectAll("dot")
            .data(filtered_data)
            .enter().append("path")
            .attr("transform", function (d) {
                return "translate("+ x(d.case_days_to_death) + "," + y(d.case_age_at_diagnosis) + ")";
            })
            .attr('class', 'symbol')
            .attr('d', function (d) {

                var symbol =  d3.svg.symbol();

                if(d.case_gender === 'MALE'){
                    symbol.type('square')
                } else {
                    symbol.type('triangle-up')

                }

                return symbol()
            })
            .style("stroke", function (d) {
                return color(d.case_pathologic_stage)
            })

        g.append('text')
            .attr('x', width/2 - 40)
            .attr('y', height + 40)
            .text('days_to_death')


        g.append('text')
            .attr('x', +60 - height/2)
            .attr('y', -40)
            .text('age_at_diagnosis')
            .attr('transform', 'rotate(-90)')
            .attr('style', 'text-anchor: end;')

    }

    draw([0, d3.max(data, function(d) { return +d.case_days_to_death; })]);

        // brush
    var brush = d3.svg.brush()
            .x(x1)
            .extent([0, d3.max(data, function(d) { return +d.case_days_to_death; })])
            .on("brush", function () {


                var brush_extent = brush.extent();

                draw(brush_extent)

            }),

        brush_wrapper = svg.append("g")
            .attr("class", "brush-wrapper")
            .attr("transform", "translate(0,500)");


    brush_wrapper.append("g")
        .attr("class", "x axis")
        .call(xAxis)
        .attr("transform", "translate(0,20)");


    brush_wrapper.append("g")
        .attr("class", "brush")
        .call(brush)
        .selectAll("rect")
        .attr("height", 20)
        .attr("transform", "translate(0,0)");

    draw(brush.extent());

    var gender_data = ["MALE", "FEMALE"];

    var legend_wrapper = d3.select(".legend-wrapper").append("svg")
        .attr("width", 300)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(33,33)");


    var legend_item = legend_wrapper.selectAll("label")
        .data(gender_data)
        .enter()
        .append('g')
        .attr("transform", function (d) {
            return "translate(0," + _.indexOf(gender_data, d) * 30 + ")";
        })
        .attr('class', 'legend-item')

    legend_item
        .append('text')
        .attr('class', 'selected')
        .text(function (d) {
            return d;
        })
        .on('click', function (d) {
            selected_gender = [];
            $(this).toggleClass('selected');

            _.each($('.legend-item .selected'), function (e) {
                selected_gender.push($(e).text())
            });

            draw(brush.extent())
    })

    draw([0, d3.max(data, function(d) { return +d.case_days_to_death; })]);


});

});
