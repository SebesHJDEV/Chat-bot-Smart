
const { cargarRecordatorios, guardarRecordatorios, eliminarRecordatorio } = require("../services/recordatorios.service.js");


function crearRecordatorio(req, res) {
    const { titulo, fecha } = req.body;

    if (!titulo || !fecha) {
        return res.status(400).json({ error: "Faltan datos (titulo y fecha)" });
    }

    let recordatorios = cargarRecordatorios();

    const nuevo = {
        id: "rec_" + Math.random().toString(36).slice(2, 8),
        titulo,
        fecha,
        completado: false
    };

    recordatorios.push(nuevo);
    guardarRecordatorios(recordatorios);

    res.json({ msg: "Recordatorio creado", data: nuevo });
}

function obtenerRecordatorios(req, res) {
    const recordatorios = cargarRecordatorios();
    res.json(recordatorios);
}

function borrarRecordatorio(req, res) {
    const { id } = req.params;

    const eliminado = eliminarRecordatorio(id);

    if (!eliminado) {
        return res.status(404).json({ error: "Recordatorio no encontrado" });
    }

    return res.json({ msg: "Recordatorio eliminado" });
}

function actualizarRecordatorio(req, res) {
    const { id } = req.params;
    const { completado } = req.body;

    let recordatorios = cargarRecordatorios();

    const index = recordatorios.findIndex(r => r.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Recordatorio no encontrado" });
    }

    recordatorios[index].completado = completado;

    guardarRecordatorios(recordatorios);

    res.json({ msg: "Recordatorio actualizado", data: recordatorios[index] });
}

module.exports = { 
    crearRecordatorio, 
    obtenerRecordatorios, 
    borrarRecordatorio,
    actualizarRecordatorio
};