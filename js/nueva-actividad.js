const formulario = document.getElementById("formulario-actividad");
const listaActividades = document.getElementById("lista-actividades");
const estadoVacio = document.querySelector(".estado-vacio");
const modalElemento = document.getElementById("modalActividad");

const modalActividad = bootstrap.Modal.getOrCreateInstance(modalElemento);


//const actividades = [];

// Clave para almacenar las actividades en localStorage
const CLAVE_ACTIVIDADES = "actividades";


function cargarActividades() {
    const datosGuardados = localStorage.getItem(CLAVE_ACTIVIDADES);

    if (!datosGuardados) {
        return [];
    }

    try {
        const actividadesGuardadas = JSON.parse(datosGuardados);

        return Array.isArray(actividadesGuardadas)
            ? actividadesGuardadas
            : [];

    } catch (error) {
        console.error("Error al recuperar las actividades:", error);
        return [];
    }
}

const actividades = cargarActividades();

function guardarActividades() {
    localStorage.setItem(
        CLAVE_ACTIVIDADES,
        JSON.stringify(actividades)
    );
}

window.guardarActividades = guardarActividades;




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

        guardarActividades();
    }


    getTasks() {
        return this.actividades;
    }


    //window.taskManager.findActivityById(1); (para escribir en consola y probar la funcion)
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


    deleteTask(id) {
        const indice = this.actividades.findIndex(
            actividad => actividad.id === id
        );

        if (indice === -1) {
            return false;
        }

        this.actividades.splice(indice, 1);

        guardarActividades();

        return true;
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

botonConfirmarEliminar.addEventListener("click", function () {

    if (!actividadPendienteEliminar) return;

    const eliminado = window.taskManager.deleteTask(
        actividadPendienteEliminar.id
    );

    if (eliminado) {
        window.actualizarVistasActividad();
    }

    actividadPendienteEliminar = null;

    modalConfirmarEliminacion.hide();
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
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    limpiarErroresActividad();

    if (!validateTaskForm()) {
        return;
    }

    const actividad = {
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        materia: document.getElementById("materia").value.trim(),
        asignadoA: document.getElementById("asignadoA").value.trim(),
        fechaEntrega: campoFecha.value,
        estado: "PENDIENTE",
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
    limpiarErroresActividad();
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
    renderizarActividades();
    actualizarResumen();
});


window.renderizarActividades = renderizarActividades;
window.actualizarResumen = actualizarResumen;
window.formatearValor = formatearValor;


window.actualizarVistasActividad = function () {
    guardarActividades();
    renderizarActividades();
    actualizarResumen();

    window.dispatchEvent(
        new CustomEvent("actividadesActualizadas")
    );
};

// Delegación de eventos para cambiar el estado
listaActividades.addEventListener("change", function (event) {


    if (event.target.classList.contains("selector-estado-actividad")) {

        const tarjeta = event.target.closest(".tarjeta-listado-actividad");
        if (!tarjeta) return;

        const idActividad = Number(tarjeta.dataset.actividadId);


        const actividad = window.taskManager.findActivityById(idActividad);
        if (!actividad) return;


        actividad.estado = event.target.value;

        window.actualizarVistasActividad();
    }


});

