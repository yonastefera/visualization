import * as d3 from "d3";
import "./barChart.scss";

const FONT_SIZE = "14px";
const TEXT_COLOR = "#929292";
const GRID_COLOR = "#282828";
const yStrokeDash = "6, 3";
const BAR_COLORS = [
  "#311415",
  "#331313",
  "#361414",
  "#3a1414",
  "#3d1313",
  "#411415",
  "#441313",
  "#481313",
  "#4b1414",
  "#4d1313",
  "#521414",
  "#541414",
  "#581313",
  "#5b1414",
  "#5f1414",
  "#621414",
  "#651414",
  "#691414",
  "#6c1414",
  "#146F5F",
  "#157362",
  "#167665",
  "#157867",
  "#167C6A",
  "#16806D",
  "#17826F",
  "#168571",
  "#178A75",
  "#178C77",
  "#189079",
  "#18937C",
  "#19977F",
  "#199A82",
  "#199D84",
  "#1AA086",
  "#1BA389",
  "#1AA489",
  "#1BAA8F",
  "#1CAE91",
  "#1CB093",
  "#1DB496",
  "#1DB798",
  "#1EBA9B",
  "#1EBE9E",
  "#1FC1A1",
  "#20C5A4",
  "#20C8A6",
  "#20C9A7",
  "#20C9A7",
  "#20C9A7",
  "#20C9A7",
  "#20C9A7",
  "#20C9A7",
  "#20C9A7",
];

function buildTooltip({ group, x, y, percent, additionalClass }) {
  const fo = group.append("foreignObject");

  const wrapperWidth = 56;
  const wrapperHeight = 40;
  const tooltip = fo
    .attr("width", wrapperWidth)
    .attr("height", wrapperHeight)
    .attr("x", x - wrapperWidth / 2)
    .attr("y", y - wrapperHeight)
    .append("xhtml:div");

  tooltip.classed("bar-chart__tooltip", true).classed(additionalClass, true);

  tooltip
    .append("div")
    .attr("class", "bar-chart__container")
    .append("div")
    .attr("class", "bar-chart__content")
    .html(percent.toFixed(2) + "%");

  tooltip.append("div").attr("class", "bar-chart__arrow");
}

function createAxis({ svg }) {
  svg.append("g").attr("class", "bar-chart__x-axis");

  svg
    .append("g")
    .attr("class", "bar-chart__y-axis")
    .style("stroke-dasharray", yStrokeDash);
}

function renderAxis({
  svg,
  actualHeight,
  xScale,
  yScale,
  maxValue,
  actualWidth,
  data,
}) {
  const xAxis = svg
    .select(".bar-chart__x-axis")
    .attr("transform", "translate(0," + actualHeight + ")")
    .call(d3.axisBottom(xScale));

  xAxis.select("path").remove();
  xAxis.selectAll("line").remove();
  xAxis
    .selectAll("text")
    .attr(
      "transform",
      `rotate(-90) translate( -25, -${xScale.bandwidth() / 2 + 7})`
    )
    .attr("text-anchor", "end")
    .style("text-transform", "uppercase")
    .style("cursor", "pointer")
    .style("font-size", FONT_SIZE)
    .style("fill", TEXT_COLOR)
    .on("mouseover", (position, i) => {
      const { label } = data[i];
      svg
        .append("g")
        .attr("data-type", "full-text")
        .attr("transform", "translate(5," + yScale(0) + ")")
        .append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("fill", TEXT_COLOR)
        .style("font-size", FONT_SIZE)
        .style("text-transform", "uppercase")
        .attr("opacity", 0)
        .text(label)
        .transition()
        .duration(200)
        .attr("opacity", 1);
    })
    .on("mouseout", function () {
      svg
        .selectAll('[data-type="full-text"]')
        .transition()
        .duration(200)
        .attr("opacity", 0)
        .remove();
    });

  const yAxisElement = svg
    .select(".bar-chart___y-axis")
    .style("stroke-dasharray", yStrokeDash)
    .call(
      d3
        .axisRight(yScale)
        .tickValues([maxValue * (1 / 3), maxValue * (2 / 3), maxValue])
        .tickSize(actualWidth)
    );

  yAxisElement.selectAll("line").attr("stroke", GRID_COLOR);

  yAxisElement.selectAll("text").remove();
  yAxisElement.selectAll("path").remove();
}

function renderBars({ svg, xScale, yScale, data, actualHeight, maxValue, colorScale }) {
  const barPieSize = 5;
  const maxPieCount = (actualHeight - yScale(maxValue)) / barPieSize;

  colorScale
      .domain([0, maxPieCount]);

  const pieSize = barPieSize - 1;
  svg.selectAll('[data-type="bar-group"]').remove();
  data.forEach((x) => {
    const barGroup = svg.append("g").attr("data-type", "bar-group");

    const actualPieCount = (actualHeight - yScale(x.value)) / barPieSize;
    const pieCount = Math.trunc(actualPieCount);
    const restPart = actualPieCount - Math.floor(actualPieCount);

    for (let i = 0; i < pieCount; i++) {
      barGroup
        .append("rect")
        .attr("class", "bar-chart__bar-dash")
        .attr("fill", colorScale(i))
        .attr("x", xScale(x.shortLabel))
        .attr("width", xScale.bandwidth())
        .attr("y", actualHeight - barPieSize * (i + 1))
        .attr("height", pieSize);
    }
    if (restPart !== 0) {
      barGroup
        .append("rect")
        .attr("class", "bar-chart__bar-dash")
        .attr("fill", colorScale(pieCount))
        .attr("x", xScale(x.shortLabel))
        .attr("width", xScale.bandwidth())
        .attr(
          "y",
          actualHeight -
            barPieSize * (pieCount + 1) -
            (pieSize * restPart - barPieSize + 1)
        )
        .attr("height", pieSize * restPart);
    }

    barGroup
      .append("rect")
      .attr("class", "bar-chart__hidden-bar")
      .attr("fill", "transparent")
      .attr("x", xScale(x.shortLabel))
      .attr("width", xScale.bandwidth())
      .attr("y", yScale(x.value))
      .attr("height", actualHeight - yScale(x.value))
      .on("mouseover", () => {
        buildTooltip({
          group: barGroup,
          x: xScale(x.shortLabel) + xScale.bandwidth() / 2,
          y: yScale(x.value),
          percent: x.tooltipValue,
          additionalClass: "bar-chart__tooltip--active",
        });
      })
      .on("mouseout", () => {
        barGroup.select("foreignObject").remove();
      });
  });
}

function calculateMetrics({ margin, width, height, data }) {
  let actualWidth = width - margin.left - margin.right;
  let actualHeight = height - margin.top - margin.bottom;

  let maxValue = Math.max(...data.map((x) => x.value));
  let yDomain = maxValue + maxValue / 20;

  return {
    actualWidth,
    actualHeight,
    yDomain,
    maxValue,
  };
}

export function barChart({
  width,
  height,
  selector,
  data,
  margin = { top: 0, left: 0, bottom: 90, right: 0 },
}) {
  const { actualWidth, actualHeight, yDomain, maxValue } = calculateMetrics({
    width,
    height,
    margin,
    data,
  });

  const xScale = d3
    .scaleBand()
    .range([0, actualWidth])
    .padding(0.1)
    .domain(data.map((x) => x.shortLabel));

  const yScale = d3.scaleLinear().domain([0, yDomain]).range([actualHeight, 0]);

  const colorScale = d3.scaleLinear()
      .range(['#311415', "#20C9A7"]);

  const svg = d3
    .select(selector)
    .append("svg")
    .data([data])
    .attr("width", actualWidth)
    .attr("height", height)
    .attr("class", "bar-chart");

  const container = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  createAxis({ svg: container });
  renderAxis({
    svg: container,
    actualHeight,
    yScale,
    xScale,
    data,
    maxValue: yDomain,
    actualWidth,
  });

  renderBars({ svg: container, actualHeight, yScale, xScale, data, maxValue, colorScale });

  return ({ data: updatedData, width, height }) => {
    const newData = updatedData || data;
    const { actualWidth, actualHeight, yDomain, maxValue } = calculateMetrics({
      width,
      height,
      margin,
      data: newData,
    });

    xScale.range([0, actualWidth]).domain(newData.map((x) => x.shortLabel));

    yScale.domain([0, yDomain]).range([actualHeight, 0]);

    svg
        .data([newData])
        .attr("width", actualWidth)
        .attr("height", height);

    renderAxis({
      svg: container,
      actualHeight,
      yScale,
      xScale,
      data: newData,
      maxValue: yDomain,
      actualWidth,
    });

    renderBars({
      svg: container,
      actualHeight,
      yScale,
      xScale,
      data: newData,
      maxValue,
      colorScale
    });
  };
}
