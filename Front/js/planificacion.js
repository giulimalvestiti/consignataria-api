document.addEventListener("DOMContentLoaded", async function () {
  // ===============================
  // 🔐 Configuración principal
  // ===============================
  const API_BASE_URL = "https://consignataria-api.onrender.com";
  const FRONT_URL = "https://consignataria-front.onrender.com";
  const token = localStorage.getItem("token");

  // ===============================
  // 🔒 Verificar token en el cliente
  // ===============================
  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Sesión expirada",
      text: "Por favor, inicia sesión nuevamente.",
    }).then(() => {
      window.top.location.href = `${FRONT_URL}/views/login.html`;
    });
    return;
  }

  // ===============================
  // 🔎 Verificar token en el servidor
  // ===============================
  try {
    const res = await fetch(`${API_BASE_URL}/api/verificar-token`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (res.status === 401) {
      Swal.fire({
        icon: "error",
        title: "Sesión expirada",
        text: "Por favor, inicia sesión nuevamente.",
      }).then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("rol");
        window.top.location.href = `${FRONT_URL}/views/login.html`;
      });
      return;
    }
  } catch (err) {
    console.warn("⚠️ No se pudo verificar el token (Render puede estar en frío).", err);
  }

  // ===============================
  // 🗓️ Inicializar calendario
  // ===============================
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    editable: true,
    displayEventTime: false,
    locale: "es",
    buttonText: {
      today: "Hoy",
      month: "Mes",
      week: "Semana",
      day: "Día",
      list: "Lista",
    },

    // ✅ Cargar eventos desde API
    events: async function (fetchInfo, successCallback, failureCallback) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/eventos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          Swal.fire({
            icon: "error",
            title: "Sesión expirada",
            text: "Por favor, inicia sesión nuevamente.",
          }).then(() => {
            localStorage.removeItem("token");
            window.top.location.href = `${FRONT_URL}/views/login.html`;
          });
          return;
        }

        const data = await res.json();
        successCallback(data);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        failureCallback(error);
      }
    },

    dateClick: function (info) {
      openModal(info.dateStr);
    },

    eventClick: function (info) {
      Swal.fire({
        title: "Opciones del Evento",
        text: "¿Qué deseas hacer con este evento?",
        icon: "info",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Editar",
        denyButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          openModal(info.event);
        } else if (result.isDenied) {
          deleteEvent(info.event.id);
        }
      });
    },

    eventDrop: function (info) {
      updateEvent(info.event);
    },
  });

  calendar.render();

  // ===============================
  // 🧩 Modal de eventos
  // ===============================
  const eventModalElement = document.getElementById("eventModal");
  const eventModal = new bootstrap.Modal(eventModalElement);

  function openModal(eventOrDate) {
    const eventId = document.getElementById("eventId");
    const eventTitle = document.getElementById("eventTitle");
    const eventStart = document.getElementById("eventStart");
    const eventColor = document.getElementById("eventColor");
    const eventDescription = document.getElementById("eventDescription");

    eventId.value = "";
    eventTitle.value = "";
    eventStart.value = "";
    eventColor.value = "#000000";
    eventDescription.value = "";

    if (typeof eventOrDate === "string") {
      eventStart.value = eventOrDate;
    } else {
      eventId.value = eventOrDate.id;
      eventTitle.value = eventOrDate.title;
      eventStart.value = eventOrDate.start.toISOString().split("T")[0];
      eventDescription.value = eventOrDate.extendedProps?.description || "";
      eventColor.value = eventOrDate.backgroundColor || "#000000";
    }

    eventColor.style.backgroundColor = eventColor.value;
    eventModal.show();
  }

  document.getElementById("eventColor").addEventListener("input", function () {
    this.style.backgroundColor = this.value;
  });

  function closeModal() {
    eventModal.hide();
  }

  document.querySelector(".btn-secondary").addEventListener("click", closeModal);

  // ===============================
  // 💾 Guardar evento (crear o editar)
  // ===============================
  document.getElementById("saveEvent").addEventListener("click", function () {
    const id = document.getElementById("eventId").value;
    const title = document.getElementById("eventTitle").value.trim();
    const start = document.getElementById("eventStart").value;
    const color = document.getElementById("eventColor").value;
    const description = document.getElementById("eventDescription").value.trim();

    if (!title || !start) {
      Swal.fire("Error", "Debes completar el título y la fecha del evento", "error");
      return;
    }

    fetch(`${API_BASE_URL}/api/eventos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, title, start, color, description }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        const data = await response.json();

        Swal.fire(data.msg, "", data.status ? "success" : "error");
        calendar.refetchEvents();
        closeModal();
      })
      .catch((err) => {
        console.error("Error al guardar evento:", err);
        Swal.fire("Error", "No se pudo conectar con el servidor", "error");
      });
  });

  // ===============================
  // ✏️ Actualizar evento (drag & drop)
  // ===============================
  function updateEvent(event) {
    fetch(`${API_BASE_URL}/api/eventos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: event.id,
        title: event.title,
        start: event.start.toISOString().split("T")[0],
        color: event.backgroundColor,
        description: event.extendedProps.description || "",
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        const data = await response.json();

        Swal.fire(data.msg, "", data.status ? "success" : "error");
        calendar.refetchEvents();
      })
      .catch((err) => {
        console.error("Error al actualizar evento:", err);
        Swal.fire("Error", "No se pudo actualizar el evento", "error");
      });
  }

  // ===============================
  // 🗑️ Eliminar evento
  // ===============================
  function deleteEvent(eventId) {
    fetch(`${API_BASE_URL}/api/eventos/${eventId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        const data = await response.json();

        Swal.fire(data.msg, "", data.status ? "success" : "error");
        calendar.refetchEvents();
      })
      .catch((err) => {
        console.error("Error al eliminar evento:", err);
        Swal.fire("Error", "No se pudo eliminar el evento", "error");
      });
  }
});







