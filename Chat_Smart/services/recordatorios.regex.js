// poner fecha normal
function formatearFechaBonita(fecha) {
    let dia = fecha.getDate().toString().padStart(2, "0");
    let mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    let anio = fecha.getFullYear();

    let horas = fecha.getHours();
    let minutos = fecha.getMinutes().toString().padStart(2, "0");

    let ampm = horas >= 12 ? "PM" : "AM";
    horas = horas % 12;
    if (horas === 0) horas = 12;

    return `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
}
// poner fecha normal
function formatearFechaBonita(fecha) {
    let dia = fecha.getDate().toString().padStart(2, "0");
    let mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    let anio = fecha.getFullYear();

    let horas = fecha.getHours();
    let minutos = fecha.getMinutes().toString().padStart(2, "0");

    let ampm = horas >= 12 ? "PM" : "AM";
    horas = horas % 12;
    if (horas === 0) horas = 12;

    return `${dia}/${mes}/${anio} ${horas}:${minutos} ${ampm}`;
}

// Detectar si el mensaje es un recordatorio usando regex
function detectarRecordatorioRegex(texto) {
    const textoLimpio = texto.toLowerCase();

    // Detecta intención
    const esRecordatorio =
        textoLimpio.includes("recuérdame") ||
        textoLimpio.includes("recuerdame") ||
        textoLimpio.includes("recordatorio") ||
        textoLimpio.includes("alarma") ||
        textoLimpio.includes("recordame") ||
        textoLimpio.includes("recuerda");

    if (!esRecordatorio) return null;

    // Detectar fecha simple
    let fechaDetectada = null;
    let fechaObjeto = null;

    // mañana, hoy, pasado
    if (textoLimpio.includes("mañana")) {
        fechaObjeto = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else if (textoLimpio.includes("hoy")) {
        fechaObjeto = new Date();
    } else {
        // Detectar días de la semana
        const diasSemana = {
            'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3,
            'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 0
        };

        for (const [dia, valorDia] of Object.entries(diasSemana)) {
            if (textoLimpio.includes(dia)) {
                const hoy = new Date();
                const diaActual = hoy.getDay();
                let diasSumar = (valorDia - diaActual + 7) % 7;
                if (diasSumar === 0) diasSumar = 7; // Si es el mismo día, poner para la próxima semana
                fechaObjeto = new Date(hoy.getTime() + diasSumar * 24 * 60 * 60 * 1000);
                break;
            }
        }
    }

    // detectar hora "3pm", "3 pm", "15:00"
    const horaRegex = /(\d{1,2})([:.]?(\d{2}))?\s?(am|pm)?/i;
    const coincidenciaHora = texto.match(horaRegex);

    if (coincidenciaHora) {
        // Si ya tenemos una fecha base (de día de semana, hoy, mañana), usarla, sino usar hoy
        const fechaBase = fechaObjeto || new Date();
        let hora = parseInt(coincidenciaHora[1]);
        const minutos = coincidenciaHora[3] ? parseInt(coincidenciaHora[3]) : 0;
        const ampm = coincidenciaHora[4];

        if (ampm) {
            if (ampm.toLowerCase() === "pm" && hora < 12) hora += 12;
            if (ampm.toLowerCase() === "am" && hora === 12) hora = 0;
        }

        fechaBase.setHours(hora);
        fechaBase.setMinutes(minutos);
        fechaBase.setSeconds(0);
        fechaBase.setMilliseconds(0);
        fechaObjeto = fechaBase;
    }

    // Si tenemos un objeto fecha, formatearlo bonito
    if (fechaObjeto) {
        fechaDetectada = formatearFechaBonita(fechaObjeto);
    }

    // Título: quitar palabras de intención
    const titulo = texto;

    return {
        esRecordatorio: true,
        titulo: titulo || "Recordatorio",
        fecha: fechaDetectada
    };
}

module.exports = { detectarRecordatorioRegex };