const InfoPanel = () => {
  return `
        <div class="row">
            <ul class="nav nav-tabs mt-1">
                <li class="nav-item">
                    <div class="nav-link active info-tab" id="maintenance-tab">Maintenance</div>
                </li>
                <li class="nav-item">
                    <div class="nav-link info-tab" id="day-night-tab">Day/Night</div>
                </li>
                <li class="nav-item">
                    <div class="nav-link info-tab" id="help-tab">Help</div>
                </li>
                <li class="nav-item">
                    <div class="nav-link info-tab" id="plant-tab">Plant</div>
                </li>
                <li class="nav-item">
                    <div class="nav-link info-tab" id="about-tab">About</div>
                </li>
            </ul>
            <div class="info-panel-content mt-2">
                <div class="row text-center info-content" id="maintenance-content">
                    <div class="col-4">
                        <div>
                            <div class="w-100 py-2 rounded-pill" id="maintenance-water-level">
                                Water Level:
                                <span id="maintenance-wl-indicator"></span>
                            </div>
                        </div>
                        <div class="mt-2 d-flex justify-content-center">
                            <div class="w-100 py-2 rounded-pill" id="maintenance-filter">
                                Filter Age:
                                <span id="maintenance-filter-age"></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div>
                            <label class="form-label" for="led-control">
                                LED Brightness: 
                                <span id="led-brightness">0</span>
                            </label>
                            <input type="range" class="form-range" value="0" min="0" max="100" id="led-control"/>
                        </div>
                    </div>
                    <div class="col-4">
                        <div>
                            <button class="btn btn-warning" id="testing-btn">
                                Testing
                            </button>
                        </div>
                        <div>
                            <button class="btn btn-danger" id="clear-data-btn">
                                Clear Data
                            </button>
                        </div>
                        <div>
                        <button class="btn btn-primary" id="filter-btn">
                            Filter Changed
                        </button>
                    </div>
                    </div>
                </div>
                <div class="d-none text-center info-content" id="day-night-content">
                    <label class="form-label" for="day-night-control">
                        Day Night Cycle: 
                        <span id="day-night-length-display"></span>
                    </label>
                    <div class="d-flex justify-content-center align-items-center flex-wrap">
                        <div>
                            <div class="input-group">
                                <label class="input-group-text">Cycle Length</label>
                                <input type="number" min="60" value="60" class="form-control" id="day-night-length" placeholder="Cycle Length"/>
                            </div>
                        </div>
                        <div>
                            <div class="input-group">
                                <label class="input-group-text">Start Time</label>
                                <input type="number" min="0" value="0" class="form-control" id="day-night-start" placeholder="Cycle Start"/>
                            </div>
                        </div>
                        <div>
                            <div class="input-group">
                                <label class="input-group-text">From</label>
                                <select class="form-select" id="day-night-day">
                                    <option value="1">Midnight</option>
                                    <option value="0">Noon</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn btn-success mt-1" id="day-night-btn">
                            Set
                        </button>
                    </div>
                </div>
                <div class="d-none text-center info-content" id="help-content">
                    Info about each plot - what it represents and what actuators it controls
                </div>
                <div class="d-none text-center info-content" id="plant-content">
                    Info about the cobra lily specifically.  Where it grows naturally, ideal conditions, etc.
                </div>
                <div class="d-none text-center info-content" id="about-content">
                    Idk if we even need this tab - maybe just description of the project
                </div>
            </div>
        </div>
    `;
};
export default InfoPanel;
