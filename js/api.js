
const API_URL = "http://localhost:8080/api";

const CLAVE_TOKEN = "token";
const CLAVE_USUARIO = "usuario";

// Guarda el JWT
export function guardarToken(token) {
    localStorage.setItem(CLAVE_TOKEN, token);
}

// Obtiene el JWT
export function obtenerToken() {
    return localStorage.getItem(CLAVE_TOKEN);
}

// Guarda los datos del usuario
export function guardarUsuario(usuario) {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

// Obtiene los datos del usuario
export function obtenerUsuario() {
    const usuario = localStorage.getItem(CLAVE_USUARIO);
    return usuario ? JSON.parse(usuario) : null;
}

// Elimina los datos del usuario
export function eliminarUsuario() {
    localStorage.removeItem(CLAVE_USUARIO);
}

// Elimina el JWT
export function eliminarToken() {
    localStorage.removeItem(CLAVE_TOKEN);
}

// Realiza peticiones HTTP al backend
export async function apiRequest(endpoint, opciones = {}) {

    const token = obtenerToken();

    const encabezados = {
        ...opciones.headers
    };

    // Agregar Content-Type cuando no se envíe FormData
    if (!(opciones.body instanceof FormData)) {
        encabezados["Content-Type"] = "application/json";
    }

    // Agregar JWT si existe
    if (token) {
        encabezados["Authorization"] = `Bearer ${token}`;
    }

    const respuesta = await fetch(`${API_URL}${endpoint}`, {
        ...opciones,
        headers: encabezados
    });

    // Respuestas sin contenido
    if (respuesta.status === 204) {
        return null;
    }

    const contenido = await respuesta.json().catch(() => null);

    // Detectar token inválido o vencido
    if (
        respuesta.status === 401 &&
        token &&
        endpoint !== "/auth/login" &&
        endpoint !== "/auth/registro"
    ) {
        eliminarToken();
        eliminarUsuario();

        window.location.href = "../login.html";

        throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
    }

    // Manejar otros errores HTTP
    if (!respuesta.ok) {
        throw new Error(
            contenido?.mensaje ||
            contenido?.message ||
            `Error HTTP ${respuesta.status}`
        );
    }

    return contenido;
}
