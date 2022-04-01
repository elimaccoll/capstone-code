const ChartListItem = (chart_name) => {
    return (`
        <li class="chart-list-item list-group-item col-12 col-sm-6 col-xl-4">
            <div class="chart" id="chart-${chart_name}"></div>
            <div class="row mt-2">
                <div class="form-group col-6 col-sm-12 col-md-6">
                    <div class="input-group mb-2 mb-lg-0 mb-sm-2">
                        <label class="input-group-text" for="${chart_name}-min-threshold">Min</label>
                        <input type="number" class="form-control" id="${chart_name}-min-threshold">
                        <button class="input-group-text btn btn-success" id="${chart_name}-min-btn">
                            ✓
                        </button>
                    </div>
                </div>
                <div class="form-group col-6 col-sm-12 col-md-6">
                    <div class="input-group">
                        <label class="input-group-text" for="${chart_name}-max-threshold">Max</label>
                        <input type="number" class="form-control" id="${chart_name}-max-threshold">
                        <button class="input-group-text btn btn-success" id="${chart_name}-max-btn">
                            ✓
                        </button>
                    </div>
                </div>
            </div>
        </li>
    `);
};
export default ChartListItem;