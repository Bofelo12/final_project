'use strict';

/*
 * Draw the BMI chart
 */
function hhRenderBodyMassIndex() {
  var svg;
  var area;
  var nest;
  var stack;
  var yAxis;
  var xAxis;
  var z;
  var y;
  var x;
  var margin;
  var width;
  var height;
  var heightFactor;
  var widthFactor;

  // Delete the other diagrams
  d3.selectAll('svg').remove();

  // Calculate the size
  widthFactor = 600;
  
  heightFactor = (widthFactor / 600) * 300;

  margin = { top: 20, right: 80, bottom: 30, left: 50 };
  width = widthFactor - margin.left - margin.right;
  height = heightFactor - margin.top - margin.bottom;

  x = d3.scaleLinear()
    .range([0, width]);

  y = d3.scaleLinear()
    .range([height, 0]);

  z = d3.scaleOrdinal().range(['#000080',
    '#0000ff',
    '#00ffff',
    '#00ff00',
    '#ffff00',
    '#ff7f2a',
    '#ff0000',
    '#800000']);

  xAxis = d3.axisBottom(x);

  yAxis = d3.axisLeft(y);

  stack = d3.stack();

  nest = d3.nest()
    .key(function (d) {
      return d.key;
    });

  area = d3.area()
    .x(function (d) {
      return x(d.height);
    })
    .y1(function (d) {
      return y(d.weight);
    });

  svg = d3.select('#bmi-chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Clip path, drawings outside are removed
  svg.append('defs').append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', width)
    .attr('height', height);

  d3.json('/nutrition/calculator/bmi/chart-data', function (data) {
    var $bmiForm;
    var url;
    var layers;
    stack.keys(['filler',
      'severe_thinness',
      'moderate_thinness',
      'mild_thinness',
      'normal_range',
      'pre_obese',
      'obese_class_2',
      'obese_class_3']);
    layers = stack(nest.entries(data));

    // Manually set the domains
    x.domain(data.map(function (d) {
      return d.height;
    }));
    y.domain([d3.min(data, function (d) {
      return d.weight;
    }), d3.max(data, function (d) {
      return d.weight;
    })]);

    svg.selectAll('.layer')
      .data(layers)
      .enter().append('path')
      .attr('class', 'layer')
      .attr('id', function (d) {
        return 'key-' + d.key;
      })
      .attr('clip-path', 'url(#clip)')
      .attr('d', function (d, i) {
        return area(d[i].data.values);
      })
      .style('fill', function (d, i) {
        return z(i);
      })
      .style('opacity', 1);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    $bmiForm = $('#bmi-form');
    url = $bmiForm.attr('action');

    $.post(url,
      $bmiForm.serialize(),
      function (postData) {
        $('#bmi-result-container').show();
        $('#bmi-result-value').html(postData.bmi);
        svg.append('circle')
          .attr('cx', x(postData.height))
          .attr('cy', y(postData.weight))
          .attr('fill', 'black')
          .attr('r', 5);
      });
  });
}
