// Pushed in the same order as the tabs on the page
const tabs = [];
tabs.push($("#maintenance-tab"));
tabs.push($("#help-tab"));
tabs.push($("#plant-tab"));
tabs.push($("#about-tab"));

const content = [];
content.push($("#maintenance-content"));
content.push($("#help-content"));
content.push($("#plant-content"));
content.push($("#about-content"));

let active_tab = 0;

for (let i = 0; i < tabs.length; i++) {
    let tab = tabs[i];
    tab.click(() => {
        if (active_tab == i) { return; }
        tab.addClass("active");
        tabs[active_tab].removeClass("active");
        content[i].removeClass("d-none");
        content[active_tab].addClass("d-none");
        active_tab = i;
    });
}