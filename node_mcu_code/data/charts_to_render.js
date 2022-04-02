export default [
    {
        name: "air-temp",
        config: {
            symbol: "it",
            title: "Air Temperature",
            yAxis: "Temperature (°C)",
            unit: "°C",
            minBound: 0,
            maxBound: 100,
            minThreshold: 20,
            maxThreshold: 30,
            data1: [],
            data2: [],
        },
        read: {
            intervals: [1, 3],
            routes: ["internal_air_temp", "external_air_temp"]
        }
    },
    {
        name: "humidity",
        config: {
            symbol: "ih",
            title: "Humidity",
            yAxis: "% Humidity",
            unit: "%",
            minBound: 0,
            maxBound: 100,
            minThreshold: 40,
            maxThreshold: 50,
            data1: [],
            data2: [],
        },
        read: {
            intervals: [1, 3],
            routes: ["internal_humidity", "external_humidity"]
        }
    },
    {
        name: "water-temp",
        config: {
            symbol: "wt",
            title: "Water Temperature",
            yAxis: "Temperature (°C)",
            unit: "°C",
            minBound: 0,
            maxBound: 100,
            minThreshold: 5,
            maxThreshold: 15,
            data1: [],
            data2: [],
        },
        read: {
            intervals: [3],
            routes: ["water_temp"]
        }
    },
    {
        name: "soil-temp",
        config: {
            symbol: "st",
            title: "Soil Temperature",
            yAxis: "Temperature (°C)",
            unit: "°C",
            minBound: 0,
            maxBound: 100,
            minThreshold: 20,
            maxThreshold: 30,
            data1: [],
            data2: [],
        },
        read: {
            intervals: [3],
            routes: ["soil_temp"]
        }
    },
    {
        name: "tds",
        config: {
            symbol: "td",
            title: "Total Dissolved Solids (TDS)",
            yAxis: "TDS (ppm)",
            unit: "ppm",
            minBound: 0,
            maxBound: 1000,
            minThreshold: 0,
            maxThreshold: 100,
            data1: [],
            data2: [],
        },
        read: {
            intervals: [5],
            routes: ["tds"]
        }
    },
    {
        name: "soil-moisture",
        config: {
            symbol: "sm",
            title: "Soil Moisture",
            yAxis: "Soil Moisture (%)",
            unit: "%",
            minBound: 0,
            maxBound: 100,
            minThreshold: 45,
            maxThreshold: 60,
            data1: [],
            data2: [],
        },
        read: {
            intervals: [5],
            routes: ["soil_moisture"]
        }
    },
]