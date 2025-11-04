// ABM Productores - DataTable + Validaciones de formulario
document.addEventListener("DOMContentLoaded", async function () {
    let url = "http://localhost:3001/api/productores/";
    let opcion = null;
    let tablaProductores;

    // Email regex robusto, letras 2–24, soporta dominios con subdominios tipo .com.ar)

    const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;

    // Forzar novalidate por JS (evita estilos nativos en rojo al abrir el modal)
    // y quitar pattern del CUIT, valido por JS, no por HTML)
    const $form = document.getElementById("formProductores");
    if ($form) {
        $form.setAttribute("novalidate", "");
    }
    const $cuit        = document.getElementById("cuit");
    const $razon       = document.getElementById("razón_social");
    const $telefono    = document.getElementById("teléfono");
    const $mail        = document.getElementById("mail");
    const $direccion   = document.getElementById("dirección");
    const $descripcion = document.getElementById("descripción");
    if ($cuit) $cuit.removeAttribute("pattern"); // por si quedó en el HTML

    // Verificacion de datos
    //  - CUIT: ya tengo oninput en HTML dejando solo dígitos y 11 máx.
    //  - Teléfono: permitir + dígitos, espacios, guiones y paréntesis (máx 20 chars)
    //  - Razón/Dirección: quitar dobles espacios
    //  - Email: quitar espacios y chars inválidos; limitar a 254; dominio a minúsculas
    if ($telefono) {
        $telefono.addEventListener("input", () => {
            let v = $telefono.value.replace(/[^+\d\s\-()]/g, ""); // caracteres permitidos
            v = v.replace(/\+/g, (m, i) => (i === 0 ? "+" : "")); // un solo '+' y al inicio
            $telefono.value = v.slice(0, 20);
        });
    }
    [$razon, $direccion].forEach($el => {
        if (!$el) return;
        $el.addEventListener("input", () => {
            $el.value = $el.value.replace(/\s{2,}/g, " ");
        });
    });
    if ($mail) {
        $mail.addEventListener("input", () => {
            let v = $mail.value;
            v = v.replace(/\s+/g, "");                 // sin espacios
            v = v.replace(/[^A-Za-z0-9@._%+\-]/g, ""); // sin ; : etc.
            const partes = v.split("@");
            if (partes.length > 2) {
                v = partes[0] + "@" + partes.slice(1).join("").replace(/@/g, "");
            }
            $mail.value = v.slice(0, 254);            // largo máx estándar
        });
        $mail.addEventListener("blur", () => {
            const v = $mail.value;
            const [local, domain] = v.split("@");
            if (domain) $mail.value = `${local}@${domain.toLowerCase()}`;
        });
    }

    // Helpers de validación

    // // Elimina todas las marcas de error del form
    function limpiarValidacionForm() {
        document.querySelectorAll('#formProductores .is-invalid')
            .forEach(el => el.classList.remove('is-invalid'));
    }

    // // Valida CUIT con dígito verificador (AFIP)
    function validarCUIT(cuitRaw) {
        const s = (cuitRaw || "").replace(/\D/g, "");
        if (s.length !== 11) return false;
        const pesos = [5,4,3,2,7,6,5,4,3,2];
        const dig = s.split("").map(Number);
        const dv = dig.pop();
        const suma = dig.reduce((acc, d, i) => acc + d * pesos[i], 0);
        let verif = 11 - (suma % 11);
        if (verif === 11) verif = 0;
        if (verif === 10) verif = 9;
        return dv === verif;
    }

    
    // Obtener Productores (API)
    
    async function obtenerProductores() {
        try {
            let response = await fetch(url);
            let data = await response.json();
            return data;
        } catch (error) {
            console.error("Error obteniendo productores:", error);
            return [];
        }
    }

    
    // Inicializar DataTable
    
    async function inicializarTabla() {
        let data = await obtenerProductores();
        tablaProductores = $("#tablaProductores").DataTable({
            dom: '<"row" <"col-sm-6"l><"col-sm-6"f>>' + 
                 '<"row" <"col-sm-12"tr>>' +
                 '<"row" <"col-sm-5"i><"col-sm-7"p>>' + 
                 '<"row" <"col-sm-12"B>>',
            buttons: [
                {
                    extend: 'print',
                    text: '<i class="bi bi-printer"></i> Imprimir',
                    title: 'Lista de Productores',
                    className: 'btn btn-dark',
                    exportOptions: {
                        columns: ':not(:last-child)',
                        modifier: { page: 'all' }
                    },
                    customize: function (win) {
                        $(win.document.body).css('font-size', '10pt');
                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                },
                {
                    extend: 'excelHtml5',
                    text: '<i class="bi bi-file-earmark-excel"></i> Exportar a Excel',
                    title: 'Lista de Productores',
                    className: 'btn btn-success',
                    exportOptions: {
                        columns: ':not(:last-child)',
                        modifier: { page: 'all' }
                    }
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="bi bi-file-earmark-pdf"></i> Exportar a PDF',
                    title: 'Lista de Productores',
                    className: 'btn btn-danger',
                    orientation: 'landscape',
                    pageSize: 'A4',
                    exportOptions: {
                        columns: ':not(:last-child)',
                        modifier: { page: 'all' }
                    },
                    customize: function(doc) {
                        doc.styles.tableHeader.fontSize = 10;
                        doc.defaultStyle.fontSize = 8;
                    }
                }
            ],
            data: data,
            columns: [
                { data: "idProductor" },
                { data: "cuit" },
                { data: "razón_social" },
                { data: "teléfono" },
                { data: "mail" },
                { data: "dirección" },
                { data: "descripción" },
                {
                    defaultContent: `
                        <div class='text-center'>
                            <button class='btn btnVer btn-sm d-inline-block' title='Ver'>
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class='btn btnEditar btn-sm d-inline-block' title='Editar'>
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class='btn btnBorrar btn-sm d-inline-block' title='Borrar'>
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `
                }
            ],
            pageLength: 10,      // muestra siempre 10 registros
            lengthChange: false, // oculta el selector "Mostrar X registros"
            responsive: true,
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
            }
        });
    }

    await inicializarTabla();

    
    // Recargar DataTable
    
    async function recargarTabla() {
        let data = await obtenerProductores();
        tablaProductores.clear().rows.add(data).draw();
    }

    
    // Botón Crear: abrir modal limpio
    
    document.getElementById("btnCrear").addEventListener("click", function () {
        opcion = "crear";
        document.getElementById("formProductores").reset();
        limpiarValidacionForm();
        document.querySelector(".modal-title").textContent = "Crear Productor";
        new bootstrap.Modal(document.getElementById("modalCRUD")).show();
    });

    
    // Botón Editar: cargar datos en el modal
    
    document.getElementById("tablaProductores").addEventListener("click", function (event) {
        let target = event.target;
        if (target.tagName === "I") {
            target = target.closest("button");
        }
        if (target && target.classList.contains("btnEditar")) {
            opcion = "editar";
            limpiarValidacionForm();
            let fila = target.closest("tr");
            let data = tablaProductores.row(fila).data();

            document.getElementById("id").value = data.idProductor;
            document.getElementById("cuit").value = data.cuit;
            document.getElementById("razón_social").value = data.razón_social;
            document.getElementById("teléfono").value = data.teléfono;
            document.getElementById("mail").value = data.mail;
            document.getElementById("dirección").value = data.dirección;
            document.getElementById("descripción").value = data.descripción;

            document.querySelector(".modal-title").textContent = "Editar Productor";
            new bootstrap.Modal(document.getElementById("modalCRUD")).show();
        }
    });

    
    // Submit del formulario: VALIDACIÓN + fetch API
    
    document.getElementById("formProductores").addEventListener("submit", async function (e) {
        e.preventDefault();

        // limpiar marcas previas
        [$cuit,$razon,$telefono,$mail,$direccion,$descripcion].forEach(el => el && el.classList.remove("is-invalid"));

        const cuit = ($cuit?.value || "").trim();
        const razon = ($razon?.value || "").trim();
        const tel = ($telefono?.value || "").trim();
        const mail = ($mail?.value || "").trim();
        const direccion = ($direccion?.value || "").trim();
        const desc = ($descripcion?.value || "").trim();

        const errores = [];
        const marcar = [];

        // // CUIT
        if (!cuit) { errores.push("El CUIT es obligatorio."); marcar.push($cuit); }
        else if (!validarCUIT(cuit)) { errores.push("El CUIT ingresado no es válido (dígito verificador AFIP)."); marcar.push($cuit); }

        // // Razón social
        if (!razon) { errores.push("La Razón Social es obligatoria."); marcar.push($razon); }
        else if (razon.length < 2 || razon.length > 120) { errores.push("La Razón Social debe tener entre 2 y 120 caracteres."); marcar.push($razon); }

        // // Teléfono (opcional; si existe debe tener 7–15 dígitos reales)
        const telDigits = (tel.match(/\d/g) || []).length;
        if (tel && (telDigits < 7 || telDigits > 15)) { errores.push("El teléfono debe tener entre 7 y 15 dígitos (sin contar símbolos)."); marcar.push($telefono); }

        // // Email (opcional; si existe debe ser válido)
        if (mail && !EMAIL_RE.test(mail)) { errores.push("El email no tiene un formato válido (ej. nombre@dominio.com o .com.ar)."); marcar.push($mail); }

        // // Dirección / Descripción (límites de longitud)
        if (direccion.length > 150) { errores.push("La dirección no puede superar los 150 caracteres."); marcar.push($direccion); }
        if (desc.length > 500) { errores.push("La descripción no puede superar los 500 caracteres."); marcar.push($descripcion); }

        if (errores.length) {
            marcar.forEach(el => el && el.classList.add("is-invalid"));
            await Swal.fire({
                icon: "error",
                title: "Revisá los datos",
                html: "<ul style='text-align:left;margin:0;padding-left:18px'>" + errores.map(e=>`<li>${e}</li>`).join("") + "</ul>"
            });
            (marcar[0] || $cuit)?.focus();
            return;
        }

        // // Si todo OK: preparar payload y enviar
        let datos = {
            idProductor: document.getElementById("id").value.trim(),
            cuit: (cuit || "").replace(/\D/g, ""),
            razón_social: razon,
            teléfono: tel,
            mail: mail,
            dirección: direccion,
            descripción: desc,
        };

        let metodo = opcion === "crear" ? "POST" : "PUT";
        let endpoint = opcion === "crear" ? url : url + datos.idProductor;

        try {
            const resp = await fetch(endpoint, {
                method: metodo,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });
            if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(txt || "Error al guardar");
            }
            await recargarTabla();
            bootstrap.Modal.getInstance(document.getElementById("modalCRUD")).hide();
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: "error", title: "No se pudo guardar", text: err.message || "Intentá de nuevo." });
        }
    });

    
// Botón Borrar
document.getElementById("tablaProductores").addEventListener("click", async function (event) {
    let target = event.target;
    if (target.tagName === "I") {
        target = target.closest("button");
    }

    if (target && target.classList.contains("btnBorrar")) {
        let fila = target.closest("tr");
        let data = tablaProductores.row(fila).data();
        let idProductor = data.idProductor;

        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(url + idProductor, { method: "DELETE" });
                    const mensaje = await response.text();

                    if (!response.ok) {
                        //Si hubo error (restricción FK o cualquier otro)
                        return Swal.fire("Error", mensaje, "error");
                    }

                    // Eliminación exitosa
                    await recargarTabla();
                    Swal.fire("Eliminado", mensaje, "success");
                } catch (error) {
                    Swal.fire("Error", "No se pudo conectar con el servidor", "error");
                }
            }
        });
    }
});


    
    // Botón Ver (detalle)
    
    document.getElementById("tablaProductores").addEventListener("click", function (event) {
        let target = event.target;
        if (target.tagName === "I") {
            target = target.closest("button");
        }
        if (target && target.classList.contains("btnVer")) {
            let fila = target.closest("tr");
            let data = tablaProductores.row(fila).data();

            document.getElementById("verID").textContent = data.idProductor;
            document.getElementById("verCUIT").textContent = data.cuit;
            document.getElementById("verRazon").textContent = data.razón_social;
            document.getElementById("verTelefono").textContent = data.teléfono;
            document.getElementById("verMail").textContent = data.mail;
            document.getElementById("verDireccion").textContent = data.dirección;
            document.getElementById("verDescripcion").textContent = data.descripción;

            new bootstrap.Modal(document.getElementById("modalVer")).show();
        }
    });

    
    // Al cerrar el modal: limpiar estados inválidos
    
    document.getElementById("modalCRUD")
        .addEventListener("hidden.bs.modal", limpiarValidacionForm);
});

