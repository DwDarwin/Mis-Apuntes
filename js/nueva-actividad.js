import { apiRequest } from "./api.js";
const formulario = document.getElementById("formulario-actividad");
const listaActividades = document.getElementById("lista-actividades");
const estadoVacio = document.querySelector(".estado-vacio");
const modalElemento = document.getElementById("modalActividad");

const modalActividad = bootstrap.Modal.getOrCreateInstance(modalElemento);



let actividades = [];

window.actividades = actividades;

async function cargarActividades() {
    try {
        const respuesta = await apiRequest("/actividades");

        actividades = respuesta.map(adaptarActividad);


        window.actividades = actividades;

        // Actualizar los datos del TaskManager
        taskManager.actividades = actividades;

        renderizarActividades();
        actualizarResumen();

        window.dispatchEvent(
            new CustomEvent("actividadesActualizadas")
        );

    } catch (error) {
        console.error("Error al cargar las actividades:", error);
        alert("No fue posible cargar las actividades.");
    }
}

function adaptarActividad(actividad) {
    return {
        ...actividad,
        materia: actividad.materiaNombre || "",
        materiaId: actividad.materiaId
    };
}



class TaskManager {

    constructor(actividades) {
        this.actividades = actividades;

        this.contadorId = actividades.reduce(
            (mayorId, actividad) => Math.max(mayorId, actividad.id || 0),
            0
        );
    }


    async addTask(actividad) {
        const respuesta = await apiRequest("/actividades", {
            method: "POST",
            body: JSON.stringify(actividad)
        });

        const nuevaActividad = adaptarActividad(respuesta);

        this.actividades.push(nuevaActividad);

        return nuevaActividad;
    }


    getTasks() {
        return this.actividades;
    }



    findActivityById(id) {

        let actividadEncontrada;

        for (const actividad of this.actividades) {
            if (actividad.id === Number(id)) {
                actividadEncontrada = actividad;
                break;
            }
        }

        return actividadEncontrada;
    }

    async updateTask(id, cambios) {

        const actividad = this.findActivityById(id);

        if (!actividad) {
            throw new Error("No se encontró la actividad.");
        }

        const actividadActualizada = {
            nombre: actividad.nombre,
            descripcion: actividad.descripcion,
            asignadoA: actividad.asignadoA,
            fechaEntrega: actividad.fechaEntrega,
            estado: cambios.estado ?? actividad.estado,
            prioridad: actividad.prioridad,
            materiaId: actividad.materiaId
        };

        const respuesta = await apiRequest(`/actividades/${id}`, {
            method: "PUT",
            body: JSON.stringify(actividadActualizada)
        });

        Object.assign(actividad, adaptarActividad(respuesta));

        return actividad;
    }



    async deleteTask(id) {
        try {
            await apiRequest(`/actividades/${id}`, {
                method: "DELETE"
            });

            const indice = this.actividades.findIndex(
                actividad => actividad.id === Number(id)
            );

            if (indice !== -1) {
                this.actividades.splice(indice, 1);
            }

            return true;

        } catch (error) {
            console.error("Error al eliminar la actividad:", error);
            throw error;
        }
    }
}


window.actividades = actividades;   //conexion con arreglo en actividades.js//

const taskManager = new TaskManager(actividades);

window.taskManager = taskManager;

// Modal para confirmar la eliminación de actividades
const modalConfirmarElemento = document.getElementById(
    "modalConfirmarEliminacion"
);

const modalConfirmarEliminacion = bootstrap.Modal.getOrCreateInstance(
    modalConfirmarElemento
);

const nombreActividadEliminar = document.getElementById(
    "nombreActividadEliminar"
);

const botonConfirmarEliminar = document.getElementById(
    "confirmarEliminarActividad"
);

let actividadPendienteEliminar = null;

window.solicitarConfirmacionEliminacion = function (actividad) {
    actividadPendienteEliminar = actividad;

    nombreActividadEliminar.textContent = actividad.nombre;

    modalConfirmarEliminacion.show();
};
botonConfirmarEliminar.addEventListener("click", async function () {

    if (!actividadPendienteEliminar) return;

    try {
        const eliminado = await window.taskManager.deleteTask(
            actividadPendienteEliminar.id
        );

        if (eliminado) {
            window.actualizarVistasActividad();
        }

        actividadPendienteEliminar = null;
        modalConfirmarEliminacion.hide();

    } catch (error) {
        alert(error.message || "No fue posible eliminar la actividad.");
    }
});

modalConfirmarElemento.addEventListener("hidden.bs.modal", function () {
    actividadPendienteEliminar = null;
});

const campoFecha = document.getElementById("fechaEntrega");


function obtenerFechaLocal() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}
function obtenerActividadesDeHoy() {
    const fechaActual = obtenerFechaLocal();

    return actividades.filter(function (actividad) {
        return actividad.fechaEntrega === fechaActual;
    });
}

campoFecha.min = obtenerFechaLocal();


function limpiarErroresActividad() {
    formulario.querySelectorAll(".field-error").forEach((elemento) => {
        elemento.textContent = "";
    });

    formulario.querySelectorAll(".form-control, .form-select").forEach((campo) => {
        campo.classList.remove("is-invalid");
        campo.removeAttribute("aria-invalid");
    });
}


function mostrarErrorActividad(inputId, mensaje) {
    const campo = document.getElementById(inputId);
    const error = document.getElementById(`${inputId}-error`);

    if (campo) {
        campo.classList.add("is-invalid");
        campo.setAttribute("aria-invalid", "true");
    }

    if (error) {
        error.textContent = mensaje;
    }
}


function validateTaskForm() {
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const materia = document.getElementById("materia").value;
    const asignadoA = document.getElementById("asignadoA").value.trim();
    const fechaEntrega = campoFecha.value.trim();

    let formularioValido = true;

    if (nombre.length <= 8) {
        mostrarErrorActividad("nombre", "El nombre debe tener más de 8 caracteres.");
        formularioValido = false;
    }

    if (descripcion.length <= 15) {
        mostrarErrorActividad("descripcion", "La descripción debe tener más de 15 caracteres.");
        formularioValido = false;
    }

    if (!materia) {
        mostrarErrorActividad("materia", "Debes seleccionar una materia.");
        formularioValido = false;
    }

    if (asignadoA.length <= 8) {
        mostrarErrorActividad("asignadoA", "El responsable debe tener más de 8 caracteres.");
        formularioValido = false;
    }

    if (!fechaEntrega) {
        mostrarErrorActividad("fechaEntrega", "Debes seleccionar una fecha de entrega.");
        formularioValido = false;
    }

    return formularioValido;
}
const camposActividad = [
    "nombre",
    "descripcion",
    "materia",
    "asignadoA",
    "fechaEntrega"
];

camposActividad.forEach((id) => {
    const campo = document.getElementById(id);

    campo.addEventListener("input", function () {
        campo.classList.remove("is-invalid");
        campo.removeAttribute("aria-invalid");

        const error = document.getElementById(`${id}-error`);

        if (error) {
            error.textContent = "";
        }
    });

    campo.addEventListener("change", function () {
        campo.classList.remove("is-invalid");
        campo.removeAttribute("aria-invalid");

        const error = document.getElementById(`${id}-error`);

        if (error) {
            error.textContent = "";
        }
    });
});


// Registrar una actividad
formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    limpiarErroresActividad();

    if (!validateTaskForm()) {
        return;
    }

    const actividad = {
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        materiaId: Number(document.getElementById("materia").value),
        asignadoA: document.getElementById("asignadoA").value.trim(),
        fechaEntrega: campoFecha.value,
        estado: "PENDIENTE",
        prioridad: document.getElementById("prioridad").value
    };

    if (!actividad.nombre) {
        document.getElementById("nombre").focus();
        return;
    }

    try {
        await taskManager.addTask(actividad);

        renderizarActividades();
        actualizarResumen();

        window.dispatchEvent(
            new CustomEvent("actividadesActualizadas")
        );

    } catch (error) {
        console.error("Error al crear la actividad:", error);
        alert(error.message || "No fue posible crear la actividad.");
        return;
    }

    const botonCerrar = modalElemento.querySelector(
        '[data-bs-dismiss="modal"]'
    );

    if (botonCerrar) {
        botonCerrar.click();
    }
});



function renderizarActividades() {
    listaActividades.replaceChildren();

    const actividadesDeHoy = obtenerActividadesDeHoy();

    estadoVacio.hidden = actividadesDeHoy.length > 0;

    actividadesDeHoy.forEach(function (actividad) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-listado-actividad";
        tarjeta.dataset.actividadId = actividad.id;


        const titulo = document.createElement("h3");
        titulo.textContent = actividad.nombre;
        tarjeta.appendChild(titulo);


        if (actividad.descripcion) {
            const descripcion = document.createElement("p");
            descripcion.textContent = actividad.descripcion;
            tarjeta.appendChild(descripcion);
        }


        const detalles = document.createElement("div");
        detalles.className = "detalles-listado-actividad";


        const materia = document.createElement("span");
        materia.className = "etiqueta-listado";
        materia.textContent =
            `Materia: ${actividad.materia || "Sin especificar"}`;
        detalles.appendChild(materia);


        const fecha = document.createElement("span");
        fecha.className = "etiqueta-listado";
        fecha.textContent = `Entrega: ${actividad.fechaEntrega}`;
        detalles.appendChild(fecha);


        if (actividad.asignadoA) {
            const responsable = document.createElement("span");
            responsable.className = "etiqueta-listado";
            responsable.textContent =
                `Responsable: ${actividad.asignadoA}`;
            detalles.appendChild(responsable);
        }



        const contenedorEstado = document.createElement("div");
        contenedorEstado.className = "campo-estado-actividad";

        const etiquetaEstado = document.createElement("label");
        etiquetaEstado.textContent = "Estado:";
        etiquetaEstado.className = "form-label";

        const selectorEstado = document.createElement("select");
        selectorEstado.className = "form-select selector-estado-actividad";

        const estados = [
            { valor: "PENDIENTE", texto: "Pendiente" },
            { valor: "EN_PROGRESO", texto: "En progreso" },
            { valor: "COMPLETADA", texto: "Completada" }
        ];

        estados.forEach(function (estado) {
            const opcion = document.createElement("option");
            opcion.value = estado.valor;
            opcion.textContent = estado.texto;
            selectorEstado.appendChild(opcion);
        });

        selectorEstado.value = actividad.estado;

        actualizarColorEstado(selectorEstado);

        // Bloquear si la actividad ya está completada
        selectorEstado.disabled = actividad.estado === "COMPLETADA";


        contenedorEstado.appendChild(etiquetaEstado);
        contenedorEstado.appendChild(selectorEstado);


        const prioridad = document.createElement("span");
        prioridad.className = "etiqueta-listado";

        if (actividad.prioridad === "ALTA") {
            prioridad.classList.add("etiqueta-prioridad-alta");
        }

        prioridad.textContent =
            `Prioridad: ${formatearValor(actividad.prioridad)}`;

        detalles.appendChild(prioridad);


        tarjeta.appendChild(detalles);


        const acciones = document.createElement("div");
        acciones.className = "acciones-listado-actividad";


        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.className = "boton-eliminar btn-eliminar";

        botonEliminar.addEventListener("click", function () {
            window.solicitarConfirmacionEliminacion(actividad);
        });
        acciones.appendChild(botonEliminar);

        // Fila inferior: estado y botón eliminar
        const filaAcciones = document.createElement("div");
        filaAcciones.className = "fila-acciones-actividad";

        filaAcciones.appendChild(contenedorEstado);
        filaAcciones.appendChild(acciones);

        tarjeta.appendChild(filaAcciones);

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
function actualizarColorEstado(selector) {
    selector.classList.remove(
        "estado-pendiente",
        "estado-progreso",
        "estado-completado"
    );

    if (selector.value === "COMPLETADA") {
        selector.classList.add("estado-completado");
    } else if (selector.value === "EN_PROGRESO") {
        selector.classList.add("estado-progreso");
    } else {
        selector.classList.add("estado-pendiente");
    }
}

window.actualizarColorEstado = actualizarColorEstado;


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


document.addEventListener("DOMContentLoaded", function () {
    cargarActividades();
});


window.renderizarActividades = renderizarActividades;
window.actualizarResumen = actualizarResumen;
window.formatearValor = formatearValor;


window.actualizarVistasActividad = function () {

    renderizarActividades();
    actualizarResumen();

    window.dispatchEvent(
        new CustomEvent("actividadesActualizadas")
    );
};

// Delegación de eventos para cambiar el estado
listaActividades.addEventListener("change", async function (event) {

    if (event.target.classList.contains("selector-estado-actividad")) {

        const selector = event.target;

        const tarjeta = selector.closest(".tarjeta-listado-actividad");
        if (!tarjeta) return;

        const idActividad = Number(tarjeta.dataset.actividadId);

        const actividad = window.taskManager.findActivityById(idActividad);
        if (!actividad) return;

        if (actividad.estado === "COMPLETADA") {
            selector.value = "COMPLETADA";
            selector.disabled = true;
            return;
        }

        const estadoAnterior = actividad.estado;
        const nuevoEstado = selector.value;

        // Evitar cambios mientras se guarda
        selector.disabled = true;

        try {

            await window.taskManager.updateTask(idActividad, {
                estado: nuevoEstado
            });

            actualizarColorEstado(selector);

            window.actualizarVistasActividad();

        } catch (error) {

            console.error("Error al actualizar el estado:", error);

            selector.value = estadoAnterior;

            alert(error.message || "No fue posible actualizar el estado.");

        } finally {

            selector.disabled = false;
        }
    }
});

