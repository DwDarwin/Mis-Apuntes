const progresoTotal = document.getElementById("progreso-total");
const progresoCompletadas = document.getElementById("progreso-completadas");
const progresoPendientes = document.getElementById("progreso-pendientes");
const progresoVencidas = document.getElementById("progreso-vencidas");

const progresoPorcentaje = document.getElementById("progreso-porcentaje");
const barraProgreso = document.getElementById("barra-progreso");
const barraProgresoValor = document.getElementById("barra-progreso-valor");
const mensajeProgreso = document.getElementById("mensaje-progreso");

const listaProgresoMaterias = document.getElementById(
    "lista-progreso-materias"
);


function obtenerFechaActualProgreso() {
    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


function estaVencida(actividad) {
    return (
        actividad.estado !== "COMPLETADA" &&
        /^\d{4}-\d{2}-\d{2}$/.test(actividad.fechaEntrega) &&
        actividad.fechaEntrega < obtenerFechaActualProgreso()
    );
}


function actualizarProgreso() {
    const actividades = window.actividades || [];

    const total = actividades.length;

    const completadas = actividades.filter(function (actividad) {
        return actividad.estado === "COMPLETADA";
    }).length;

    const pendientes = actividades.filter(function (actividad) {
        return actividad.estado !== "COMPLETADA";
    }).length;

    const vencidas = actividades.filter(estaVencida).length;

    const porcentaje = total > 0
        ? Math.round((completadas / total) * 100)
        : 0;

    progresoTotal.textContent = total;
    progresoCompletadas.textContent = completadas;
    progresoPendientes.textContent = pendientes;
    progresoVencidas.textContent = vencidas;

    progresoPorcentaje.textContent = `${porcentaje}%`;

    barraProgresoValor.style.width = `${porcentaje}%`;
    barraProgreso.setAttribute("aria-valuenow", porcentaje);

    if (total === 0) {
        mensajeProgreso.textContent =
            "Tus actividades aparecerán aquí cuando las registres.";
    } else if (porcentaje === 100) {
        mensajeProgreso.textContent =
            "¡Excelente! Has completado todas tus actividades.";
    } else {
        mensajeProgreso.textContent =
            `Has completado ${completadas} de ${total} actividades.`;
    }

    renderizarProgresoMaterias(actividades);
}


function renderizarProgresoMaterias(actividades) {
    listaProgresoMaterias.replaceChildren();

    // Agrupar actividades por el nombre de su materia.
    const materiasAgrupadas = new Map();

    actividades.forEach(function (actividad) {
        const nombreMateria = actividad.materia.trim() || "Sin materia";

        if (!materiasAgrupadas.has(nombreMateria)) {
            materiasAgrupadas.set(nombreMateria, {
                total: 0,
                completadas: 0
            });
        }

        const resumen = materiasAgrupadas.get(nombreMateria);

        resumen.total++;

        if (actividad.estado === "COMPLETADA") {
            resumen.completadas++;
        }
    });

    if (materiasAgrupadas.size === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "estado-vacio-progreso";
        mensaje.textContent =
            "Aún no hay actividades para mostrar.";

        listaProgresoMaterias.appendChild(mensaje);
        return;
    }

    materiasAgrupadas.forEach(function (resumen, nombreMateria) {
        const porcentaje = Math.round(
            (resumen.completadas / resumen.total) * 100
        );

        const tarjeta = document.createElement("article");
        tarjeta.className = "fila-progreso-materia";

        const cabecera = document.createElement("div");
        cabecera.className = "fila-progreso-cabecera";

        const nombre = document.createElement("h4");
        nombre.textContent = nombreMateria;

        const porcentajeTexto = document.createElement("span");
        porcentajeTexto.textContent = `${porcentaje}%`;

        cabecera.append(nombre, porcentajeTexto);

        const barra = document.createElement("div");
        barra.className = "barra-progreso barra-progreso-materia";
        barra.setAttribute("role", "progressbar");
        barra.setAttribute("aria-valuemin", "0");
        barra.setAttribute("aria-valuemax", "100");
        barra.setAttribute("aria-valuenow", porcentaje);
        barra.setAttribute(
            "aria-label",
            `Progreso de ${nombreMateria}`
        );

        const valor = document.createElement("div");
        valor.className = "barra-progreso-valor";
        valor.style.width = `${porcentaje}%`;

        barra.appendChild(valor);

        const detalle = document.createElement("p");
        detalle.textContent =
            `${resumen.completadas} de ${resumen.total} actividades completadas`;

        tarjeta.append(cabecera, barra, detalle);
        listaProgresoMaterias.appendChild(tarjeta);
    });
}


window.addEventListener("actividadesActualizadas", actualizarProgreso);

actualizarProgreso();



