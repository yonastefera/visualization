import * as d3 from 'd3';

import './areaChart.scss';

const baseColor = '#444444';
const textColor = '#737070';
const circleColor = '#919191';
const circleInnerColor = 'white';
const textFontSize = '14px';
const yStrokeColor = '#282828';
const yStrokeDash = "6, 3";
const xAxisOffset = 20;
const wrapperWidth = 56;
const wrapperHeight = 40;

const getMonthFormat = d3.timeFormat("%b");

function addXGridGradient(svg) {
  const colorScale = d3.scaleLinear().range([textColor, '#12110F', 'black']).domain([1, 2, 3]);
  const linearGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "area-chart__x-axis-gradient");

  linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScale(1));

  linearGradient.append("stop")
    .attr("offset", "75%")
    .attr("stop-color", colorScale(2));

  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScale(3));
}

function addChartGradient(svg, uniqKey) {
  const gradient = ['white', 'rgba(117,117,117,0.1)'];
  const colorScale = d3.scaleLinear().range(gradient).domain([1, 2]);
  const linearGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", `area-chart__area-gradient${uniqKey}`)
    .attr("gradientTransform", "rotate(90)");

  linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScale(1));

  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScale(2));
}

function addLineGradient(svg, uniqKey) {
  const gradient = ['white', 'rgb(114,97,97)'];
  const colorScale = d3.scaleLinear().range(gradient).domain([1, 2]);
  const linearGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", `area-chart__line-gradient${uniqKey}`)
    .attr("gradientTransform", "rotate(90)");

  linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScale(1));

  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScale(2));
}

function removeAxisParts({svg}) {
  const yAxis = svg.select('.area-chart__y-axis');
  yAxis
      .selectAll('text')
      .remove();
  yAxis.selectAll('path').remove();
  yAxis.selectAll('g:first-of-type').remove();

  const xGridElement = svg.select(".area-chart__x-grid")

  xGridElement.select('path').remove();
  xGridElement.select('.tick').remove();
  xGridElement.selectAll('text').remove();
}

function createAxis({svg}) {
  svg.append("g")
      .attr("class", "area-chart__x-axis")
  svg.append("g")
      .attr("class", "area-chart__x-grid")
      .attr("stroke", "url(#area-chart__x-axis-gradient)")
  svg.append("g")
      .attr("class", "area-chart__y-axis")
      .style("stroke-dasharray", yStrokeDash)
}

function updateAxis({
                      svg,
                      yScale,
                      xScale,
                      height,
                      maxValue,
                      width}) {
  const yAxis = d3.axisRight(yScale);
  const xAxis = d3.axisBottom(xScale);

  const xAxisElement = svg.select(".area-chart__x-axis")
    .attr('transform', `translate(0, ${height - xAxisOffset})`)
    .call(xAxis);

  xAxisElement.select('path').attr('stroke', baseColor);
  xAxisElement.selectAll('line').attr('stroke', baseColor);
  xAxisElement.selectAll('text')
      .attr('stroke', textColor)
      .attr('fill', textColor)
      .attr('font-size', textFontSize)
      .attr("transform", `translate(-15, 10) rotate(-45)`)
      .text((x) => {

        if(x.getMonth() === 0) return x.getFullYear();

        return getMonthFormat(x);
      });

  const xGridElement = svg.select(".area-chart__x-grid")
    .attr("stroke", "url(#area-chart__x-axis-gradient)")
    .call(
      xAxis
        .ticks(6)
        .tickSize(height - xAxisOffset)
    );

  xGridElement.selectAll('line').attr("stroke", yStrokeColor);
  xGridElement.selectAll('text').remove();

  const yAxisElement = svg.select(".area-chart__y-axis")
    .style("stroke-dasharray", yStrokeDash)
    .call(
      yAxis
        .tickValues([0, maxValue / 2 - maxValue / 20, maxValue - maxValue / 20])
        .tickSize(width)
    );

  yAxisElement.selectAll('line').attr('stroke', yStrokeColor);

  removeAxisParts({svg});
}

function buildTooltip({group, x, y, tooltipValue, additionalClass}) {
  const fo = group
    .append('foreignObject')
    .style('pointer-events', 'none');

  const tooltip = fo
    .attr('width', wrapperWidth)
    .attr('height', wrapperHeight)
    .attr('x', x - wrapperWidth / 2)
    .attr('y', y - wrapperHeight)
    .append("xhtml:div");

  tooltip
    .classed('area-chart__tooltip', true)
    .classed(additionalClass, true);

  tooltip.append('div')
    .attr('class', 'area-chart__container')
    .append('div')
    .attr('class', 'area-chart__content')
    .html(tooltipValue);

  tooltip
    .append('div')
    .attr('class', 'area-chart__arrow')
}

function renderCircle({cx, cy, svg}) {
  const circleGroup = svg
    .append('g')
    .attr('class', `area-chart__circle-group 'area-chart__circle-group--active'`);

  circleGroup
    .append('circle')
    .attr('r', 5)
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('fill', circleColor);

  circleGroup
    .append('circle')
    .attr('r', 2)
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('fill',circleInnerColor)
}

function findDataItem(data, datePoint) {
  const i = d3.bisector(d => d.label).left(data, datePoint); // returns the index to the current data item

  if (i === 0) return data[i];
  const d0 = data[i - 1].label;
  if (i >= data.length) return data[i - 1];
  const d1 = data[i].label;
  // work out which date value is closest to the mouse
  const realIndex = datePoint - d0 > d1 - datePoint ? i : i - 1;
  return data[realIndex];
}

export function areaChart({
                            data, width = 510, height = 255, selector, uniqKey
                          }) {
  let maxValue = Math.max(...data.map(x => x.value), 0);
  let minValue = Math.min(...data.map(x => x.value), 0);

  /*calculate metrics*/
  const xScale = d3.scaleTime()
    .domain([data[0].label, data[data.length - 1].label])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .range([height - 20, 0])
    .domain([minValue, maxValue + maxValue / 10]);

  const lineScale = d3.line()
    .x(function (d) {
      return xScale(d.label);
    })
    .y(function (d) {
      return yScale(d.value);
    });

  const areaScale = d3.area()
    .x(function (d) {
      return xScale(d.label);
    })
    .y0(height - 20)
    .y1(function (d) {
      return yScale(d.value);
    });


  const chartContainer = d3.select(selector)
    .append('svg')
    .attr("class", "area-chart");

  addXGridGradient(chartContainer);
  addChartGradient(chartContainer, uniqKey);
  addLineGradient(chartContainer, uniqKey);

  const svg = chartContainer
      .data([data])
      .attr('width', width)
    .attr('height', height)
    .append('g');

  createAxis({svg});
  updateAxis({svg, height, maxValue, width, xScale, yScale});

  svg
    .append('g')
    .append('path')
    .attr("class", "area-chart__area-gradient")
    .datum(data)
    .attr('fill', `url(#area-chart__area-gradient${uniqKey})`)
    .attr('d', areaScale);

  svg
    .append('g')
    .append('path')
    .attr("class", "area-chart__area-path")
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', `url(#area-chart__line-gradient${uniqKey})`)
    .attr('stroke-width', '1px')
    .attr('d', lineScale);

  const dataStore = {
    value: data,
    get: () => dataStore.value,
    set: (value) => dataStore.value = value,
  };

  chartContainer
  .on('mouseover', function () {
    const gr = svg
        .append('g')
        .attr('class', 'area-chart__tooltip-group')
    const mouseData = d3.mouse(this);

    const datePoint = xScale.invert(mouseData[0]);
    const item = findDataItem(dataStore.get(), datePoint);

    renderCircle({
      cx: xScale(item.label),
      cy: yScale(item.value),
      svg: gr,
    });
    buildTooltip({
      group: gr,
      x: xScale(item.label),
      y: yScale(item.value),
      tooltipValue: item.tooltipValue,
    })
  })
  .on('mousemove', function () {
    const mouseData = d3.mouse(this);
    const datePoint = xScale.invert(mouseData[0]);
    const item = findDataItem(dataStore.get(), datePoint);
    const group = svg
        .select('.area-chart__tooltip-group');
    if(!group.select(`[data-item="${item.label}"]`).empty()) {
      return;
    }
    group.attr('data-item', item.label)
    group
        .selectAll('circle')
        .transition()
        .duration(50)
        .ease(d3.easeLinear)
        .attr('cx', xScale(item.label))
        .attr('cy', yScale(item.value));

    group
        .select('foreignObject')
        .transition()
        .duration(50)
        .ease(d3.easeLinear)
        .attr('x', xScale(item.label) - wrapperWidth / 2)
        .attr('y', yScale(item.value) - wrapperHeight);

    group
        .select('.area-chart__content')
        .html(item.tooltipValue);
  })
  .on('mouseout', () => {
        svg
            .select('.area-chart__tooltip-group')
            .attr('class', '')
            .transition()
            .duration(400)
            .style('opacity', 0)
            .remove()
  })

  return (newProps) => {
    const newData = newProps.data || data;
    dataStore.set(newData)
    let maxValue = Math.max(...newData.map(x => x.value), 0);
    let minValue = Math.min(...newData.map(x => x.value), 0);
    chartContainer
        .data(newData)
        .attr('width', newProps.width)
        .attr('height', newProps.height)
    xScale
        .range([0, newProps.width])
        .domain([newData[0].label, newData[newData.length - 1].label]);
    yScale
        .range([newProps.height - 20, 0])
        .domain([minValue, maxValue + maxValue / 10]);
    areaScale
        .y0(newProps.height - 20)
    chartContainer
        .attr('width', newProps.width)
        .attr('height', newProps.height);

    svg
        .select('.area-chart__area-gradient')
        .datum(newData)
        .transition()
        .duration(100)
        .attr('d', areaScale);
    svg
        .select('.area-chart__area-path')
        .datum(newData)
        .transition()
        .duration(100)
        .attr('d', lineScale);

    updateAxis({svg, height: newProps.height, maxValue, width: newProps.width, xScale, yScale});
  };
}
