import { materiasPrueba } from "./temporal.js";


const formularioMateria = document.getElementById("formulario-materia");
const listaMaterias = document.getElementById("lista-materias");
const totalMaterias = document.getElementById("total-materias");
const modalMateriaElemento = document.getElementById("modalMateria");

const modalMateria = bootstrap.Modal.getOrCreateInstance(
    modalMateriaElemento
);


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

        opcion.value = materia.nombre;
        opcion.textContent = materia.nombre;

        selectorMateria.appendChild(opcion);
    });

    // Conservar la selección si la materia todavía existe
    if (materias.some(materia => materia.nombre === materiaSeleccionada)) {
        selectorMateria.value = materiaSeleccionada;
    }
}


/*deshabilitado temporalmente, mientras estan archivos de prueba*/
/*
const materias = [];
*/

/*prueba temporal*/
const materias = materiasPrueba.map(materia => ({ ...materia }));


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
            const confirmar = window.confirm(
                `¿Deseas eliminar la materia "${materia.nombre}"?`
            );

            if (!confirmar) {
                return;
            }

            const indice = materias.findIndex(function (elemento) {
                return elemento.id === materia.id;
            });

            if (indice !== -1) {
                materias.splice(indice, 1);
                renderizarMaterias();
            }
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

formularioMateria.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document
        .getElementById("nombre-materia")
        .value
        .trim();

    const descripcion = document
        .getElementById("descripcion-materia")
        .value
        .trim();

    if (!nombre) {
        document.getElementById("nombre-materia").focus();
        return;
    }

    const existe = materias.some(function (materia) {
        return materia.nombre.toLocaleLowerCase() ===
            nombre.toLocaleLowerCase();
    });

    if (existe) {
        window.alert("Ya existe una materia con ese nombre.");
        return;
    }

    materias.push({
        id: Date.now(),
        nombre: nombre,
        descripcion: descripcion
    });

    renderizarMaterias();

    formularioMateria.reset();
    modalMateria.hide();
});


window.addEventListener("actividadesActualizadas", function () {
    renderizarMaterias();
});


renderizarMaterias();
