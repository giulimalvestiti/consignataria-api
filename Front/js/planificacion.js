document.addEventListener("DOMContentLoaded", function () {

  const API_BASE_URL = "https://consignataria-api.onrender.com"; // ✅ tu backend en Render

  var calendarEl = document.getElementById("calendar");
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    editable: true,
    displayEventTime: false,
    locale: "es",
    buttonText: {
      today: "Hoy",
      month: "Mes",
      week: "Semana",
      day: "Día",
      list: "Lista"
    },
    // 🔹 CAMBIO: eventos desde tu backend Render
    events: `${API_BASE_URL}/api/eventos`,
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
        confirmButtonColor: "#3085d6",
        denyButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Editar",
        denyButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
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
    datesSet: function (info) {
      let headerTitle = document.querySelector(".fc-toolbar-title");
      if (headerTitle) {
        headerTitle.textContent =
          info.view.title.charAt(0).toUpperCase() +
          info.view.title.slice(1).toLowerCase();
      }
    }
  });
  calendar.render();

  // Inicializamos modal de eventos (Bootstrap)
  var eventModalElement = document.getElementById("eventModal");
  if (!eventModalElement) {
    console.error("❌ ERROR: No se encontró el modal en el DOM.");
    return;
  }
  var eventModal = new bootstrap.Modal(eventModalElement);

  function openModal(eventOrDate) {
    let eventId = document.getElementById("eventId");
    let eventTitle = document.getElementById("eventTitle");
    let eventStart = document.getElementById("eventStart");
    let eventColor = document.getElementById("eventColor");
    let eventDescription = document.getElementById("eventDescription");

    // Limpiar valores previos
    eventId.value = "";
    eventTitle.value = "";
    eventStart.value = "";
    eventColor.value = "#000000";
    eventDescription.value = "";

    if (typeof eventOrDate === "string") {
      eventStart.value = eventOrDate;
      eventColor.value = "#000000";
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

  document
    .getElementById("eventColor")
    .addEventListener("input", function () {
      this.style.backgroundColor = this.value;
    });

  function closeModal() {
    eventModal.hide();
  }

  document.querySelector(".btn-secondary").addEventListener("click", closeModal);

  // ✅ Guardar evento en la BD (crear o editar)
  document.getElementById("saveEvent").addEventListener("click", function () {
    var id = document.getElementById("eventId").value;
    var title = document.getElementById("eventTitle").value.trim();
    var start = document.getElementById("eventStart").value;
    var color = document.getElementById("eventColor").value;
    var description = document.getElementById("eventDescription").value.trim();

    if (!title || !start) {
      Swal.fire("Error", "Debes completar el título y la fecha del evento", "error");
      return;
    }

    // 🔹 CAMBIO: usa API Render
    fetch(`${API_BASE_URL}/api/eventos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, start, color, description })
    })
      .then(response => response.json())
      .then(data => {
        Swal.fire(data.msg, "", data.status ? "success" : "error");
        calendar.refetchEvents();
        closeModal();
      });
  });

  // ✅ Actualizar evento al moverlo en el calendario
  function updateEvent(event) {
    fetch(`${API_BASE_URL}/api/eventos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: event.id,
        title: event.title,
        start: event.start.toISOString().split("T")[0],
        color: event.backgroundColor,
        description: event.extendedProps.description || ""
      })
    })
      .then(response => response.json())
      .then(data => {
        Swal.fire(data.msg, "", data.status ? "success" : "error");
        calendar.refetchEvents();
      });
  }

  // ✅ Eliminar evento
  function deleteEvent(eventId) {
    fetch(`${API_BASE_URL}/api/eventos/${eventId}`, {
      method: "DELETE"
    })
      .then(response => response.json())
      .then(data => {
        Swal.fire(data.msg, "", data.status ? "success" : "error");
        calendar.refetchEvents();
      });
  }
});





