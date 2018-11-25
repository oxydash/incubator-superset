import React from 'react';
import ReactDOM from 'react-dom';
import { XYChart, AreaSeries, PointSeries, CrossHair, LinearGradient } from '@data-ui/xy-chart';

import { d3FormatPreset, d3TimeFormatPreset } from '../javascripts/modules/utils';
import { getTextWidth } from '../javascripts/modules/visUtils';

const fontFamily = '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Open Sans,Helvetica Neue,sans-serif';

const CONTAINER_PADDING = 16;


const CONTAINER_STYLES = {
  fontFamily,
  padding: CONTAINER_PADDING,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const BIG_NUMBER_STYLES = {
  lineHeight: '1em',
  paddingTop: '0.37em',
  paddingBottom: '0.10em',
  fontWeight: 600,
  textAlign: 'center',
};

const SUBHEADER_STYLES = {
  fontWeight: 300,
  paddingTop: '0.5em',
  paddingBottom: '0.5em',
  lineHeight: '1em',
  textAlign: 'center',
};

const CHART_MARGIN = {
  top: 4,
  right: 4,
  bottom: 4,
  left: 4,
};

const TOOLTIP_STYLES = {
  padding: '4px 8px',
};

const NUMBER_SIZE_SCALAR = 0.34;
const CHART_SIZE_SCALAR = 0.2;
const TEXT_SIZE_SCALAR = 0.2;

// Returns the maximum font size (<= idealFontSize) that will fit within the availableWidth
function getMaxFontSize({ text, availableWidth, idealFontSize, fontWeight = 'normal' }) {
  let fontSize = idealFontSize;
  let textWidth = getTextWidth(text, `${fontWeight} ${fontSize}px ${fontFamily}`);
  while (textWidth > availableWidth) {
    fontSize -= 2;
    textWidth = getTextWidth(text, `${fontWeight} ${fontSize}px ${fontFamily}`);
  }
  return fontSize;
}

function renderTooltipFactory({ formatDate, formatValue }) {
  return function renderTooltip({ datum }) { // eslint-disable-line
    const { x: rawDate, y: rawValue } = datum;
    const formattedDate = formatDate(rawDate);
    const value = formatValue(rawValue);

    return (
      <div style={TOOLTIP_STYLES}>
        {formattedDate}
        <br />
        <strong>{value}</strong>
      </div>
    );
  };
}
function bigNumberVis(slice, payload) {
  const { formData, containerId } = slice;
  const json = payload.data;
  const { data, subheader, compare_lag: compareLag, compare_suffix: compareSuffix} = json;
  const showTrendline = formData.viz_type === 'big_number';
  const formatValue = d3FormatPreset(formData.y_axis_format);
  const formatPercentChange = d3.format('+.1%');
  const formatDate = d3TimeFormatPreset('smart_date');
  const renderTooltip = renderTooltipFactory({ formatDate, formatValue });
  const gradientId = `big_number_${containerId}`;
  const totalWidth = slice.width();
  const totalHeight = slice.height();
  const availableWidth = totalWidth - 2 * CONTAINER_PADDING;

  let percentChange = null;
  let bigNumber = null;
  let brandColor = 'grey';

  if (showTrendline) {
    bigNumber = data[data.length - 1][1];
  } else {
    bigNumber = data[0][0];
  }

  if (formData.plan_fact) {
    if (bigNumber > 0 && bigNumber < 3) {
      if (bigNumber < 0.95) {
        brandColor = '#d63f2b';
      } else if (bigNumber < 1){
        brandColor = '#EF914E';
      } else {
        brandColor = '#54A05C';
      }
    }
  } else {
    if (bigNumber > 0) {
      brandColor = '#54A05C';
    } else {
      brandColor = '#d63f2b';
    }
  }

  if (showTrendline && compareLag > 0) {
    const compareIndex = data.length - (compareLag + 1);
    if (compareIndex >= 0) {
      const compareValue = data[compareIndex][1];
      bigNumber = bigNumber - compareValue;
      if (bigNumber >= 0) {brandColor = '#54A05C'} else {brandColor = '#d63f2b'};
      percentChange = compareValue === 0
        ? 0 : bigNumber / Math.abs(compareValue);
    }
  }

  const formattedBigNumber = formatValue(bigNumber);
  const formattedData = showTrendline ? data.map(d => ({ x: d[0], y: d[1] })) : null;
  const label = showTrendline ? compareSuffix : subheader;
  const formattedSubheader = percentChange === null ? label : (
    `${formatPercentChange(percentChange)} ${(compareSuffix || '').trim()}`
  );

  const bigNumberFontSize = getMaxFontSize({
    text: formattedBigNumber,
    availableWidth,
    idealFontSize: totalHeight * NUMBER_SIZE_SCALAR,
    fontWeight: BIG_NUMBER_STYLES.fontWeight,
  });

  const subheaderFontSize = formattedSubheader ? getMaxFontSize({
    text: formattedSubheader,
    availableWidth,
    idealFontSize: totalHeight * TEXT_SIZE_SCALAR,
    fontWeight: SUBHEADER_STYLES.fontWeight,
  }) : null;

  const Visualization = (
    <div style={{ height: totalHeight, ...CONTAINER_STYLES }}>
      <div
        style={{
          fontSize: bigNumberFontSize,
          color: brandColor,
          ...BIG_NUMBER_STYLES,
        }}
      >
        {formattedBigNumber}
      </div>

      {showTrendline &&
        <XYChart
          ariaLabel={`Big number visualization ${subheader}`}
          xScale={{ type: 'timeUtc' }}
          yScale={{ type: 'linear' , includeZero: false }}
          width={availableWidth}
          height={totalHeight * CHART_SIZE_SCALAR}
          margin={CHART_MARGIN}
          renderTooltip={renderTooltip}
          snapTooltipToDataX
        >
          <LinearGradient
            id={gradientId}
            from={brandColor}
            to="#fff"
          />
          <LinearGradient
            id="white_gradient"
            from="white"
            to="white"
            toOpacity={0}
          />
          <LinearGradient
            id="sky_gradient"
            from="#3498DB"
            to="#3498DB"
            toOpacity={0}
          />
          <LinearGradient
            id="green_gradient"
            from="#2ECC71"
            to="#2ECC71"
            toOpacity={0}
          />
          <LinearGradient
            id="red_gradient"
            from="#E74C3C"
            to="#E74C3C"
            toOpacity={0}
          />
          <LinearGradient
            id="yellow_gradient"
            from="#F1C40F"
            to="#F1C40F"
            toOpacity={0}
          />
          <LinearGradient
            id="purple_gradient"
            from="#9B59B6"
            to="#9B59B6"
            toOpacity={0}
          />
          <LinearGradient
            id="fire_gradient"
            from="#E74C3C"
            to="#F4D03F"
          />
          <LinearGradient
            id="warm_flame_gradient"
            from="#ff9a9e"
            to="#fad0c4"
          />
          <LinearGradient
            id="juice_peach_gradient"
            from="#ffecd2"
            to="#fcb69f"
          />
          <LinearGradient
            id="lady_lips_gradient"
            from="#ff9a9e"
            to="#fecfef"
          />
          <LinearGradient
            id="winter_neva_gradient"
            from="#a1c4fd"
            to="#c2e9fb"
          />
          <LinearGradient
            id="heavy_rain_gradient"
            from="#cfd9df"
            to="#e2ebf0"
          />
          <LinearGradient
            id="everlasting_sky_gradient"
            from="#fdfcfb"
            to="#e2d1c3"
          />
          <LinearGradient
            id="fly_high_gradient"
            from="#48c6ef"
            to="#6f86d6"
          />
          <LinearGradient
            id="fresh_milk_gradient"
            from="#feada6"
            to="#f5efef"
          />
          <LinearGradient
            id="aqua_splash_gradient"
            from="#13547a"
            to="#80d0c7"
          />
          <LinearGradient
            id="clean_mirror_gradient"
            from="#93a5cf"
            to="#e4efe9"
          />
          <LinearGradient
            id="morning_salad_gradient"
            from="#B7F8DB"
            to="#50A7C2"
          />
          <AreaSeries
            data={formattedData}
            fill={`url(#${gradientId})`}
            stroke={brandColor}
          />
          <PointSeries
            fill={brandColor}
            stroke="#fff"
            data={[formattedData[formattedData.length - 1]]}
          />
          <CrossHair
            stroke={brandColor}
            circleFill={brandColor}
            circleStroke="#fff"
            showHorizontalLine={false}
            fullHeight
            strokeDasharray="5,2"
          />
        </XYChart>}

      {formattedSubheader &&
        <div
          style={{
            fontSize: subheaderFontSize,
            color: brandColor,
            ...SUBHEADER_STYLES,
          }}
        >
          {formattedSubheader}
        </div>}
    </div>
  );

  ReactDOM.render(
    Visualization,
    document.getElementById(containerId),
  );
}

module.exports = bigNumberVis;
