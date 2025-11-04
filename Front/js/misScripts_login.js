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

    // ===============================
    // 🟩 Envío de credenciales al backend (token vía JSON)
    // ===============================
    try {
        const respuesta = await fetch('https://consignataria-api.onrender.com/api/login', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuario: miUsuario,
                contraseña: miContraseña,
            })
        });

        const data = await respuesta.json();

        if (respuesta.ok && data.token) {
            // ✅ Guardar el token en localStorage
            localStorage.setItem("token", data.token);

            await Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: data.mensaje || 'Bienvenido al sistema.',
                timer: 1500,
                showConfirmButton: false
            });

            // ✅ Redirigir al home
            window.location.href = "/views/home";
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error en el inicio de sesión',
                text: data.mensaje || 'Usuario o contraseña incorrectos.',
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

// ===============================
// 🧩 Limitar caracteres en los campos de entrada
// ===============================
function limitarCaracteres(input, maxLength) {
    input.addEventListener("input", function () {
        if (input.value.length > maxLength) {
            input.value = input.value.slice(0, maxLength);
        }
    });
}

limitarCaracteres(document.getElementById("user"), 20);
limitarCaracteres(document.getElementById("pass"), 20);








