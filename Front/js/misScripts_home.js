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

  fetch(`${API_BASE_URL}/api/logout`, {
    method: "POST",
    credentials: "include"
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

  fetch(`${API_BASE_URL}/api/verify`, {
    method: "GET",
    credentials: "include"
  })
    .then(response => {
      if (!response.ok) window.location.href = '/';
      return response.json();
    })
    .then(data => {
      // Cargar dashboard al inicio
      document.getElementById("contenido").src = "https://consignataria-front.onrender.com/front/dashboard.html";

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
      window.location.href = "/";
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

