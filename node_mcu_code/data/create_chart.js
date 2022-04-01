const parseLoadedData = (data_arr) => {
    let data_out = [];
    for (let point of data_arr) {
        const t = Date.parse(point.x);
        const entry = [t, point.y];
        data_out.push(entry);
    }
    return data_out;
}

export const createChart = (chart) => {
    const chart_id = `chart-${chart.name}`;
    const chart_config = chart.config;
    return Highcharts.chart(chart_id, {
        global: {
            UTC: false,
            timezone: "EST",
            timezoneOffset: 180
        },
        chart: {
            height: "75%",
            backgroundColor: 'azure', // Same as body background color
            zoomType: 'x',
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: chart_config.title
        },
        subtitle: {
            text: "Click and drag to zoom in. Hold down shift key to pan."
        },
        legend: {
            enabled: false
        },
        xAxis: {
            title: {
                text: 'Datetime'
            },
            type: 'datetime',
            labels: {
                format: '{value:%b. %e}'
            }
        },
        yAxis: {
            title: {
                text: chart_config.yAxis
            },
            min: chart_config.minBound,
            max: chart_config.maxBound,
            tickInterval: 5,
            plotBands: [{
                color: 'lightgreen',
                from: chart_config.minThreshold,
                to: chart_config.maxThreshold
            }],
            ceiling: chart_config.maxBound,
            floor: chart_config.minBound
        },
        plotOptions: {
            series: {
                stickyTracking: false,
                cursor: 'pointer',
            }
        },
        tooltip: {
            crosshairs: true,
            //snap: 5,
            valueSuffix: chart_config.unit,
            valueDecimals: 2,
            formatter: function() {
                const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
                let x_raw = this.x;
                let x;
                // If it is a number (from loaded data)
                if (!isNaN(x_raw)) {
                    x = new Date(x_raw);
                }
                else {
                    x = JSON.stringify(x_raw);
                    x = x.substring(1, x.length-2);
                }
                const series_name = this.series.name;
                const dt = new Date(Date.parse(x));
                const dt_str = monthLabels[dt.getMonth()] + " " + dt.getDate() + 
                " "+ (dt.getHours() + 4) + ":"+ dt.getMinutes()+ ":"+ dt.getSeconds();
                return series_name + '<br>' + dt_str + '<br>' + this.y.toFixed(2) + chart_config.unit;
            }
        },
        series: [
            {
                name: 'Terrarium Sensor Data',
                type: 'line',
                data: parseLoadedData(chart_config.data1),
                marker: {
                    lineWidth: 1,
                    lineColor: 'black',
                },
                lineWidth: 1.5,
                // Threshold Zones only apply to this series
                zones: [{
                    value: chart_config.minThreshold,
                    color: 'red'
                }, {
                    value: chart_config.maxThreshold,
                    color: 'blue'
                }, {
                    value: Number.MAX_SAFE_INTEGER,
                    color: 'red'
                }]
            },
            {
                name: 'External Sensor Data',
                type: 'line',
                data: parseLoadedData(chart_config.data2),
                marker: {
                    fillColor: 'white', // Set marker fill color
                    lineWidth: 1,
                    lineColor: 'black',
                },
                lineWidth: 1.5,
                color: 'black',
            }
        ],
    });
};