const InfoPanel = () => {
  return `
        <div class="row">
            <ul class="nav nav-tabs mt-1">
                <li class="nav-item">
                    <div class="nav-link active info-tab" id="maintenance-tab">Maintenance</div>
                </li>
                <li class="nav-item">
                    <div class="nav-link info-tab" id="help-tab">Help</div>
                </li>
                <li class="nav-item">
                    <div class="nav-link info-tab" id="plant-tab">Plant Info</div>
                </li>
                <li class="nav-item">
                    <div class="nav-link info-tab" id="about-tab">About</div>
                </li>
            </ul>
            <div class="info-panel-content mt-2">
                <div class="row text-center info-content" id="maintenance-content">
                    <div class="col-4">
                        <div>
                            Water Level:
                            <span id="maintenance-wl-indicator"></span>
                        </div>
                        <div class="mt-2 d-flex justify-content-center">
                            <div class="w-100 py-2 rounded-pill" id="maintenance-filter">
                                Filter Quality:
                                <span id="maintenance-filter-quality"></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-4">
                        <label class="form-label" for="led-control">
                            LED Brightness: 
                            <span id="led-brightness">0</span>
                        </label>
                        <input type="range" class="form-range" value="0" min="0" max="100" id="led-control"/>
                    </div>
                    <div class="col-4">
                        <button class="btn btn-info" id="testing-btn">
                            Testing
                        </button>
                        <button class="btn btn-danger" id="clear-data-btn">
                            Clear Data
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
