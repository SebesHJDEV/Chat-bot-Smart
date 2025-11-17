require("dotenv").config();
const express = require("express");
const path = require("path");

const chatRoutes = require("./routes/chat.routes.js");
const recordatoriosRoutes = require("./routes/recordatorios.routes.js");

const app = express();

app.set("port", 3000);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Activar rutas
app.use("/chat", chatRoutes);
app.use("/recordatorios", recordatoriosRoutes);

app.listen(app.get("port"), () => {
    console.log(`Servidor funcionando en puerto ${app.get("port")}`);
});
