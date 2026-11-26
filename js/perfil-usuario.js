import {
    obtenerUsuario,
    obtenerToken,
    eliminarToken,
    eliminarUsuario
} from "./api.js";

document.addEventListener("DOMContentLoaded", function () {

    const usuario = obtenerUsuario();
    const token = obtenerToken();

    // Verificar que exista una sesión    
    if (!usuario || !token) {
        eliminarToken();
        eliminarUsuario();

        window.location.href = "../login.html";
        return;
    }

    
    document.getElementById("nombre-usuario").textContent = usuario.nombre;

    
    const roles = {
        USER: "Estudiante",
        ADMIN: "Administrador"
    };

    document.getElementById("rol-usuario").textContent =
        roles[usuario.rol] || usuario.rol;


       
    const botonCerrarSesion = document.getElementById("cerrar-sesion");

    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener("click", function (event) {
            event.preventDefault();

            eliminarToken();
            eliminarUsuario();

            window.location.href = "./login.html";
        });
    }
});
