

// Load data
async function loadData() {
    const loaded_data = fetch("database.json").then((response) => {
        return response.json();
    }).then((data) => {
        return data;
    });
    return loaded_data;
}

async function displayData() {
    const data = await loadData();
    console.log(data);
}

displayData();

function storeData(data) {
    localStorage.setItem('data', JSON.stringify(data));
}
