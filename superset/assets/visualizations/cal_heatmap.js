// JS
import d3 from 'd3';

// CSS
require('./cal_heatmap.css');

const CalHeatMap = require('cal-heatmap');

function calHeatmap(slice, payload) {
  const div = d3.select(slice.selector);
  const data = payload.data;

  div.selectAll('*').remove();
  const cal = new CalHeatMap();

  const timestamps = data.timestamps;
  const extents = d3.extent(Object.keys(timestamps), key => timestamps[key]);
  const step = (extents[1] - extents[0]) / 7;

  try {
    cal.init({
      start: data.start,
      cellSize: 13, 
      domainMargin: 13,
      legendMargin: [0,0,0,0],
      data: timestamps,
      itemSelector: slice.selector,
      tooltip: true,
      domain: data.domain,
      domainLabelFormat: "%b",
      subDomain: data.subdomain,
      range: data.range,
      browsing: true,
      legend: [extents[0], extents[0] + step, extents[0] + (step * 2), extents[0] + (step * 3), extents[0] + (step * 4), extents[0] + (step * 5)],
    });
  } catch (e) {
    slice.error(e);
  }
} 

module.exports = calHeatmap;
