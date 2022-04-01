const DATA_BUFFER = 20; // Store a buffer of 20 data points for each plot

// Clear local storage
const clear_btn = document.getElementById("clear-data-btn");
clear_btn.addEventListener('click', () => {
    window.onload = () => {
        localStorage.clear();
    }
    window.onunload = () => {
        localStorage.clear();
    }
    window.location.reload();
});

const getIndexFromName = (chart_arr, chart_name) => {
    for (let i = 0; i < chart_arr.length; i++) {
        let curr_chart_name = chart_arr[i].name;
        if (curr_chart_name === chart_name) {
            return i;
        };
    }
    return -1;
}

export const storeThresholds = (chart_name, minThreshold, maxThreshold) => {
    let charts = JSON.parse(localStorage.charts);
    const index = getIndexFromName(charts, chart_name);
    if (index === -1) { return; }
    charts[index].config.minThreshold = minThreshold;
    charts[index].config.maxThreshold = maxThreshold;
    localStorage.charts = JSON.stringify(charts);
}

export const storeDataBuffer = (chart_name, plot_point, series_ind) => {
    let charts = JSON.parse(localStorage.charts);
    const index = getIndexFromName(charts, chart_name);
    if (index === -1) { return; }
    let curr_buffer;
    if (series_ind == 0) {
        curr_buffer = charts[index].config.data1;
        if (curr_buffer.length >= DATA_BUFFER) { curr_buffer.shift(); }
        curr_buffer.push(plot_point);
        charts[index].config.data1 = curr_buffer;
    }
    else if (series_ind == 1) {
        curr_buffer = charts[index].config.data2;
        if (curr_buffer.length >= DATA_BUFFER) { curr_buffer.shift(); }
        curr_buffer.push(plot_point);
        charts[index].config.data2 = curr_buffer;
    }
    localStorage.charts = JSON.stringify(charts);
}