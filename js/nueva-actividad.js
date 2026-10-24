
import {
    actividadPrueba

} from "./temporal.js";

const formulario = document.getElementById("formulario-actividad");
const listaActividades = document.getElementById("lista-actividades");
const estadoVacio = document.querySelector(".estado-vacio");
const modalElemento = document.getElementById("modalActividad");

const modalActividad = bootstrap.Modal.getOrCreateInstance(modalElemento);

/*deshabilitado temporal*/
/*
const actividades = [];
*/





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



/*datos temporales tres constantes*/

const actividades = actividadPrueba.map(actividad => ({
    ...actividad
}));

window.actividades = actividades;   //conexion con arreglo en actividades.js//

const taskManager = new TaskManager(actividades);
window.taskManager = taskManager;

window.dispatchEvent(
    new CustomEvent("actividadesActualizadas")
);

/* deshabilitado por pruebas
window.actividades = actividades;   //conexion con arreglo en actividades.js//

const taskManager = new TaskManager(actividades);

window.taskManager = taskManager;

*/


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

    modalActividad.hide();
});


function renderizarActividades() {
    listaActividades.replaceChildren();

    estadoVacio.hidden = actividades.length > 0;

    actividades.forEach(function (actividad) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "actividad-item";

        const titulo = document.createElement("h3");
        titulo.textContent = actividad.nombre;
        tarjeta.appendChild(titulo);

        if (actividad.descripcion) {
            const descripcion = document.createElement("p");
            descripcion.textContent = actividad.descripcion;
            tarjeta.appendChild(descripcion);
        }

        const detalles = document.createElement("div");
        detalles.className = "detalle-actividad";

        const materia = document.createElement("span");
        materia.className = "etiqueta-actividad";
        materia.textContent = `Materia: ${actividad.materia || "Sin especificar"}`;
        detalles.appendChild(materia);

        const fecha = document.createElement("span");
        fecha.textContent = `Entrega: ${actividad.fechaEntrega}`;
        detalles.appendChild(fecha);

        if (actividad.asignadoA) {
            const responsable = document.createElement("span");
            responsable.textContent = `Responsable: ${actividad.asignadoA}`;
            detalles.appendChild(responsable);
        }

        const estado = document.createElement("span");
        estado.className = "etiqueta-actividad";

        if (actividad.estado === "COMPLETADA") {
            estado.classList.add("etiqueta-completada");
        }

        estado.textContent = `Estado: ${formatearValor(actividad.estado)}`;
        detalles.appendChild(estado);

        const prioridad = document.createElement("span");
        prioridad.className = "etiqueta-actividad";

        if (actividad.prioridad === "ALTA") {
            prioridad.classList.add("etiqueta-alta");
        }

        prioridad.textContent = `Prioridad: ${formatearValor(actividad.prioridad)}`;
        detalles.appendChild(prioridad);


        tarjeta.appendChild(detalles);

        // Botón para eliminar la tarea
        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.className = "boton-eliminar";

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

        tarjeta.appendChild(botonEliminar);
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