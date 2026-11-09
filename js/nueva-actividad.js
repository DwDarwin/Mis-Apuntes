const formulario = document.getElementById("formulario-actividad");
const listaActividades = document.getElementById("lista-actividades");
const estadoVacio = document.querySelector(".estado-vacio");
const modalElemento = document.getElementById("modalActividad");

const modalActividad = bootstrap.Modal.getOrCreateInstance(modalElemento);

/*deshabilitado temporal*/

const actividades = [];

class TaskManager {
    constructor(actividades) {
        this.actividades = actividades;
        this.contadorId = actividades.reduce(
            (mayorId, actividad) => Math.max(mayorId, actividad.id || 0),
            0
        );
    }

    addTask(actividad) {
        this.contadorId++;
        actividad.id = this.contadorId;
        this.actividades.push(actividad);
    }

    getTasks() {
        return this.actividades;
    }

    deleteTask(id) {
        const indice = this.actividades.findIndex(
            actividad => actividad.id === id
        );

        if (indice === -1) {
            return false;
        }

        this.actividades.splice(indice, 1);
        return true;
    }
}


window.actividades = actividades;   //conexion con arreglo en actividades.js//

const taskManager = new TaskManager(actividades);

window.taskManager = taskManager;

const campoFecha = document.getElementById("fechaEntrega");


function obtenerFechaLocal() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

campoFecha.min = obtenerFechaLocal();


function validateTaskForm() {
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const asignadoA = document.getElementById("asignadoA").value.trim();
    const estado = document.getElementById("estado").value;
    const fechaEntrega = campoFecha.value.trim();

    return (
        nombre.length > 8 &&
        descripcion.length > 15 &&
        asignadoA.length > 8 &&
        estado.trim() !== "" &&
        fechaEntrega !== ""
    );
}


// Registrar una actividad
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!formulario.reportValidity() || !validateTaskForm()) {
        window.alert(
            "Nombre y Responsable deben tener más de 8 caracteres, " +
            "Descripción debe tener más de 15 caracteres "

        );
        return;
    }

    const actividad = {
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        materia: document.getElementById("materia").value.trim(),
        asignadoA: document.getElementById("asignadoA").value.trim(),
        fechaEntrega: campoFecha.value,
        estado: document.getElementById("estado").value,
        prioridad: document.getElementById("prioridad").value
    };

    if (!actividad.nombre) {
        document.getElementById("nombre").focus();
        return;
    }

    taskManager.addTask(actividad);

    renderizarActividades();
    actualizarResumen();

    window.dispatchEvent(new CustomEvent("actividadesActualizadas"));

    formulario.reset();
    campoFecha.min = obtenerFechaLocal();

    const botonCerrar = modalElemento.querySelector(
        '[data-bs-dismiss="modal"]'
    );

    if (botonCerrar) {
        botonCerrar.click();
    }
});



function renderizarActividades() {
    listaActividades.replaceChildren();

    estadoVacio.hidden = actividades.length > 0;

    actividades.forEach(function (actividad) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-listado-actividad";

        // Título
        const titulo = document.createElement("h3");
        titulo.textContent = actividad.nombre;
        tarjeta.appendChild(titulo);

        // Descripción
        if (actividad.descripcion) {
            const descripcion = document.createElement("p");
            descripcion.textContent = actividad.descripcion;
            tarjeta.appendChild(descripcion);
        }

        // Contenedor de detalles
        const detalles = document.createElement("div");
        detalles.className = "detalles-listado-actividad";

        // Materia
        const materia = document.createElement("span");
        materia.className = "etiqueta-listado";
        materia.textContent =
            `Materia: ${actividad.materia || "Sin especificar"}`;
        detalles.appendChild(materia);

        // Fecha
        const fecha = document.createElement("span");
        fecha.className = "etiqueta-listado";
        fecha.textContent = `Entrega: ${actividad.fechaEntrega}`;
        detalles.appendChild(fecha);

        // Responsable
        if (actividad.asignadoA) {
            const responsable = document.createElement("span");
            responsable.className = "etiqueta-listado";
            responsable.textContent =
                `Responsable: ${actividad.asignadoA}`;
            detalles.appendChild(responsable);
        }

        // Estado
        const estado = document.createElement("span");
        estado.className = "etiqueta-listado";

        if (actividad.estado === "COMPLETADA") {
            estado.classList.add("etiqueta-estado-completada");
        }

        estado.textContent =
            `Estado: ${formatearValor(actividad.estado)}`;

        detalles.appendChild(estado);

        // Prioridad
        const prioridad = document.createElement("span");
        prioridad.className = "etiqueta-listado";

        if (actividad.prioridad === "ALTA") {
            prioridad.classList.add("etiqueta-prioridad-alta");
        }

        prioridad.textContent =
            `Prioridad: ${formatearValor(actividad.prioridad)}`;

        detalles.appendChild(prioridad);

        tarjeta.appendChild(detalles);

        // Contenedor de botones
        const acciones = document.createElement("div");
        acciones.className = "acciones-listado-actividad";

        // Eliminar actividad
        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.className = "boton-eliminar btn-eliminar";

        botonEliminar.addEventListener("click", function () {
            const eliminado = taskManager.deleteTask(actividad.id);

            if (eliminado) {
                renderizarActividades();
                actualizarResumen();

                window.dispatchEvent(
                    new CustomEvent("actividadesActualizadas")
                );
            }
        });

        acciones.appendChild(botonEliminar);
        tarjeta.appendChild(acciones);

        listaActividades.appendChild(tarjeta);
    });
}



function formatearValor(valor) {
    const etiquetas = {
        PENDIENTE: "Pendiente",
        EN_PROGRESO: "En progreso",
        COMPLETADA: "Completada",
        BAJA: "Baja",
        MEDIA: "Media",
        ALTA: "Alta"
    };

    return etiquetas[valor] || valor;
}


function actualizarResumen() {
    const total = actividades.length;

    const completadas = actividades.filter(function (actividad) {
        return actividad.estado === "COMPLETADA";
    }).length;

    const prioridadAlta = actividades.filter(function (actividad) {
        return actividad.prioridad === "ALTA"
            && actividad.estado !== "COMPLETADA";
    }).length;

    const contadores = document.querySelectorAll(".tarjeta-resumen h3");

    if (contadores.length >= 3) {
        contadores[0].textContent = total;
        contadores[1].textContent = completadas;
        contadores[2].textContent = prioridadAlta;
    }
}

// Mostrar las actividades al iniciar la sección
document.addEventListener("DOMContentLoaded", function () {
    renderizarActividades();
    actualizarResumen();
});

// Compartir funciones con los demás módulos
window.renderizarActividades = renderizarActividades;
window.actualizarResumen = actualizarResumen;
window.formatearValor = formatearValor;