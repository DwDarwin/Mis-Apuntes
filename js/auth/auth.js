const authLayout = document.getElementById("auth-layout");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const formEyebrow = document.getElementById("form-eyebrow");
const formTitle = document.getElementById("form-title");
const formDescription = document.getElementById("form-description");
const authSwitch = document.getElementById("auth-switch");
const showRegisterButton = document.getElementById("show-register");
const visualTitle = document.getElementById("visual-title");
const visualDescription = document.getElementById("visual-description");

function clearMessages(form) {
    form.querySelectorAll(".field-error").forEach((element) => element.textContent = "");
    form.querySelectorAll(".input-wrap").forEach((element) => element.classList.remove("invalid"));
    const message = form.querySelector(".form-message");
    message.textContent = "";
    message.className = "form-message";
}

function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(`${inputId}-error`);
    if (input) {
        input.closest(".input-wrap")?.classList.add("invalid");
        input.setAttribute("aria-invalid", "true");
    }
    if (error) error.textContent = message;
}

function showMessage(form, message, type = "error") {
    const element = form.querySelector(".form-message");
    element.textContent = message;
    element.className = `form-message ${type}`;
}

function switchToRegister() {
    clearMessages(loginForm);
    clearMessages(registerForm);
    loginForm.hidden = true;
    registerForm.hidden = false;
    authLayout.classList.add("register-mode");
    formEyebrow.textContent = "COMIENZA TU CAMINO";
    formTitle.textContent = "Crea tu cuenta";
    formDescription.textContent = "Prepara tu espacio académico y lleva tus tareas al día.";
    showRegisterButton.textContent = "Inicia sesión";
    authSwitch.firstChild.textContent = "¿Ya tienes una cuenta? ";
    showRegisterButton.id = "show-login";
    visualTitle.innerHTML = "Tus metas merecen<br>un buen plan.";
    visualDescription.textContent = "Crea tu espacio, organiza tus asignaturas y convierte tus objetivos en pequeños avances.";
}

function switchToLogin() {
    clearMessages(loginForm);
    clearMessages(registerForm);
    registerForm.hidden = true;
    loginForm.hidden = false;
    authLayout.classList.remove("register-mode");
    formEyebrow.textContent = "BIENVENIDO DE NUEVO";
    formTitle.textContent = "Inicia sesión";
    formDescription.textContent = "Organiza tus tareas y continúa avanzando hacia tus metas.";
    showRegisterButton.textContent = "Regístrate";
    authSwitch.firstChild.textContent = "¿Aún no tienes una cuenta? ";
    showRegisterButton.id = "show-register";
    visualTitle.innerHTML = "Cada pequeño avance<br>te acerca a tu meta.";
    visualDescription.textContent = "Planifica tus actividades, organiza tus materias y celebra todo lo que vas logrando.";
}

showRegisterButton.addEventListener("click", () => {
    if (registerForm.hidden) {
        switchToRegister();
    } else {
        switchToLogin();
    }
});

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.togglePassword);
        const icon = button.querySelector("i");
        const shouldShow = input.type === "password";
        input.type = shouldShow ? "text" : "password";
        icon.classList.toggle("bi-eye", !shouldShow);
        icon.classList.toggle("bi-eye-slash", shouldShow);
        button.setAttribute("aria-label", shouldShow ? "Ocultar contraseña" : "Mostrar contraseña");
        button.title = shouldShow ? "Ocultar contraseña" : "Mostrar contraseña";
    });
});

document.querySelectorAll(".auth-form input").forEach((input) => {
    input.addEventListener("input", () => {
        input.closest(".input-wrap")?.classList.remove("invalid");
        input.removeAttribute("aria-invalid");
        const error = document.getElementById(`${input.id}-error`);
        if (error) error.textContent = "";
    });
});

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessages(loginForm);

    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");
    let valid = true;

    if (!email.value.trim() || !email.validity.valid) {
        showFieldError("login-email", "Ingresa un correo electrónico válido.");
        valid = false;
    }
    if (!password.value) {
        showFieldError("login-password", "Ingresa tu contraseña.");
        valid = false;
    } else if (password.value.length < 8) {
        showFieldError("login-password", "La contraseña debe tener al menos 8 caracteres.");
        valid = false;
    }

    if (!valid) return;

    showMessage(loginForm,
        "La pantalla está lista. Para iniciar sesión con una cuenta real, falta conectar el backend de Spring Boot.",
        "success");
});

registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessages(registerForm);

    const name = document.getElementById("register-name");
    const email = document.getElementById("register-email");
    const password = document.getElementById("register-password");
    const confirmPassword = document.getElementById("register-confirm-password");
    let valid = true;

    if (!name.value.trim()) {
        showFieldError("register-name", "Ingresa tu nombre.");
        valid = false;
    }
    if (!email.value.trim() || !email.validity.valid) {
        showFieldError("register-email", "Ingresa un correo electrónico válido.");
        valid = false;
    }
    if (password.value.length < 8) {
        showFieldError("register-password", "Usa al menos 8 caracteres.");
        valid = false;
    }
    if (!confirmPassword.value || confirmPassword.value !== password.value) {
        showFieldError("register-confirm-password", "Las contraseñas no coinciden.");
        valid = false;
    }

    if (!valid) return;

    showMessage(registerForm,
        "El formulario está validado. Para crear una cuenta real, falta conectarlo al backend de Spring Boot.",
        "success");
});
