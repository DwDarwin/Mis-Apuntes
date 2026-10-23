
const listadoActividades = document.getElementById(
    "listado-todas-actividades"
);

const buscadorActividad = document.getElementById("buscar-actividad");
const filtroEstado = document.getElementById("filtro-estado");
const filtroPrioridad = document.getElementById("filtro-prioridad");
const filtroMateria = document.getElementById("filtro-materia");
const botonLimpiarFiltros = document.getElementById("limpiar-filtros");
const contadorActividades = document.getElementById("contador-actividades");



window.addEventListener("actividadesActualizadas", function () {
    renderizarListadoActividades();
});


buscadorActividad.addEventListener("input", renderizarListadoActividades);
filtroEstado.addEventListener("change", renderizarListadoActividades);
filtroPrioridad.addEventListener("change", renderizarListadoActividades);
filtroMateria.addEventListener("change", renderizarListadoActividades);


function limpiarFiltrosActividades() {
    buscadorActividad.value = "";
    filtroEstado.value = "";
    filtroPrioridad.value = "";
    filtroMateria.value = "";

    renderizarListadoActividades();
}

botonLimpiarFiltros.addEventListener("click", function () {
    limpiarFiltrosActividades();
});


document.querySelector(".enlace-ver-todas").addEventListener("click", function () {
    limpiarFiltrosActividades();
});



function actualizarFiltroMaterias() {
    const materiaSeleccionada = filtroMateria.value;

    const nombresMaterias = [
        ...new Set(
            window.actividades
                .map(actividad => actividad.materia.trim())
                .filter(materia => materia !== "")
        )
    ].sort((a, b) => a.localeCompare(b));

    filtroMateria.replaceChildren();

    const opcionTodas = document.createElement("option");
    opcionTodas.value = "";
    opcionTodas.textContent = "Todas las materias";
    filtroMateria.appendChild(opcionTodas);

    nombresMaterias.forEach(function (nombre) {
        const opcion = document.createElement("option");
        opcion.value = nombre;
        opcion.textContent = nombre;
        filtroMateria.appendChild(opcion);
    });

    if (nombresMaterias.includes(materiaSeleccionada)) {
        filtroMateria.value = materiaSeleccionada;
    }
}


function renderizarListadoActividades() {
    const actividades = window.actividades;
    console.log("Datos recibidos:", actividades);
    console.log("Tipo de datos:", Array.isArray(actividades));
    console.log("Total:", actividades?.length);

    actualizarFiltroMaterias();

    const textoBusqueda = buscadorActividad.value
        .trim()
        .toLowerCase();

    const estadoSeleccionado = filtroEstado.value;
    const prioridadSeleccionada = filtroPrioridad.value;
    const materiaSeleccionada = filtroMateria.value;

    const resultados = actividades.filter(function (actividad) {
        const coincideNombre = actividad.nombre
            .toLowerCase()
            .includes(textoBusqueda);

        const coincideEstado =
            !estadoSeleccionado ||
            actividad.estado === estadoSeleccionado;

        const coincidePrioridad =
            !prioridadSeleccionada ||
            actividad.prioridad === prioridadSeleccionada;

        const coincideMateria =
            !materiaSeleccionada ||
            actividad.materia.trim() === materiaSeleccionada;

        return (
            coincideNombre &&
            coincideEstado &&
            coincidePrioridad &&
            coincideMateria
        );
    });

    listadoActividades.replaceChildren();

    contadorActividades.textContent =
        `${resultados.length} de ${actividades.length} actividad(es)`;

    if (resultados.length === 0) {
        const mensaje = document.createElement("div");
        mensaje.className = "estado-vacio-listado";

        const icono = document.createElement("i");
        icono.className = "bi bi-journal-text";

        const titulo = document.createElement("h3");
        titulo.textContent = actividades.length === 0
            ? "Todavía no tienes actividades"
            : "No encontramos coincidencias";

        const descripcion = document.createElement("p");
        descripcion.textContent = actividades.length === 0
            ? "Usa el botón Nueva actividad para comenzar."
            : "Prueba cambiando los filtros de búsqueda.";

        mensaje.append(icono, titulo, descripcion);
        listadoActividades.appendChild(mensaje);

        return;
    }

    resultados.forEach(function (actividad) {
        listadoActividades.appendChild(
            crearTarjetaListado(actividad)
        );
    });
}


function crearTarjetaListado(actividad) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-listado-actividad";

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

    agregarEtiqueta(
        detalles,
        `Materia: ${actividad.materia || "Sin especificar"}`
    );

    agregarEtiqueta(
        detalles,
        `Entrega: ${actividad.fechaEntrega}`
    );

    if (actividad.asignadoA) {
        agregarEtiqueta(
            detalles,
            `Responsable: ${actividad.asignadoA}`
        );
    }

    const etiquetaEstado = agregarEtiqueta(
        detalles,
        `Estado: ${formatearValor(actividad.estado)}`
    );

    if (actividad.estado === "COMPLETADA") {
        etiquetaEstado.classList.add("etiqueta-estado-completada");
    }

    const etiquetaPrioridad = agregarEtiqueta(
        detalles,
        `Prioridad: ${formatearValor(actividad.prioridad)}`
    );

    if (actividad.prioridad === "ALTA") {
        etiquetaPrioridad.classList.add("etiqueta-prioridad-alta");
    }

    tarjeta.appendChild(detalles);

    const acciones = document.createElement("div");
    acciones.className = "acciones-listado-actividad";

    if (actividad.estado !== "COMPLETADA") {
        const botonCompletar = document.createElement("button");
        botonCompletar.type = "button";
        botonCompletar.className = "boton-completar";
        botonCompletar.textContent = "Marcar completada";

        botonCompletar.addEventListener("click", function () {
            actividad.estado = "COMPLETADA";
            actualizarVistasActividad();
        });

        acciones.appendChild(botonCompletar);
    }

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "boton-eliminar";
    botonEliminar.textContent = "Eliminar";

    botonEliminar.addEventListener("click", function () {
        const confirmar = window.confirm(
            `¿Quieres eliminar la actividad "${actividad.nombre}"?`
        );

        if (!confirmar) return;


        const eliminado = window.taskManager.deleteTask(actividad.id);

        if (eliminado) {
            actualizarVistasActividad();
        }
    });

    acciones.appendChild(botonEliminar);
    tarjeta.appendChild(acciones);

    return tarjeta;
}


function agregarEtiqueta(contenedor, texto) {
    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-listado";
    etiqueta.textContent = texto;
    contenedor.appendChild(etiqueta);

    return etiqueta;
}

/*agregada para pruebas*/
function formatearValor(valor) {
    if (!valor) {
        return "Sin especificar";
    }

    const texto = valor.toString().toLowerCase();

    return texto.charAt(0).toUpperCase() + texto.slice(1);
}


function actualizarVistasActividad() {
    renderizarListadoActividades();

    // Actualizar  el panel de actividades de hoy
    // sus contadores usando las funciones existentes.
    renderizarActividades();
    actualizarResumen();

    window.dispatchEvent(new CustomEvent("actividadesActualizadas"));
}

