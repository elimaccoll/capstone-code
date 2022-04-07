// TODO: Fix timestamp on plot points

const parseLoadedData = (dataArr) => {
  let dataOut = [];
  for (let point of dataArr) {
    const t = Date.parse(point.x);
    const entry = [t, point.y];
    dataOut.push(entry);
  }
  return dataOut;
};

export const createChart = (chart) => {
  const id = `chart-${chart.name}`;
  const config = chart.config;
  return Highcharts.chart(id, {
    global: {
      UTC: false,
      timezone: "EST",
      timezoneOffset: 180,
    },
    chart: {
      height: "75%",
      backgroundColor: "azure", // Same as body background color
      zoomType: "x",
      panning: true,
      panKey: "shift",
    },
    title: {
      text: config.title,
    },
    subtitle: {
      text: "Click and drag to zoom in. Hold down shift key to pan.",
    },
    legend: {
      enabled: false,
    },
    xAxis: {
      title: {
        text: "Datetime",
      },
      type: "datetime",
      labels: {
        format: "{value:%b. %e}",
      },
    },
    yAxis: {
      title: {
        text: config.yAxis,
      },
      min: config.minBound,
      max: config.maxBound,
      tickInterval: 5,
      plotBands: [
        {
          color: "lightgreen",
          from: config.minThreshold,
          to: config.maxThreshold,
        },
      ],
      ceiling: config.maxBound,
      floor: config.minBound,
    },
    plotOptions: {
      series: {
        stickyTracking: false,
        cursor: "pointer",
      },
    },
    tooltip: {
      crosshairs: true,
      //snap: 5,
      valueSuffix: config.unit,
      valueDecimals: 2,
      formatter: function () {
        const monthLabels = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "June",
          "July",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        let xRaw = this.x;
        let x;
        // If it is a number (from loaded data)
        if (!isNaN(xRaw)) {
          x = new Date(xRaw);
        } else {
          x = JSON.stringify(xRaw);
          x = x.substring(1, x.length - 2);
        }
        const series_name = this.series.name;
        const dt = new Date(Date.parse(x));
        const dt_str =
          monthLabels[dt.getMonth()] +
          " " +
          dt.getDate() +
          " " +
          (dt.getHours() + 4) +
          ":" +
          dt.getMinutes() +
          ":" +
          dt.getSeconds();
        return (
          series_name +
          "<br>" +
          dt_str +
          "<br>" +
          this.y.toFixed(2) +
          config.unit
        );
      },
    },
    series: [
      {
        name: "Terrarium Sensor Data",
        type: "line",
        data: parseLoadedData(config.data1),
        marker: {
          lineWidth: 1,
          lineColor: "black",
        },
        lineWidth: 1.5,
        // Threshold Zones only apply to this series
        zones: [
          {
            value: config.minThreshold,
            color: "red",
          },
          {
            value: config.maxThreshold,
            color: "blue",
          },
          {
            value: Number.MAX_SAFE_INTEGER,
            color: "red",
          },
        ],
      },
      {
        name: "External Sensor Data",
        type: "line",
        data: parseLoadedData(config.data2),
        marker: {
          fillColor: "white", // Set marker fill color
          lineWidth: 1,
          lineColor: "black",
        },
        lineWidth: 1.5,
        color: "black",
      },
    ],
  });
};
