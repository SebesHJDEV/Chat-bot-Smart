const { generarEmbedding, chatOpenAI } = require("../services/openai.service.js");
const { cargarHistorial, guardarHistorial } = require("../services/historial.service.js");
const { detectarRecordatorioRegex } = require("../services/recordatorios.regex.js");
const { cargarRecordatorios, guardarRecordatorios } = require("../services/recordatorios.service.js");


// Analizar si es un recordatorio o solo un mensaje
async function analizarRecordatorio(message) {
    const prompt = `
Eres un analizador. Extrae si el mensaje del usuario es un recordatorio.
Responde SOLO un JSON válido.

Mensaje: "${message}"

Formato estrictamente:
{
  "esRecordatorio": true/false,
  "titulo": "texto",
  "fecha": "YYYY-MM-DD HH:mm"
}

Si no puedes detectar fecha, pon esRecordatorio: false.
`;

    const result = await chatOpenAI([
        { role: "system", content: "Eres un parser JSON estricto." },
        { role: "user", content: prompt }
    ]);

    try {
        return JSON.parse(result);
    } catch {
        return { esRecordatorio: false };
    }
}


// Similitud coseno
function cosineSimilarity(a, b) {
    let dot = 0, aMag = 0, bMag = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        aMag += a[i] * a[i];
        bMag += b[i] * b[i];
    }
    return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
}

// Buscar respuesta parecida en historial
function buscarRespuestaSimilar(historial, embeddingPregunta) {
    let mejorSimilitud = 0;
    let mejorMensaje = null;

    for (const item of historial) {
        if (item.role !== "bot") continue;

        const similitud = cosineSimilarity(embeddingPregunta, item.embedding);
        console.log("Similitud:", item.id, similitud);

        if (similitud > mejorSimilitud) {
            mejorSimilitud = similitud;
            mejorMensaje = item;
        }
    }

    return { mejorSimilitud, mejorMensaje };
}

// Controlador principal
async function procesarChat(req, res) {
    try {
        const { message } = req.body;

        // 🔹 1. Intento GRATIS de recordatorio (regex)
        const analisisRegex = detectarRecordatorioRegex(message);

        if (analisisRegex && analisisRegex.esRecordatorio) {
            const recordatorios = cargarRecordatorios();

            const nuevo = {
                id: "rec_" + Math.random().toString(36).slice(2, 8),
                titulo: analisisRegex.titulo,
                fecha: analisisRegex.fecha || new Date().toISOString(),
                completado: false
            };

            recordatorios.push(nuevo);
            guardarRecordatorios(recordatorios);

            return res.json({
                answer: `✨ Recordatorio guardado:\n• ${nuevo.titulo}\n📅 ${nuevo.fecha}`
            });
        }

        // 🔹 2. Si NO se detecta con regex → usar embedding para ver si ya respondimos eso
        let historial = cargarHistorial();
        const embeddingUser = await generarEmbedding(message);

        const { mejorSimilitud, mejorMensaje } = buscarRespuestaSimilar(historial, embeddingUser);

        if (mejorSimilitud > 0.63 && mejorMensaje.role === "bot") {
            console.log("USANDO RESPUESTA GUARDADA (NO GASTA TOKENS)");
            return res.json({ answer: mejorMensaje.content });
        }

        // 🔹 3. Guardar mensaje usuario
        historial.push({
            id: "msg_" + Math.random().toString(36).slice(2, 8),
            role: "user",
            content: message,
            embedding: embeddingUser
        });

        // 🔹 4. Últimos 10 mensajes
        const ultimos10 = historial.slice(-10).map(m => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: m.content
        }));

        // 🔹 5. Llamar IA (si no hay coincidencia previa)
        const respuesta = await chatOpenAI([
            { role: "system", content: "Respuestas breves estilo WhatsApp. Usa saltos de línea reales." },
            ...ultimos10,
            { role: "user", content: message }
        ]);

        const embeddingBot = await generarEmbedding(respuesta);

        historial.push({
            id: "msg_" + Math.random().toString(36).slice(2, 8),
            role: "bot",
            content: respuesta,
            embedding: embeddingBot
        });

        guardarHistorial(historial);

        res.json({ answer: respuesta });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error con OpenAI" });
    }
}

function obtenerHistorialChat(req, res) {
    const historial = cargarHistorial();

    // Solo últimos 10
    const ultimos10 = historial.slice(-10);

    res.json(ultimos10);
}


module.exports = { procesarChat, obtenerHistorialChat };
