const tabs = [];
tabs.push($("#help-tab"));
tabs.push($("#maintenance-tab"));
tabs.push($("#plant-tab"));
tabs.push($("#about-tab"));

const content = [];
content.push($("#help-content"));
content.push($("#maintenance-content"));
content.push($("#plant-content"));
content.push($("#about-content"));

let active_tab = 0;

for (let i = 0; i < tabs.length; i++) {
    let tab = tabs[i];
    tab.click(() => {
        if (active_tab == i) { return; }
        tab.addClass("active");
        tabs[active_tab].removeClass("active");
        content[i].removeClass("hidden");
        content[active_tab].addClass("hidden");
        active_tab = i;
    });
}