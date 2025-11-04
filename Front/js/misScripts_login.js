async function login() {
    const miUsuario = document.getElementById("user").value.trim();
    const miContraseña = document.getElementById("pass").value.trim();

    // Validación de campos vacíos
    if (!miUsuario || !miContraseña) {
        return Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Debes completar todos los campos antes de continuar.',
        });
    }

    // Validación con regex
    const usuarioRegex = /^[a-zA-Z0-9]+$/;
    const contraseñaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if (!miUsuario.match(usuarioRegex)) {
        return Swal.fire({
            icon: 'error',
            title: 'Usuario inválido',
            text: 'El usuario solo puede contener letras y números.',
        });
    }

    if (!miContraseña.match(contraseñaRegex)) {
        return Swal.fire({
            icon: 'error',
            title: 'Contraseña inválida',
            text: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
        });
    }

    // Intentar enviar la solicitud con 'credentials: "include"' para permitir que se guarden las cookies
    try {
        const respuesta = await fetch('https://consignataria-api.onrender.com/api/login', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                usuario: miUsuario,
                contraseña: miContraseña,
            }),
            credentials: "include"
        });

        const mensaje = await respuesta.text();
        if (respuesta.ok) {
            await Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: mensaje,
            });
            window.location.href = "/views/home"; // Redirigir al home
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error en el inicio de sesión',
                text: mensaje,
            });
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error del servidor',
            text: 'Hubo un problema al intentar iniciar sesión. Por favor, intenta nuevamente.',
        });
    }
}

// Limitar caracteres en los campos de entrada
function limitarCaracteres(input, maxLength) {
    input.addEventListener("input", function () {
        if (input.value.length > maxLength) {
            input.value = input.value.slice(0, maxLength);
        }
    });
}

limitarCaracteres(document.getElementById("user"), 20);
limitarCaracteres(document.getElementById("pass"), 20);








