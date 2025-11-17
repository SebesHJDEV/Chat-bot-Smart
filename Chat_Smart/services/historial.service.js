const fs = require("fs");
const path = "./data/historial.json";

function cargarHistorial() {
    try {
        const data = fs.readFileSync(path, "utf8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function guardarHistorial(historial) {
    fs.writeFileSync(path, JSON.stringify(historial, null, 2));
}

module.exports = {
    cargarHistorial,
    guardarHistorial
};
