const fs = require("fs");
const path = "./data/recordatorios.json";

function cargarRecordatorios() {
    try {
        const data = fs.readFileSync(path, "utf8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function guardarRecordatorios(recordatorios) {
    fs.writeFileSync(path, JSON.stringify(recordatorios, null, 2));
}

function eliminarRecordatorio(id) {
    const recordatorios = cargarRecordatorios();
    const filtrados = recordatorios.filter(r => r.id !== id);
    guardarRecordatorios(filtrados);
    return recordatorios.length !== filtrados.length;
}

module.exports = {
    cargarRecordatorios,
    guardarRecordatorios,
    eliminarRecordatorio
};