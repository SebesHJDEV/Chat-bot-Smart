// app.js
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
cargarHistorialChat();

// Auto-resize del textarea
userInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
});

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = type === "user" ? "msg-user" : "msg-bot";

  const clean = text
    .replace(/&lt;br\/&gt;/g, "<br>")
    .replace(/&lt;br&gt;/g, "<br>")
    .replace(/<br\/>/g, "<br>")
    .replace(/\r\n/g, "<br>")
    .replace(/\n/g, "<br>")
    .replace(/\r/g, "<br>");

  div.innerHTML = clean;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "typing-indicator";
  typingDiv.innerHTML = `
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  typingDiv.id = "typing-indicator";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// 🚀 Enviar mensaje al servidor
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Mensaje del usuario
  addMessage(text, "user");
  userInput.value = "";
  userInput.style.height = 'auto';

  // Mostrar indicador de typing
  showTypingIndicator();

  try {
    const res = await fetch("/chat/OpenAI", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    
    hideTypingIndicator();

    // SIEMPRE cargar recordatorios después de cada mensaje
    await cargarRecordatorios();
    
    addMessage(data.answer, "bot");
  } catch (error) {
    hideTypingIndicator();
    addMessage("⚠ Error al conectar con el servidor.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);

// Enviar con Enter (Shift+Enter para nueva línea)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Recordatorios
const recordatoriosBox = document.getElementById("recordatorios-box");

function renderRecordatorioCard(rec) {
  const col = document.createElement("div");
  col.className = "col-12";

  const card = document.createElement("div");
  card.className = `recordatorio-card ${rec.completado ? 'completado' : ''}`;
  card.id = rec.id;

  card.innerHTML = `
    <div class="recordatorio-titulo">
      <i class="fas fa-bell me-2"></i>${rec.titulo}
    </div>
    <div class="recordatorio-fecha">
      <i class="fas fa-clock me-2"></i>${rec.fecha}
    </div>
    <div class="d-grid gap-2">
      <button class="btn btn-completar completar-btn">
        <i class="fas ${rec.completado ? 'fa-check-circle' : 'fa-check'} me-2"></i>
        ${rec.completado ? "Completado" : "Marcar como completado"}
      </button>
      <button class="btn btn-eliminar eliminar-btn">
        <i class="fas fa-trash me-2"></i>Eliminar
      </button>
    </div>
  `;

  // Botón completar
  card.querySelector(".completar-btn").addEventListener("click", async () => {
    rec.completado = !rec.completado;
    
    await fetch(`/recordatorios/${rec.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completado: rec.completado })
    });
    
    // Recargar para actualizar visualmente y reordenar
    await cargarRecordatorios();
  });

  // Botón eliminar
  card.querySelector(".eliminar-btn").addEventListener("click", async () => {
    await fetch(`/recordatorios/${rec.id}`, { method: "DELETE" });
    // Recargar para actualizar visualmente
    await cargarRecordatorios();
  });

  col.appendChild(card);
  return col; // Devolvemos el elemento para poder ordenarlo
}

// Función para ordenar recordatorios (activos primero, completados al final)
function ordenarRecordatorios(recordatorios) {
  return recordatorios.sort((a, b) => {
    // Si ambos están completados o ambos activos, mantener orden original
    if (a.completado === b.completado) {
      return new Date(a.fecha) - new Date(b.fecha); // Ordenar por fecha
    }
    // Activos primero (false va antes que true)
    return a.completado ? 1 : -1;
  });
}

// Cargar los recordatorios
async function cargarRecordatorios() {
  try {
    const res = await fetch("/recordatorios");
    const lista = await res.json();

    recordatoriosBox.innerHTML = "";

    if (lista.length === 0) {
      recordatoriosBox.innerHTML = `
        <div class="col-12 text-center text-muted py-4">
          <i class="fas fa-bell-slash fa-2x mb-3"></i>
          <p>No hay recordatorios activos</p>
        </div>
      `;
    } else {
      // Ordenar recordatorios: activos primero, completados al final
      const recordatoriosOrdenados = ordenarRecordatorios(lista);
      
      recordatoriosOrdenados.forEach(r => {
        const cardElement = renderRecordatorioCard(r);
        recordatoriosBox.appendChild(cardElement);
      });

      // Opcional: agregar separador visual entre activos y completados
      agregarSeparadorSiEsNecesario(recordatoriosOrdenados);
    }
  } catch (error) {
    console.error("Error cargando recordatorios:", error);
    recordatoriosBox.innerHTML = `
      <div class="col-12 text-center text-danger py-4">
        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
        <p>Error al cargar recordatorios</p>
      </div>
    `;
  }
}

// Función opcional para agregar un separador entre activos y completados
function agregarSeparadorSiEsNecesario(recordatorios) {
  const tieneActivos = recordatorios.some(r => !r.completado);
  const tieneCompletados = recordatorios.some(r => r.completado);
  
  if (tieneActivos && tieneCompletados) {
    // Encontrar el índice del primer recordatorio completado
    const primerCompletadoIndex = recordatorios.findIndex(r => r.completado);
    
    // Crear separador
    const separador = document.createElement("div");
    separador.className = "col-12";
    separador.innerHTML = `
      <div class="separador-recordatorios">
        <hr>
        <span class="text-muted small">Completados</span>
      </div>
    `;
    
    // Insertar separador antes del primer recordatorio completado
    const cards = recordatoriosBox.querySelectorAll('.col-12');
    if (cards[primerCompletadoIndex]) {
      recordatoriosBox.insertBefore(separador, cards[primerCompletadoIndex]);
    }
  }
}

async function cargarHistorialChat() {
    try {
        const res = await fetch("/chat/historial");
        const mensajes = await res.json();

        mensajes.forEach(m => {
            addMessage(m.content, m.role === "bot" ? "bot" : "user");
        });
    } catch (err) {
        console.error("Error cargando historial:", err);
    }
}

// Cargar al inicio
document.addEventListener('DOMContentLoaded', function() {
  cargarRecordatorios();
});