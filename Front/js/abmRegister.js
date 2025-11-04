// ABM USUARIOS (solo lo ve el Admin)
document.addEventListener("DOMContentLoaded", async function () {
  const url = "http://localhost:3001/api/usuarios/";
  let tablaUsuarios;
  let modo = null;        //  toma valor "crear" o "editar"
  let idEdit = null;

  // REGEX contraseña igual que login
  const PASS_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  // Obtengo los usuarios
  async function obtenerUsuarios() {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Error obteniendo usuarios:", err);
      Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
      return [];
    }
  }

  // Inicializa tabla
  async function inicializarTabla() {
    const data = await obtenerUsuarios();
    tablaUsuarios = $("#tablaUsuarios").DataTable({
      dom:
        '<"row"<"col-sm-6"l><"col-sm-6"f>>' +
        '<"row"<"col-sm-12"tr>>' +
        '<"row"<"col-sm-5"i><"col-sm-7"p>>' +
        '<"row"<"col-sm-12"B>>',
      buttons: [
        
      ],
      data,  //aca paso el array de objetos que viene del back
      columns: [
        { data: "id" },
        { data: "usuario" },
        { data: "nomb_ape" },
        { data: "email" },
        { data: "rol" },
        {
          data: null,
          className: "text-center",
          orderable: false,
          render: () => `
            <button class='btn btnVer btn-sm btn-outline-info'><i class="bi bi-eye"></i></button>
            <button class='btn btnEditar btn-sm btn-outline-primary'><i class="bi bi-pencil-square"></i></button>
            <button class='btn btnBorrar btn-sm btn-outline-danger'><i class="bi bi-trash"></i></button>
          `
        }
      ],
      pageLength: 10,      // muestra siempre 10 registros
      lengthChange: false, // oculta el selector "Mostrar X registros"
      language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" }
    });
  }
  await inicializarTabla();

  // Recargar la tabla para refrescarle los datos
  async function recargarTabla() {
    const data = await obtenerUsuarios();
    tablaUsuarios.clear().rows.add(data).draw();
  }

  // Crear
  document.getElementById("btnCrear").addEventListener("click", () => {
    modo = "crear"; idEdit = null;
    document.querySelector("#modalCRUD .modal-title").textContent = "Crear usuario";
    document.getElementById("formUsuarios").reset();
    document.getElementById("usuario").readOnly = false;
    document.getElementById("password").readOnly = false;   // 👈 habilito contraseña
    new bootstrap.Modal(document.getElementById("modalCRUD")).show();
  });


  // Clicks de acciones
  document.getElementById("tablaUsuarios").addEventListener("click", async (e) => {
    let target = e.target.tagName === "I" ? e.target.closest("button") : e.target;
    let fila = target.closest("tr");
    let data = tablaUsuarios.row(fila).data();
    if (!data) return;

    // Ver
    if (target.classList.contains("btnVer")) {
      Swal.fire({
        title: `Usuario #${data.id}`,
        html: `
          <div class="text-start">
            <p><b>Usuario:</b> ${data.usuario}</p>
            <p><b>Nombre:</b> ${data.nomb_ape || ""}</p>
            <p><b>Email:</b> ${data.email || ""}</p>
            <p><b>Rol:</b> ${data.rol}</p>
          </div>
        `,
        icon: "info"
      });
    }

    // Editar
    if (target.classList.contains("btnEditar")) {
      modo = "editar"; idEdit = data.id;
      document.querySelector("#modalCRUD .modal-title").textContent = "Editar usuario";
      document.getElementById("id").value = data.id;
      document.getElementById("nomb_ape").value = data.nomb_ape || "";
      document.getElementById("email").value = data.email || "";
      document.getElementById("usuario").value = data.usuario || "";
      document.getElementById("usuario").readOnly = true; // no permitimos cambiar username
      document.getElementById("rol").value = data.rol || "usuario";
      document.getElementById("rol").value = (data.rol || "usuario").toLowerCase();
      document.getElementById("password").readOnly = true; // vacío -> no cambia
      new bootstrap.Modal(document.getElementById("modalCRUD")).show();
    }

    // Borrar
    if (target.classList.contains("btnBorrar")) {
      const ok = await Swal.fire({
        title: `¿Eliminar "${data.usuario}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });
      if (!ok.isConfirmed) return;

      const r = await fetch(url + data.id, { method: "DELETE", credentials: "include" });
      if (!r.ok) return Swal.fire("Error", await r.text(), "error");
      await recargarTabla();
      Swal.fire("Eliminado", "Usuario eliminado", "success");
    }
  });

  // Guardar
  document.getElementById("formUsuarios").addEventListener("submit", async (e) => {
    e.preventDefault();

    //variable con los datos que envio al back (armo el objeto)
    //Si pongo pass directo en payload, siempre viajaría al backend, incluso vacía, y puede arruinar la contraseña guardada en la base.
    const payload = {
      nombre:  document.getElementById("nomb_ape").value.trim(),
      email:   document.getElementById("email").value.trim(),
      usuario: document.getElementById("usuario").value.trim(),
      rol:     document.getElementById("rol").value
    };

    const pass = document.getElementById("password").value.trim();

    // Validaciones básicas
    if (!payload.nombre || !payload.email || !payload.usuario) {
      return Swal.fire("Atención", "Completá los campos obligatorios.", "warning");
    }
    if (/\s/.test(payload.usuario)) {
      return Swal.fire("Atención", "El usuario no debe contener espacios.", "warning");
    }
    // Contraseña obligatoria en crear. En editar, solo si se envía.
    if (modo === "crear" || pass.length) {
      if (!PASS_RE.test(pass)) {
        return Swal.fire("Contraseña inválida",
          "Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
          "warning");
      }
      payload.contraseña = pass;  //si paso la validacion agreago la pass al objeto
    }

    //decido como llamar al back si creo o edito
    const metodo  = (modo === "crear") ? "POST" : "PUT";
    const endpoint = (modo === "crear") ? url : (url + idEdit);

    //hago la peticion al back
    const resp = await fetch(endpoint, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const msg = await resp.text();
      return Swal.fire("Error", msg || "No se pudo guardar", "error");
    }

    //cierro el modal porque lo guarde
    bootstrap.Modal.getInstance(document.getElementById("modalCRUD")).hide();

    //recargo la tabla asi se ve el cambio de inmediato
    await recargarTabla();
    Swal.fire("OK", "Cambios guardados correctamente", "success");
  });
});
