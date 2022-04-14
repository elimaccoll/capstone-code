// Pushed in the same order as the tabs on the page
const tabs = [];
tabs.push($("#maintenance-tab"));
tabs.push($("#day-night-tab"));
tabs.push($("#help-tab"));
tabs.push($("#plant-tab"));
tabs.push($("#about-tab"));
tabs.push($("#testing-tab"));

const content = [];
content.push($("#maintenance-content"));
content.push($("#day-night-content"));
content.push($("#help-content"));
content.push($("#plant-content"));
content.push($("#about-content"));
content.push($("#testing-content"));

let activeTab = 0;

for (let i = 0; i < tabs.length; i++) {
  let tab = tabs[i];
  tab.click(() => {
    if (activeTab == i) {
      return;
    }
    tab.addClass("active");
    tabs[activeTab].removeClass("active");
    content[i].removeClass("d-none");
    content[activeTab].addClass("d-none");
    activeTab = i;
  });
}
