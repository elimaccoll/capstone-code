const ChartListItem = (chartName) => {
  return `
        <li class="chart-list-item list-group-item col-12 col-sm-6 col-xl-4">
            <div class="chart" id="chart-${chartName}"></div>
            <div class="row mt-2">
                <div class="form-group col-6 col-sm-12 col-md-6">
                    <div class="input-group mb-2 mb-lg-0 mb-sm-2">
                        <label class="input-group-text" for="${chartName}-min-threshold">Min</label>
                        <input type="number" class="form-control" id="${chartName}-min-threshold">
                        <button class="input-group-text btn btn-success" id="${chartName}-min-btn">
                            ✓
                        </button>
                    </div>
                </div>
                <div class="form-group col-6 col-sm-12 col-md-6">
                    <div class="input-group">
                        <label class="input-group-text" for="${chartName}-max-threshold">Max</label>
                        <input type="number" class="form-control" id="${chartName}-max-threshold">
                        <button class="input-group-text btn btn-success" id="${chartName}-max-btn">
                            ✓
                        </button>
                    </div>
                </div>
            </div>
        </li>
    `;
};
export default ChartListItem;
