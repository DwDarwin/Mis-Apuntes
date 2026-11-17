
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
                .map(actividad => (actividad.materia || "").trim())
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
            (actividad.materia || "").trim() === materiaSeleccionada;

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


    const etiquetaPrioridad = agregarEtiqueta(
        detalles,
        `Prioridad: ${window.formatearValor(actividad.prioridad)}`
    );

    if (actividad.prioridad === "ALTA") {
        etiquetaPrioridad.classList.add("etiqueta-prioridad-alta");
    }

    tarjeta.appendChild(detalles);


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


    const acciones = document.createElement("div");
    acciones.className = "acciones-listado-actividad";

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
            window.actualizarVistasActividad();
        }
    });

    acciones.appendChild(botonEliminar);


    const filaAcciones = document.createElement("div");
    filaAcciones.className = "fila-acciones-actividad";

    filaAcciones.appendChild(contenedorEstado);
    filaAcciones.appendChild(acciones);

    tarjeta.appendChild(filaAcciones);

    return tarjeta;
}



function agregarEtiqueta(contenedor, texto) {
    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-listado";
    etiqueta.textContent = texto;
    contenedor.appendChild(etiqueta);

    return etiqueta;
}


// Delegación de eventos para cambiar el estado
listadoActividades.addEventListener("change", function (event) {


    if (event.target.classList.contains("selector-estado-actividad")) {


        const tarjeta = event.target.closest(".tarjeta-listado-actividad");
        //console.log("Elemento de la tarea:", tarjeta);
        //console.log("ID de la tarea:", tarjeta.dataset.actividadId);

        if (!tarjeta) return;


        const idActividad = Number(tarjeta.dataset.actividadId);

        // Buscar la actividad mediante TaskManager
        const actividad = window.taskManager.findActivityById(idActividad);

        if (!actividad) return;


        actividad.estado = event.target.value;

        window.actualizarVistasActividad();
    }
});