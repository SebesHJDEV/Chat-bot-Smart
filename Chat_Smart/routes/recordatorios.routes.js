const express = require("express");
const router = express.Router();
const { crearRecordatorio, obtenerRecordatorios, borrarRecordatorio, actualizarRecordatorio } = require("../controllers/recordatorios.controller.js");

router.get("/", obtenerRecordatorios);
router.post("/", crearRecordatorio);
router.put("/:id", actualizarRecordatorio);   
router.delete("/:id", borrarRecordatorio);

module.exports = router;
