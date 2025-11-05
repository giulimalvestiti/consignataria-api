// =====================================
// 📱 MENÚ MÓVIL
// =====================================
function openNav() {
  document.getElementById("mobile-menu").style.width = "100%";
}

function closeNav() {
  document.getElementById("mobile-menu").style.width = "0%";
}

// =====================================
// 🔐 LOGOUT (cerrar sesión completamente)
// =====================================
function logout() {
  // 🧹 Borrar token y rol del localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("rol");

  Swal.fire({
    icon: "info",
    title: "Sesión cerrada",
    text: "Has cerrado sesión correctamente.",
    timer: 1000,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = "/"; // volver al login
  });
}

// ================================
// 🔒 VERIFICACIÓN DE SESIÓN AL CARGAR
// ================================
window.addEventListener("load", () => {
  const API_BASE_URL = "https://consignataria-api.onrender.com";
  const token = localStorage.getItem("token");

  // 🚫 Si no hay token, redirigir al login
  if (!token) {
    window.location.href = "/";
    return;
  }

  // ✅ Verificar validez del token con el backend
  fetch(`${API_BASE_URL}/api/verify`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  })
    .then(response => {
      if (!response.ok) throw new Error("No autorizado");
      return response.json();
    })
    .then(data => {
      // Cargar el dashboard inicial
      document.getElementById("contenido").src =
        "https://consignataria-front.onrender.com/views/dashboard.html";

      // Mostrar menú de usuarios si es admin
      if (data.rol === "admin") {
        document.getElementById("menuUsuarios")?.classList.remove("oculto");
        document.getElementById("mobileMenuUsuarios")?.classList.remove("oculto");
      }

      // Guardar el rol en localStorage por conveniencia
      localStorage.setItem("rol", data.rol);

      // Inicializar el resaltado dinámico del menú
      inicializarMenuActivo();
    })
    .catch(error => {
      console.error("Error al verificar autenticación:", error);
      Swal.fire({
        icon: "error",
        title: "Sesión expirada",
        text: "Por favor, inicia sesión nuevamente.",
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
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

  // 🔹 Marcar enlace activo
  function setActivo(linkSeleccionado) {
    [...enlaces, ...enlacesMobile].forEach(l => l.classList.remove("activo"));
    linkSeleccionado.classList.add("activo");
  }

  // 🔹 Escuchar clicks en menú desktop
  enlaces.forEach(link => {
    link.addEventListener("click", () => {
      iframe.src = link.getAttribute("href");
      setActivo(link);
    });
  });

  // 🔹 Escuchar clicks en menú móvil
  enlacesMobile.forEach(link => {
    link.addEventListener("click", () => {
      iframe.src = link.getAttribute("href");
      setActivo(link);
      closeNav();
    });
  });

  // 🔹 Detectar cambio de página dentro del iframe
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



