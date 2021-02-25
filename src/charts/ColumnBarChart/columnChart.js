import * as d3 from "d3";
import "./columnChart.scss";

const TEXT_COLOR = "#9B9B9B";
const BAR_COLORS = [
  "#0C6351",
  "#0B5545",
  "#19A887",
  "#20C9A7",
  "#58E2C2",
  "#27E9BE",
  "#5C9D92",
  "#5C9D92",
].reverse();
const LEFT_OFFSET = 90;
const RIGHT_OFFSET = 70;

function renderBars({ xScale, yScale, svg, data }) {
  const barsGroup = svg.select('[data-type="bars-container"]');
  barsGroup
    .selectAll(".horizontal-bar-chart__bar")
    .data(data)
    .join("rect")
    .attr("class", "horizontal-bar-chart__bar")
    .attr("fill", (d, index) => BAR_COLORS[index])
    .attr("width", (d) => {
      return xScale(d.value) < 10 ? 10 : xScale(d.value);
    })
    .attr("y", (d) => {
      return yScale(d.label) + yScale.bandwidth() / 2 - 5;
    })
    .attr("rx", "5px")
    .attr("ry", "5px")
    .attr("height", "10px")
    .on("mouseover", (d) => {
      buildTooltip({
        group: barsGroup,
        x: xScale(d.value) < 10 ? 10 : xScale(d.value),
        y: yScale(d.label) + yScale.bandwidth() / 2 - 5,
        percent: d.value,
        additionalClass: "horizontal-bar-chart__tooltip--active",
      });
    })
    .on("mouseout", () => {
      barsGroup.select("foreignObject").remove();
    })
}

function buildTooltip({ group, x, y, percent, additionalClass }) {
  const fo = group.append("foreignObject");

  const wrapperWidth = 56;
  const wrapperHeight = 25;

  const tooltip = fo
    .attr("width", wrapperWidth)
    .attr("height", wrapperHeight)
    .attr("x", x + 15)
    .attr("y", y - wrapperHeight / 2 + 5)
    .style("overflow", "visible")
    .append("xhtml:div");

  tooltip
    .classed("horizontal-bar-chart__tooltip", true)
    .classed(additionalClass, true);

  tooltip
    .append("div")
    .attr("class", "horizontal-bar-chart__container")
    .append("div")
    .attr("class", "horizontal-bar-chart__content")
    .html(percent * 100);

  tooltip.append("div").attr("class", "horizontal-bar-chart__arrow");
}

function renderAxis({ svg, yScale }) {
  const yAxis = svg.select('[data-type="y-axis"]').call(d3.axisLeft(yScale));

  yAxis.selectAll("path").remove();
  yAxis.selectAll("line").remove();
  yAxis.selectAll("text").attr("fill", TEXT_COLOR).attr("font-size", "12px");
}

export function horizontalBarChart({ width, height, selector, data }) {
  const actualWidth = width - LEFT_OFFSET - RIGHT_OFFSET;
  const maxValue = Math.max(...data.map((x) => x.value));
  const xScale = d3.scaleLinear().range([0, actualWidth]).domain([0, maxValue]);

  const yScale = d3
    .scaleBand()
    .range([height, 0])
    .padding(0.1)
    .domain(data.map((x) => x.label).reverse());

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "horizontal-bar-chart");

  const container = svg
    .append("g")
    .attr("transform", `translate(${LEFT_OFFSET})`);

  container.append("g").attr("data-type", "y-axis");
  container.append("g").attr("data-type", "bars-container");

  renderAxis({ svg: container, yScale });

  renderBars({ svg: container, xScale, yScale, data });

  return (updatedData) => {
    const newData = updatedData.data || data;
    const maxValue = Math.max(...newData.map((x) => x.value));
    const actualWidth = updatedData.width - LEFT_OFFSET - RIGHT_OFFSET;

    svg.attr("width", updatedData.width).attr("height", updatedData.height);

    xScale.range([0, actualWidth]).domain([0, maxValue]);

    yScale
      .range([updatedData.height, 0])
      .padding(0.1)
      .domain(newData.map((x) => x.label).reverse());

    renderAxis({ svg: container, yScale });

    renderBars({svg: container, xScale, yScale, data: newData});
  };
}
