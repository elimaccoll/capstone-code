const help_tab = document.getElementById("help-tab");
const maintenance_tab = document.getElementById("maintenance-tab");
const plant_tab = document.getElementById("plant-tab");
const about_tab = document.getElementById("about-tab");

const help_content = document.getElementById("help-tab-content");
const maintenance_content = document.getElementById("maintenance-tab-content");
const plant_content = document.getElementById("plant-tab-content");
const about_content = document.getElementById("about-tab-content");

const tabs = [];
tabs.push(help_tab);
tabs.push(maintenance_tab);
tabs.push(plant_tab);
tabs.push(about_tab);

const content = [];
content.push(help_content);
content.push(maintenance_content);
content.push(plant_content);
content.push(about_content);

let active_tab = 0;

for (let i = 0; i < tabs.length; i++) {
    let tab = tabs[i];
    tab.addEventListener('click', () => {
        tab.classList.add("info-panel-tab-active");
        tabs[active_tab].classList.remove("info-panel-tab-active");
        content[i].classList.remove("hidden");
        content[active_tab].classList.add("hidden");
        active_tab = i;
    });
}