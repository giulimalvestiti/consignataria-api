function openNav() {
  document.getElementById("mobile-menu").style.width = "100%";
}

function closeNav() {
  document.getElementById("mobile-menu").style.width = "0%";
}

// =====================================
// 🔐 Logout (cerrar sesión con Render)
// =====================================
function logout() {
  const API_BASE_URL = "https://consignataria-api.onrender.com";

  // 🧹 Borrar token del localStorage
  localStorage.removeItem("token");

  // Opcional: notificar al backend para cerrar sesión si usás cookies en PC
  fetch(`${API_BASE_URL}/api/logout`, {
    method: "POST"
  })
    .then(response => {
      if (!response.ok) throw new Error("Error al cerrar sesión");
      return response.text();
    })
    .then(mensaje => {
      Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: mensaje,
      }).then(() => {
        window.location.href = '/';
      });
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      });
    });
}

// ================================
// 🔐 Verificación de sesión y carga inicial
// ================================
window.addEventListener("load", () => {
  const API_BASE_URL = "https://consignataria-api.onrender.com";
  const token = localStorage.getItem("token");

  // Si no hay token, volver al login
  if (!token) {
    window.location.href = "/";
    return;
  }

  // Verificar sesión con token en el header
  fetch(`${API_BASE_URL}/api/verify`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(response => {
      if (!response.ok) throw new Error("No autorizado");
      return response.json();
    })
    .then(data => {
      // Cargar dashboard al inicio
      document.getElementById("contenido").src =
        "https://consignataria-front.onrender.com/views/dashboard.html";

      // Mostrar "Usuarios" si es admin
      if (data.rol === "admin") {
        document.getElementById("menuUsuarios")?.classList.remove("oculto");
        document.getElementById("mobileMenuUsuarios")?.classList.remove("oculto");
      }

      // Activar resalte del menú
      inicializarMenuActivo();
    })
    .catch(error => {
      console.error("Error al verificar la autenticación:", error);
      Swal.fire({
        icon: "error",
        title: "Sesión expirada",
        text: "Por favor, inicia sesión nuevamente.",
      }).then(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      });
    });
});

// ================================
// 🎨 MENÚ ACTIVO (resalta dinámicamente)
// ================================
function inicializarMenuActivo() {
  const enlaces = document.querySelectorAll(".nav-links a");
  const enlacesMobile = document.querySelectorAll(".overlay-content a");
  const iframe = document.getElementById("contenido");

  // Activa el enlace clickeado
  function setActivo(linkSeleccionado) {
    [...enlaces, ...enlacesMobile].forEach(l => l.classList.remove("activo"));
    linkSeleccionado.classList.add("activo");
  }

  // Escuchar clicks en ambos menús
  enlaces.forEach(link => {
    link.addEventListener("click", () => {
      iframe.src = link.getAttribute("href");
      setActivo(link);
    });
  });

  enlacesMobile.forEach(link => {
    link.addEventListener("click", () => {
      iframe.src = link.getAttribute("href");
      setActivo(link);
      closeNav(); // cerrar menú móvil después de elegir
    });
  });

  // Detectar carga de página dentro del iframe
  iframe.addEventListener("load", () => {
    const urlActual = iframe.contentWindow.location.pathname;
    [...enlaces, ...enlacesMobile].forEach(l => {
      l.classList.remove("activo");
      if (l.getAttribute("href") === urlActual) {
        l.classList.add("activo");
      }
    });
  });
}


