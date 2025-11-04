// -------------------------------------------------------------
// Mostramos en un modal una tabla con los vencimientos
// Permite exportar, ver detalles y cambiar estado Pendiente/Pagado
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {

  const API_BASE_URL = "https://consignataria-api.onrender.com";


  // Selecciona la tarjeta del Dashboard que abrirá el modal
  const vencimientosCard = document.querySelector(".card.border-danger, .card.bg-danger, .alert-danger");

  if (vencimientosCard) {
    vencimientosCard.addEventListener("click", async function () {
      const modal = new bootstrap.Modal(document.getElementById("modalVencimientos"));
      modal.show();

      // Cuando se abre el modal, cargar datos reales del backend
      try {
        const resp = await fetch(`${API_BASE_URL}/api/vencimientos`); // ← tu ruta del backend
        const data = await resp.json();

        const tabla = $('#tablaVencimientos').DataTable();
        tabla.clear().rows.add(data).draw();
      } catch (err) {
        console.error("Error al cargar vencimientos:", err);
        Swal.fire("Error", "No se pudieron cargar los vencimientos", "error");
      }
    });
  }

  // Inicializamos DataTable dentro del modal
  const tablaVencimientos = $('#tablaVencimientos').DataTable({
    dom:
      't' +
      '<"row mt-3 align-items-center"' +
        '<"col-sm-12 col-md-6"i>' +
        '<"col-sm-12 col-md-6 text-end"p>' +
      '>' +
      '<"row mt-2"' +
        '<"col-sm-12 col-md-6 d-flex gap-2"B>' +
        '<"col-sm-12 col-md-6">' +
      '>',
    buttons: [
      {
        extend: 'print',
        text: '<i class="bi bi-printer"></i> Imprimir',
        className: 'btn btn-secondary btn-sm',
        title: 'Lista de Vencimientos', // título en impresión
        exportOptions: {
          columns: ':visible:not(:last-child)' // oculta la columna Acciones
        },
        customize: function (win) {
          $(win.document.body)
            .css('font-size', '12px')
            .prepend('<h3 style="text-align:center;margin-bottom:10px;">Lista de Vencimientos</h3>');
        }
      },
      {
        extend: 'excelHtml5',
        text: '<i class="bi bi-file-earmark-excel"></i> Exportar a Excel',
        className: 'btn btn-success btn-sm',
        title: 'Lista de Vencimientos', // nombre de archivo Excel
        exportOptions: {
          columns: ':visible:not(:last-child)'
        }
      },
      {
        extend: 'pdfHtml5',
        text: '<i class="bi bi-file-earmark-pdf"></i> Exportar a PDF',
        className: 'btn btn-danger btn-sm',
        title: 'Lista de Vencimientos', //  título del PDF
        exportOptions: {
          columns: ':visible:not(:last-child)'
        },
        orientation: 'landscape',
        pageSize: 'A4',
        customize: function (doc) {
          doc.styles.tableHeader.alignment = 'center';
          doc.content[0].text = 'Lista de Vencimientos'; // reemplaza el título del PDF
          doc.content[0].alignment = 'center';
          doc.styles.tableBodyEven.alignment = 'center';
          doc.styles.tableBodyOdd.alignment = 'center';
        }
      }
    ],


    responsive: true,
    language: {
      url: '//cdn.datatables.net/plug-ins/1.10.22/i18n/Spanish.json'
    },

    data: [], // se carga dinámicamente

    columns: [
      { data: "fecha_vencimiento", title: "Fecha de Vencimiento" },
      { data: "numero_vencimiento", title: "Nº de Vencimiento" },
      { data: "tipo_carga", title: "Tipo de Carga" },
      {
        data: "monto",
        title: "Monto ($)",
        render: data => `$${Number(data).toLocaleString()}`
      },
      { data: "productor", title: "Productor" },
      { data: "contraparte", title: "Contraparte" },
      {
        data: "estado",
        title: "Estado",
        render: function (data) {
          const badgeClass = data === "Pagado" ? "bg-success" : "bg-warning text-dark";
          return `<span class="badge ${badgeClass}">${data}</span>`;
        }
      },
      {
        data: null,
        title: "Acciones",
        className: "text-center",
        render: function (data) {
          const toggleIcon = data.estado === "Pagado"
            ? `<i class="bi bi-arrow-counterclockwise"></i>`
            : `<i class="bi bi-check-lg"></i>`;
          const toggleClass = data.estado === "Pagado"
            ? "btn-outline-warning"
            : "btn-outline-success";

          return `
            <button class="btn btn-sm btn-info btnVer" title="Ver Detalle">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm ${toggleClass} btnToggleEstado" title="Cambiar Estado">
              ${toggleIcon}
            </button>
          `;
        }
      }
    ],

    // Ordenar correctamente por fecha (más nueva arriba)
    columnDefs: [
      {
        targets: 0, // columna de fecha
        render: function (data, type, row) {
          if (!data) return "";
          const fecha = new Date(data);
          const dia = fecha.getDate().toString().padStart(2, "0");
          const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
          const anio = fecha.getFullYear();
          const fechaFormateada = `${dia}/${mes}/${anio}`;

          // Orden cronológico real en DataTables
          if (type === "sort" || type === "type") return fecha.toISOString();
          return fechaFormateada;
        }
      }
    ],
    order: [[0, 'desc']], // más nuevas primero

    // Resaltado de filas vencidas (fecha < hoy, pero no si es hoy)
    createdRow: function (row, data) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // limpiamos horas para comparar solo fechas

      const fechaVenc = new Date(data.fecha_vencimiento);
      fechaVenc.setHours(0, 0, 0, 0);

      if (fechaVenc < hoy && data.estado !== "Pagado") {
        $(row).css("background-color", "#f509095e"); // rojo clarito para vencidos
      }
    }

  });

  // Ver detalle (SweetAlert)
  $('#tablaVencimientos tbody').on('click', '.btnVer', function () {
    const data = tablaVencimientos.row($(this).parents('tr')).data();
    Swal.fire({
      title: 'Detalle del Vencimiento',
      html: `
        <p><b>Fecha:</b> ${data.fecha_vencimiento}</p>
        <p><b>Nº Vencimiento:</b> ${data.numero_vencimiento}</p>
        <p><b>Tipo de Carga:</b> ${data.tipo_carga}</p>
        <p><b>Monto:</b> $${Number(data.monto).toLocaleString()}</p>
        <p><b>Productor:</b> ${data.productor}</p>
        <p><b>Contraparte:</b> ${data.contraparte}</p>
        <p><b>Estado:</b> ${data.estado}</p>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  });

  //  Cambiar estado (Pendiente ↔ Pagado) y guardar en el backend
  $('#tablaVencimientos tbody').on('click', '.btnToggleEstado', async function () {
    const fila = tablaVencimientos.row($(this).parents('tr'));
    const data = fila.data();
    const nuevoEstado = data.estado === "Pendiente" ? "Pagado" : "Pendiente";

    try {
      const resp = await fetch(`${API_BASE_URL}/api/vencimientos/${data.id_vencimiento}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!resp.ok) throw new Error("Error HTTP " + resp.status);

      // Actualiza el estado local
      data.estado = nuevoEstado;
      fila.data(data).draw(false);

      // Mensaje visual
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: nuevoEstado === "Pagado" ? 'success' : 'warning',
        title: `Estado cambiado a "${nuevoEstado}"`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error("Error cambiando estado:", err);
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  });

// Cerrar manualmente el modal de vencimientos
document.getElementById("btnCerrarModal")?.addEventListener("click", function () {
  const modal = bootstrap.Modal.getInstance(document.getElementById("modalVencimientos"));
  modal?.hide();

  // 🔹 Eliminar manualmente cualquier fondo oscuro que quede
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style.overflow = 'auto';
});



});




