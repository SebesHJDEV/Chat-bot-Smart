const express = require("express");
const router = express.Router();
const { procesarChat, obtenerHistorialChat } = require("../controllers/chat.controller");

router.post("/OpenAI", procesarChat);
router.get("/historial", obtenerHistorialChat);

module.exports = router;
