
document.addEventListener("DOMContentLoaded", function () {

    const enlaces = document.querySelectorAll(".enlace-menu");

    const botonMenuMovil = document.querySelector(".boton-menu-movil");
    const menuLateral = document.querySelector(".menu-lateral");

    const secciones = [
        document.getElementById("inicio"),
        document.getElementById("hoy"),
        document.getElementById("actividades"),
        document.getElementById("materias"),
        document.getElementById("progreso")
    ].filter(Boolean);

    
    function alternarMenuMovil() {
        if (!botonMenuMovil || !menuLateral) {
            return;
        }

        const abierto = menuLateral.classList.toggle("menu-abierto");

        botonMenuMovil.setAttribute("aria-expanded", String(abierto));
        botonMenuMovil.setAttribute(
            "aria-label",
            abierto ? "Cerrar menú" : "Abrir menú"
        );
    }

    if (botonMenuMovil && menuLateral) {
        botonMenuMovil.setAttribute("aria-expanded", "false");

        botonMenuMovil.addEventListener("click", alternarMenuMovil);
    }
    
    function cerrarMenuMovil() {
        if (!botonMenuMovil || !menuLateral) {
            return;
        }

        menuLateral.classList.remove("menu-abierto");
        botonMenuMovil.setAttribute("aria-expanded", "false");
        botonMenuMovil.setAttribute("aria-label", "Abrir menú");
    }

    function mostrarSeccion(id) {

        const seccionSeleccionada = document.getElementById(id);

        if (!seccionSeleccionada || !secciones.includes(seccionSeleccionada)) {
            return;
        }

        const tituloSeccion = document.getElementById("titulo-seccion");

        const titulos = {
            hoy: "Actividades de hoy",
            actividades: "Todas las actividades",
            materias: "Mis materias",
            progreso: "Mi progreso"
        };

        if (tituloSeccion) {
            tituloSeccion.textContent = titulos[id] || "Mi organizador";
        }
        
        const botonNuevaActividad = document.getElementById("boton-nueva-actividad");

        if (botonNuevaActividad) {
            botonNuevaActividad.hidden =
                id === "materias" || id === "progreso";
        }
        
        secciones.forEach(function (seccion) {
            seccion.style.display = seccion.id === id ? "block" : "none";
        });
        
        enlaces.forEach(function (enlace) {
            enlace.classList.toggle(
                "activo",
                enlace.getAttribute("href") === `#${id}`
            );
        });
    }

    
    enlaces.forEach(function (enlace) {
        enlace.addEventListener("click", function (evento) {
            const destino = enlace.getAttribute("href");

            if (!destino || !destino.startsWith("#")) {
                return;
            }

            const id = destino.substring(1);

            if (!secciones.some(seccion => seccion.id === id)) {
                return;
            }

            evento.preventDefault();

            mostrarSeccion(id);
            history.replaceState(null, "", `#${id}`);

           
            cerrarMenuMovil();
        });
    });
    
    window.addEventListener("resize", function () {
        if (window.innerWidth > 760) {
            cerrarMenuMovil();
        }
    });
    
    const idInicial = window.location.hash.substring(1);

    const existeSeccionInicial = secciones.some(
        seccion => seccion.id === idInicial
    );

    mostrarSeccion(existeSeccionInicial ? idInicial : "hoy");

});
