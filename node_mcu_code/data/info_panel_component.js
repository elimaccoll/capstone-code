const InfoPanel = () => {
    return (`
        <ul class="nav nav-tabs" id="info">
            <li class="nav-item">
            <div class="nav-link active info-tab" id="help-tab">Help</div>
            </li>
            <li class="nav-item">
            <div class="nav-link info-tab" id="maintenance-tab">Maintenance</div>
            </li>
            <li class="nav-item">
                <div class="nav-link info-tab" id="plant-tab">Plant Info</div>
            </li>
            <li class="nav-item">
                <div class="nav-link info-tab" id="about-tab">About</div>
            </li>
        </ul>
        <div class="info-panel-content">
            <div class="info-content" id="help-content">
                help content
            </div>
            <div class="hidden info-content" id="maintenance-content">
                maintenance content
                <button class="btn btn-danger" id="clear-data-btn">Clear Data</button>
                <button class="btn btn-info" id="testing-btn">Testing</button>
                <div id="maintenance-wl">
                    Water Level: 
                    <span id="maintenance-wl-indicator"></span>
                </div>
            </div>
            <div class="hidden info-content" id="plant-content">
                plant content
            </div>
            <div class="hidden info-content" id="about-content">
                about content
            </div>
        </div>
    `);
};
export default InfoPanel;