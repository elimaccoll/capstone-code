const DATA_BUFFER = 20; // Store a buffer of 20 data points for each plot

// Clear local storage
$("#clear-data-btn").click(() => {
  window.onload = () => {
    localStorage.clear();
  };
  window.onunload = () => {
    localStorage.clear();
  };
  window.location.reload();
});

const getIndexFromName = (chartArr, chartName) => {
  for (let i = 0; i < chartArr.length; i++) {
    let currChartName = chartArr[i].name;
    if (currChartName === chartName) {
      return i;
    }
  }
  return -1;
};

export const storeDayNightCycle = (cycleLength) => {
  localStorage.dayNightCycle = JSON.stringify(cycleLength);
};

export const storeThresholds = (chartName, minThresh, maxThresh) => {
  let charts = JSON.parse(localStorage.charts);
  const index = getIndexFromName(charts, chartName);
  if (index === -1) {
    return;
  }
  charts[index].config.minThreshold = minThresh;
  charts[index].config.maxThreshold = maxThresh;
  localStorage.charts = JSON.stringify(charts);
};

export const storeDataBuffer = (chartName, plotPoint, seriesInd) => {
  let charts = JSON.parse(localStorage.charts);
  const index = getIndexFromName(charts, chartName);
  if (index === -1) {
    return;
  }
  let currBuffer;
  if (seriesInd == 0) {
    currBuffer = charts[index].config.data1;
    if (currBuffer.length >= DATA_BUFFER) {
      currBuffer.shift();
    }
    currBuffer.push(plotPoint);
    charts[index].config.data1 = currBuffer;
  } else if (seriesInd == 1) {
    currBuffer = charts[index].config.data2;
    if (currBuffer.length >= DATA_BUFFER) {
      currBuffer.shift();
    }
    currBuffer.push(plotPoint);
    charts[index].config.data2 = currBuffer;
  }
  localStorage.charts = JSON.stringify(charts);
};
