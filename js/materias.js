import { apiRequest } from "./api.js";
const formularioMateria = document.getElementById("formulario-materia");
const listaMaterias = document.getElementById("lista-materias");
const totalMaterias = document.getElementById("total-materias");
const modalMateriaElemento = document.getElementById("modalMateria");

// Referencias al modal de confirmación existente
const modalConfirmarElemento = document.getElementById(
    "modalConfirmarEliminacion"
);

const modalConfirmar = bootstrap.Modal.getOrCreateInstance(
    modalConfirmarElemento
);

const nombreActividadEliminar = document.getElementById(
    "nombreActividadEliminar"
);

let materiaPendienteEliminar = null;

const botonConfirmarEliminar = document.getElementById(
    "confirmarEliminarActividad"
);


const mensajesMaterias = document.getElementById("mensajes-materias");

function mostrarMensajeMateria(mensaje, tipo = "success") {
    mensajesMaterias.replaceChildren();

    const alerta = document.createElement("div");

    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensaje;

    const botonCerrar = document.createElement("button");
    botonCerrar.type = "button";
    botonCerrar.className = "btn-close";
    botonCerrar.setAttribute("data-bs-dismiss", "alert");
    botonCerrar.setAttribute("aria-label", "Cerrar");

    alerta.appendChild(botonCerrar);
    mensajesMaterias.appendChild(alerta);
}

const modalMateria = bootstrap.Modal.getOrCreateInstance(
    modalMateriaElemento,
    {
        backdrop: true,
        keyboard: true,
        focus: true
    }
);
modalMateriaElemento.addEventListener("hide.bs.modal", function () {
    if (modalMateriaElemento.contains(document.activeElement)) {
        document.activeElement.blur();
    }
});

function actualizarSelectorMaterias() {
    const selectorMateria = document.getElementById("materia");

    if (!selectorMateria) return;

    const materiaSeleccionada = selectorMateria.value;

    selectorMateria.replaceChildren();

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = materias.length > 0
        ? "Selecciona una materia"
        : "Primero registra una materia";

    opcionInicial.disabled = true;
    opcionInicial.selected = true;

    selectorMateria.appendChild(opcionInicial);

    materias.forEach(function (materia) {
        const opcion = document.createElement("option");

        opcion.value = materia.id;
        opcion.textContent = materia.nombre;

        selectorMateria.appendChild(opcion);
    });

    // Conservar la selección si la materia todavía existe
    if (materias.some(materia => String(materia.id) === materiaSeleccionada)) {
        selectorMateria.value = materiaSeleccionada;
    }
}


let materias = [];

async function cargarMaterias() {
    try {
        materias = await apiRequest("/api/materias");
        renderizarMaterias();

    } catch (error) {
        console.error("Error al cargar las materias:", error);
        window.alert(error.message);
    }
}


function renderizarMaterias() {
    actualizarSelectorMaterias();
    listaMaterias.replaceChildren();

    totalMaterias.textContent = materias.length;

    if (materias.length === 0) {
        const vacio = document.createElement("div");
        vacio.className = "estado-vacio-materias";

        const icono = document.createElement("i");
        icono.className = "bi bi-journal-plus";

        const titulo = document.createElement("h3");
        titulo.textContent = "Aún no tienes materias";

        const mensaje = document.createElement("p");
        mensaje.textContent = "Registra tu primera materia para comenzar.";

        vacio.append(icono, titulo, mensaje);
        listaMaterias.appendChild(vacio);

        return;
    }

    materias.forEach(function (materia) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-materia";

        const cabecera = document.createElement("div");
        cabecera.className = "materia-cabecera";

        const icono = document.createElement("div");
        icono.className = "icono-materia";

        const iconoLibro = document.createElement("i");
        iconoLibro.className = "bi bi-book";

        icono.appendChild(iconoLibro);

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "boton-eliminar-materia";
        botonEliminar.setAttribute(
            "aria-label",
            `Eliminar materia ${materia.nombre}`
        );
        botonEliminar.title = "Eliminar materia";

        const iconoEliminar = document.createElement("i");
        iconoEliminar.className = "bi bi-trash";

        botonEliminar.appendChild(iconoEliminar);

        botonEliminar.addEventListener("click", function () {
            materiaPendienteEliminar = materia;

            nombreActividadEliminar.textContent = materia.nombre;

            modalConfirmar.show();
        });
        cabecera.append(icono, botonEliminar);

        const nombre = document.createElement("h3");
        nombre.textContent = materia.nombre;

        const descripcion = document.createElement("p");
        descripcion.className = "descripcion-materia";
        descripcion.textContent =
            materia.descripcion || "Sin descripción.";

        const pie = document.createElement("div");
        pie.className = "pie-materia";

        const actividadesAsociadas = Array.isArray(window.actividades)
            ? window.actividades.filter(function (actividad) {
                return (actividad.materia || "").trim() === materia.nombre.trim();
            }).length
            : 0;

        pie.textContent = actividadesAsociadas === 1
            ? "1 actividad asociada"
            : `${actividadesAsociadas} actividades asociadas`;


        tarjeta.append(cabecera, nombre, descripcion, pie);
        listaMaterias.appendChild(tarjeta);
    });
}

async function eliminarMateria(materia) {  
    

    try {
        await apiRequest(`/api/materias/${materia.id}`, {
            method: "DELETE"
        });

        materias = materias.filter(
            elemento => elemento.id !== materia.id
        );

        renderizarMaterias();

        mostrarMensajeMateria(
            `La materia "${materia.nombre}" se eliminó correctamente.`,
            "success"
        );

    } catch (error) {
    console.error("Error al eliminar la materia:", error);

    if (error.status === 403) {
        mostrarMensajeMateria(
            "No se puede eliminar esta materia porque tiene actividades asociadas.",
            "warning"
        );
    } else {
        mostrarMensajeMateria(
            error.message || "No fue posible eliminar la materia.",
            "danger"
        );
    }

    throw error;
}
}

modalConfirmarElemento.addEventListener("hidden.bs.modal", function () {
    materiaPendienteEliminar = null;
});

botonConfirmarEliminar.addEventListener("click", async function () {
    if (!materiaPendienteEliminar) return;

    botonConfirmarEliminar.disabled = true;

    try {
        await eliminarMateria(materiaPendienteEliminar);

        // Cerrar el modal solamente si la eliminación fue exitosa
        modalConfirmar.hide();

    } finally {
        botonConfirmarEliminar.disabled = false;
    }
});


formularioMateria.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nombre = document
        .getElementById("nombre-materia")
        .value.trim();

    const descripcion = document
        .getElementById("descripcion-materia")
        .value.trim();

    if (!nombre) {
        document.getElementById("nombre-materia").focus();
        return;
    }

    const existe = materias.some(function (materia) {
        return materia.nombre.toLocaleLowerCase() ===
            nombre.toLocaleLowerCase();
    });

    if (existe) {
    mostrarMensajeMateria(
        "Ya existe una materia con ese nombre.",
        "warning"
    );
    return;
}
    


    try {
        const nuevaMateria = await apiRequest("/api/materias", {
            method: "POST",
            body: JSON.stringify({
                nombre: nombre,
                descripcion: descripcion
            })
        });

        materias.push(nuevaMateria);

        renderizarMaterias();
        formularioMateria.reset();

        const botonCerrar = modalMateriaElemento.querySelector(".btn-close");

        if (botonCerrar) {
            botonCerrar.click();
        }

    } catch (error) {
        window.alert(error.message);
    }
});


window.addEventListener("actividadesActualizadas", function () {
    renderizarMaterias();
});


cargarMaterias();
