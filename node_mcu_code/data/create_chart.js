export const createChart = (chart_id, plot_title, y_axis_title, y_axis_unit, config, data_arr1, data_arr2 = []) => {
    return Highcharts.chart(chart_id, {
        global: {
            UTC: false,
            timezone: "EST",
            timezoneOffset: 180
        },
        chart: {
            backgroundColor: 'azure', // Same as body background color
            zoomType: 'x',
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: plot_title
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
                text: y_axis_title
            },
            min: config.min_bound,
            max: config.max_bound,
            tickInterval: 5,
            plotBands: [{
                color: 'lightgreen',
                from: config.min_threshold,
                to: config.max_threshold
            }],
            ceiling: config.max_bound,
            floor: config.min_bound
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
            valueSuffix: y_axis_unit,
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
                return series_name + '<br>' + dt_str + '<br>' + this.y.toFixed(2) + y_axis_unit;
            }
        },
        series: [
            {
                name: 'Terrarium Sensor Data',
                type: 'line',
                data: data_arr1,
                marker: {
                    lineWidth: 1,
                    lineColor: 'black',
                },
                lineWidth: 1.5,
                // Threshold Zones only apply to this series
                zones: [{
                    value: config.min_threshold,
                    color: 'red'
                }, {
                    value: config.max_threshold,
                    color: 'blue'
                }, {
                    value: Number.MAX_SAFE_INTEGER,
                    color: 'red'
                }]
            },
            {
                name: 'External Sensor Data',
                type: 'line',
                data: data_arr2,
                marker: {
                    fillColor: 'white', // Set marker fill color
                    lineWidth: 1,
                    lineColor: 'black',
                },
                lineWidth: 1.5,
                color: 'black',
            }
        ]
    });
};