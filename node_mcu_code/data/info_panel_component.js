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
                <li class="nav-item">
                    <div class="nav-link info-tab" id="testing-tab">Testing</div>
                </li>
            </ul>
            <div class="info-panel-content mt-2 overflow-auto">
                <div class="row text-center info-content" id="maintenance-content">
                    <div class="col-5">
                        <div>
                            <div class="w-100 py-2 rounded-pill" id="maintenance-water-level">
                                Water Level:
                                <span id="maintenance-wl-indicator"></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-5">
                        <div>
                            <div class="w-100 py-2 rounded-pill" id="maintenance-filter">
                                Filter Age:
                                <span id="maintenance-filter-age"></span>
                            </div>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-primary" id="filter-btn">
                                Filter Changed
                            </button>
                        </div>
                    </div>
                    <div class="col-2 mt-5">
                        <button class="btn btn-danger" id="clear-data-btn">
                            Clear Data
                        </button>
                    </div>
                </div>
                <div class="d-none text-center info-content" id="day-night-content">
                    <label class="form-label" for="day-night-control">
                        Day/Night Cycle: 
                        <span><span id="day-night-length-display"></span> mins</span>
                    </label>
                    <div class="d-flex justify-content-center align-items-center flex-wrap">
                        <div>
                            <div class="input-group">
                                <label class="input-group-text">Cycle Length</label>
                                <input type="number" min="1" value="2" class="form-control" id="day-night-length" placeholder="Cycle Length" title="Length of day/night period in minutes"/>
                            </div>
                        </div>
                        <div>
                            <div class="input-group">
                                <label class="input-group-text">Start Time</label>
                                <input type="number" min="0" value="0" class="form-control" id="day-night-start" placeholder="Cycle Start" title="Start time into cycle in minutes"/>
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
                    <div class="d-flex justify-content-center">
                        <table class="table table-hover text-center w-75">
                            <thead>
                                <tr>
                                    <th scope="col">Plot</th>
                                    <th scope="col">Data</th>
                                    <th scope="col">Control</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Air Temperature</td>
                                    <td>Plots internal (blue or red dots) and external (white diamonds) air temperature</td>
                                    <td>Fans and peliter cooling system</td>
                                </tr>
                                <tr>
                                    <td>Humidity</td>
                                    <td>Plots internal (blue or red dots) and external (white diamonds) humidity</td>
                                    <td>Mister and fans</td>
                                </tr>
                                <tr>
                                    <td>Water Temperature</td>
                                    <td>Plots the water temperature in the resevoir</td>
                                    <td>Chiller</td>
                                </tr>
                                <tr>
                                    <td>TDS</td>
                                    <td>Plots total dissolved solids in the water resevoir (distilled water is 0)</td>
                                    <td>Water filters</td>
                                </tr>
                                <tr>
                                    <td>Soil Moisture</td>
                                    <td>Plots soil moisture - water stored in the soil</td>
                                    <td>Water pumps</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="d-none text-center info-content text-center" id="plant-content">
                    <h1>Cobra Lily</h1>
                    <ul class="list-group">
                        <li class="list-group-item">Cold running groundwater</li>
                        <li class="list-group-item">Low nutrient soil and water</li>
                        <li class="list-group-item">Temperate mountain climate</li>
                        <li class="list-group-item">Day & Night cycles</li>
                    </ul>
                </div>
                <div class="d-none text-center info-content" id="about-content">
                    <div class="row">
                        <div class="col-2"></div>
                        <div class="col-8">
                            Habitat simulation with programmable growth parameters to support growing plants with different needs.
                            The sensors monitor the environmental conditions inside the enclosure in real-time.  The threshold bands 
                            on each plot correspond to the acceptable range of values required by the plant.  Actuators are triggered
                            according to the configured ranges on each plot to alter the environmental conditions according to the user
                            parameters.
                        </div>
                        <div class="col-2"></div>
                    </div>
                </div>
                <div class="d-none text-center info-content" id="testing-content">
                    <div class="row">
                        <div class="mt-5 col-10">
                            <label class="form-label" for="led-control">
                                LED Brightness: 
                                <span id="led-brightness">0</span>
                            </label>
                            <input type="range" class="form-range" value="0" min="0" max="100" id="led-control"/>
                        </div>
                        <div class="col-2">
                            <button class="btn btn-warning" id="testing-btn">
                                Testing
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
export default InfoPanel;
