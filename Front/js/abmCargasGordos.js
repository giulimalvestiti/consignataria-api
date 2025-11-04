document.addEventListener("DOMContentLoaded", async function () {
  const url = "https://consignataria-api.onrender.com/api/gordos/";
  let opcion = null;
  let tablaCargas;
  let idCargaEnEdicion = null;

  // ------------------------------------------------------------------------
  // FECHAS: FAENA >= CARGA
  // ------------------------------------------------------------------------
  const $fechaCarga = document.getElementById("fecha_carga");
  const $fechaFaena = document.getElementById("fecha_faena");

  // dd/mm/aaaa o yyyy-mm-dd -> Date
  function parseFechaFlexible(str) {
    if (!str) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [d, m, y] = str.split("/").map(Number);
      return new Date(y, m - 1, d);
    }
    return null;
  }
  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  function actualizarMinFaenaSegunCarga() {
    const fc = parseFechaFlexible($fechaCarga?.value);
    if (!$fechaFaena) return;
    if (fc) {
      $fechaFaena.min = toISO(fc); // solo setea el mínimo permitido
    } else {
      $fechaFaena.removeAttribute("min");
    }
  }

  function fechasValidasFaenaVsCarga() {
    const fc = parseFechaFlexible($fechaCarga?.value);
    const ff = parseFechaFlexible($fechaFaena?.value);
    if (!fc || !ff) return true; // si falta alguna, no invalidamos acá
    return ff >= fc;
  }

  if ($fechaCarga) {
    $fechaCarga.addEventListener("change", () => {
      actualizarMinFaenaSegunCarga();
      // si ya hay faena cargada, solo revalido (no la modifico)
      if ($fechaFaena && $fechaFaena.value) {
        if (!fechasValidasFaenaVsCarga()) {
          $fechaFaena.setCustomValidity(
            "La fecha de Faena debe ser igual o posterior a la fecha de Carga."
          );
          $fechaFaena.reportValidity();
        } else {
          $fechaFaena.setCustomValidity("");
        }
      }
      // también reencadenamos vencimientos (vto1 depende de fecha_carga)
      actualizarCadenaVtosGordos();
    });
  }
  if ($fechaFaena) {
    $fechaFaena.addEventListener("change", () => {
      if (!fechasValidasFaenaVsCarga()) {
        $fechaFaena.setCustomValidity(
          "La fecha de Faena debe ser igual o posterior a la fecha de Carga."
        );
        $fechaFaena.reportValidity();
      } else {
        $fechaFaena.setCustomValidity("");
      }
    });
  }

  // ------------------------------------------------------------------------
  // Carga la lista de Productores en el select del formulario
  // ------------------------------------------------------------------------
  async function cargarProductores() {
    try {
      const response = await fetch("https://consignataria-api.onrender.com/api/productores", {
        credentials: "include",
      });
      const productores = await response.json();
      const select = document.getElementById("productor");
      select.innerHTML = "<option value=''>Seleccione un Productor</option>";
      productores.forEach((p) => {
        select.innerHTML += `<option value="${p.idProductor}">${p.razón_social}</option>`;
      });
    } catch (error) {
      console.error("Error cargando productores:", error);
    }
  }
  // Carga la lista de Matarifes en el select del formulario
  async function cargarMatarifes() {
    try {
      const response = await fetch("https://consignataria-api.onrender.com/api/matarifes", {
        credentials: "include",
      });
      const matarifes = await response.json();
      const select = document.getElementById("matarife");
      select.innerHTML = "<option value=''>Seleccione un Matarife</option>";
      matarifes.forEach((m) => {
        select.innerHTML += `<option value="${m.idMatarife}">${m.razón_social}</option>`;
      });
    } catch (error) {
      console.error("Error cargando matarifes:", error);
    }
  }
  // Carga la lista de Transportes en el select del formulario
  async function cargarTransportes() {
    try {
      const response = await fetch("https://consignataria-api.onrender.com/api/transportes", {
        credentials: "include",
      });
      const transportes = await response.json();
      const select = document.getElementById("transporte");
      select.innerHTML = "<option value=''>Seleccione un Transporte</option>";
      transportes.forEach((t) => {
        select.innerHTML += `<option value="${t.idTransporte}">${t.razón_social}</option>`;
      });
    } catch (error) {
      console.error("Error cargando transportes:", error);
    }
  }

  // ------------------------------------------------------------------------
  //Funcion para autocalcular todo
  // ------------------------------------------------------------------------
  function calcularTodo() {
    const bruto = parseFloat(document.getElementById("bruto").value) || 0;
    const tara = parseFloat(document.getElementById("tara").value) || 0;
    const desbaste = parseFloat(document.getElementById("desbaste").value) || 0;
    const precioProductor =
      parseFloat(document.getElementById("precio_productor").value) || 0;
    const precioMatarife =
      parseFloat(document.getElementById("precio_matarife").value) || 0;
    const porcentajeComision =
      parseFloat(document.getElementById("porcentaje_comision").value) || 0;
    const machos = parseInt(document.getElementById("machos").value) || 0;
    const hembras = parseInt(document.getElementById("hembras").value) || 0;
    const retGanancia =
      parseFloat(document.getElementById("retencion_ganancia").value) || 0;
    const iva = parseFloat(document.getElementById("iva").value) || 0;
    const chequeFisico =
      parseFloat(document.getElementById("cheque_fisico").value) || 0;
    const chequeElectronico =
      parseFloat(document.getElementById("cheque_electronico").value) || 0;
    const transferencia =
      parseFloat(document.getElementById("transferencia").value) || 0;
    const kilosFaenados =
      parseFloat(document.getElementById("kilos_faenados").value) || 0;
    const gastosTransporte =
      parseFloat(document.getElementById("gastos_transporte").value) || 0;

    const neto = bruto - tara;
    document.getElementById("neto").value = neto > 0 ? neto.toFixed(2) : 0;

    const netoConDesbaste = neto - (neto * desbaste) / 100;
    document.getElementById("neto_con_desbaste").value =
      netoConDesbaste > 0 ? netoConDesbaste.toFixed(2) : 0;

    const montoPagar = netoConDesbaste * precioProductor;
    document.getElementById("monto_pagar").value =
      montoPagar > 0 ? montoPagar.toFixed(2) : 0;

    document.getElementById("total_animales").value = machos + hembras;

    const gananciaComision =
      ((netoConDesbaste * precioMatarife) * porcentajeComision) / 100;
    document.getElementById("ganancia_comision").value =
      gananciaComision > 0 ? gananciaComision.toFixed(2) : 0;

    const gananciaDiferencia =
      precioMatarife * netoConDesbaste - precioProductor * netoConDesbaste;
    document.getElementById("ganancia_diferencia").value =
      gananciaDiferencia > 0 ? gananciaDiferencia.toFixed(2) : 0;

    const gananciaTotal = gananciaComision + gananciaDiferencia - gastosTransporte;
    document.getElementById("ganancia_total").value = gananciaTotal.toFixed(2);

    const efectivo =
      montoPagar - retGanancia - iva - chequeFisico - chequeElectronico - transferencia;
    document.getElementById("efectivo").value =
      efectivo > 0 ? efectivo.toFixed(2) : 0;

    const porcentajeRinde =
      netoConDesbaste > 0 ? (kilosFaenados / netoConDesbaste) * 100 : 0;
    document.getElementById("porcentaje_rinde").value =
      porcentajeRinde > 0 ? porcentajeRinde.toFixed(2) : 0;
  }
  document.addEventListener("input", calcularTodo);

  // ------------------------------------------------------------------------
  // Obtiene todas las cargas desde la API
  // ------------------------------------------------------------------------
  async function obtenerCargas() {
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error obteniendo cargas:", error);
      return [];
    }
  }

  // Inicializa la tabla de cargas con los datos obtenidos
  async function inicializarTabla() {
    const data = await obtenerCargas();
    tablaCargas = $("#tablaCargas").DataTable({
      dom:
        '<"row"<"col-sm-6"l><"col-sm-6"f>>' +
        '<"row"<"col-sm-12"tr>>' +
        '<"row"<"col-sm-5"i><"col-sm-7"p>>' +
        '<"row"<"col-sm-12"B>>',
      buttons: [],
      data: data,
      columns: [
        { data: "idCargaGordo" },
        {
          data: "fecha_carga",
          render: function (data) {
            if (!data) return "";
            const fecha = new Date(data);
            const dia = fecha.getDate().toString().padStart(2, '0');
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
            const anio = fecha.getFullYear();
            return `${dia}/${mes}/${anio}`;
          }
        },

        { data: "productor" },
        { data: "matarife" },
        { data: "transporte" },
        { data: "descripcion" },
        {
          defaultContent: `
          <div class='text-center'>
            <button class='btn btnVer btn-sm'><i class="bi bi-eye"></i></button>
            <button class='btn btnEditar btn-sm'><i class="bi bi-pencil-square"></i></button>
            <button class='btn btnBorrar btn-sm'><i class="bi bi-trash"></i></button>
          </div>`,
        },
      ],
      pageLength: 10,      // muestra siempre 10 registros
      lengthChange: false, // oculta el selector "Mostrar X registros"
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
      },
    });
  }

  // Ejecuta la carga inicial de la tabla al cargar la págin
  await inicializarTabla();

  // Recarga la tabla con datos actualizados desde la API
  async function recargarTabla() {
    const data = await obtenerCargas();
    tablaCargas.clear().rows.add(data).draw();
  }

  // Abre el modal para crear una nueva carga y prepara el formulario
  document.getElementById("btnCrear").addEventListener("click", function () {
    opcion = "crear";
    idCargaEnEdicion = null;
    document.getElementById("formCarga").reset();

    // Carga los select con los datos actualizados
    cargarProductores();
    cargarMatarifes();
    cargarTransportes();

    // Cambia el título del modal
    document.querySelector("#modalCRUD .modal-title").textContent =
      "Crear Carga Faena";

    // Abre el modal usando Bootstrap 5
    const modal = new bootstrap.Modal(document.getElementById("modalCRUD"));
    modal.show();

    // Fechas: setear min en Faena según Carga (sin tocar el valor)
    actualizarMinFaenaSegunCarga();

    // Reset explícito de Vencimientos al crear
    const selCant = document.getElementById("cantidadVencimientos");
    if (selCant) {
      selCant.value = "0"; // Contado
      selCant.dispatchEvent(new Event("change"));
      for (let i = 1; i <= 5; i++) {
        const inp = document.getElementById(`vencimiento_${i}`);
        if (inp) {
          inp.value = "";
          inp.disabled = (i !== 1); // por las dudas, dejamos solo v1 habilitable
        }
      }
      // recalculamos cadena (v1 min = fecha_carga, y el resto bloqueado)
      actualizarCadenaVtosGordos();
    }
  });

  // Envía los datos del formulario para crear o editar una carga
  document
    .getElementById("formCarga")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      e.stopPropagation();

      const idProductor = document.getElementById("productor").value;
      const idMatarife = document.getElementById("matarife").value;
      const idTransporte = document.getElementById("transporte").value;

      if (!idProductor || !idMatarife || !idTransporte) {
        Swal.fire(
          "Error",
          "Debe seleccionar Productor, Matarife y Transporte",
          "warning"
        );
        return;
      }

      // Validación de fechas
      if (!fechasValidasFaenaVsCarga()) {
        if ($fechaFaena) {
          $fechaFaena.setCustomValidity(
            "La fecha de Faena debe ser igual o posterior a la fecha de Carga."
          );
          $fechaFaena.reportValidity();
          $fechaFaena.focus();
        }
        return;
      } else {
        if ($fechaFaena) $fechaFaena.setCustomValidity("");
      }

      const datos = {
        idProductor,
        idMatarife,
        idTransporte,
        fecha_carga: document.getElementById("fecha_carga").value,
        fecha_faena: document.getElementById("fecha_faena").value || null,

        kilogramos_bruto: parseFloat(document.getElementById("bruto").value) || 0,
        kilogramos_tara: parseFloat(document.getElementById("tara").value) || 0,
        kilogramos_faenado:
          parseFloat(document.getElementById("kilos_faenados").value) || 0,
        porcentaje_desbaste:
          parseFloat(document.getElementById("desbaste").value) || 0,
        precio_al_productor:
          parseFloat(document.getElementById("precio_productor").value) || 0,

        machos: parseInt(document.getElementById("machos").value) || 0,
        hembras: parseInt(document.getElementById("hembras").value) || 0,
        descripcion: document.getElementById("descripcion").value || "",

        ret_ganancia:
          parseFloat(document.getElementById("retencion_ganancia").value) || 0,
        iva: parseFloat(document.getElementById("iva").value) || 0,
        cheque_fisico:
          parseFloat(document.getElementById("cheque_fisico").value) || 0,
        cheque_electronico:
          parseFloat(document.getElementById("cheque_electronico").value) || 0,
        transferencia:
          parseFloat(document.getElementById("transferencia").value) || 0,
        precio_matarife:
          parseFloat(document.getElementById("precio_matarife").value) || 0,
        porcentaje_comision:
          parseFloat(document.getElementById("porcentaje_comision").value) || 0,
        gastos_transporte:
          parseFloat(document.getElementById("gastos_transporte").value) || 0,
      };

      // Captura de fechas de vencimientos
      const cantidadVencimientos = parseInt(
        document.getElementById("cantidadVencimientos").value
      );
      datos.cantidad_vencimientos = cantidadVencimientos;
      datos.fechas_vencimiento = [];
      datos.tipo_carga = "gordo";

      for (let i = 1; i <= cantidadVencimientos; i++) {
        const fecha = document.getElementById(`vencimiento_${i}`).value;
        if (fecha) datos.fechas_vencimiento.push(fecha);
      }

      // Solo en modo edición, agregamos el ID de la carga
      if (opcion === "editar") {
        datos.idCargaGordo = idCargaEnEdicion;
      }

      const metodo = opcion === "crear" ? "POST" : "PUT";
      const endpoint = opcion === "crear" ? url : url + idCargaEnEdicion;

      const response = await fetch(endpoint, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
        credentials: "include",
      });

      const resultado = await response.text();
      console.log("Respuesta del servidor:", resultado);

      await recargarTabla();
      bootstrap.Modal.getInstance(document.getElementById("modalCRUD")).hide();
      Swal.fire("Éxito", opcion === "crear" ? "Carga creada correctamente" : "Carga actualizada correctamente", "success");
    });

  // Maneja los botones Ver, Editar y Borrar dentro de la tabla
  document
    .getElementById("tablaCargas")
    .addEventListener("click", async function (event) {
      let target =
        event.target.tagName === "I"
          ? event.target.closest("button")
          : event.target;
      let fila = target.closest("tr");
      let data = tablaCargas.row(fila).data();

      if (target.classList.contains("btnEditar")) {
        opcion = "editar";
        idCargaEnEdicion = data.idCargaGordo;
        document.querySelector("#modalCRUD .modal-title").textContent =
          "Editar Carga Faena";

        // Cargar opciones
        await cargarProductores();
        await cargarMatarifes();
        await cargarTransportes();

        const productorSelect = document.getElementById("productor");
        productorSelect.insertAdjacentHTML(
          "afterbegin",
          `<option value="${data.idProductor}" selected>${data.productor}</option>`
        );

        const matarifeSelect = document.getElementById("matarife");
        matarifeSelect.insertAdjacentHTML(
          "afterbegin",
          `<option value="${data.idMatarife}" selected>${data.matarife}</option>`
        );

        const transporteSelect = document.getElementById("transporte");
        transporteSelect.insertAdjacentHTML(
          "afterbegin",
          `<option value="${data.idTransporte}" selected>${data.transporte}</option>`
        );

        document.getElementById("fecha_carga").value =
          data.fecha_carga.split("T")[0];
        document.getElementById("fecha_faena").value = data.fecha_faena
          ? data.fecha_faena.split("T")[0]
          : "";

        // Ajustar min y validar en edición (no modifico valor)
        actualizarMinFaenaSegunCarga();
        if ($fechaFaena && $fechaFaena.value && !fechasValidasFaenaVsCarga()) {
          $fechaFaena.setCustomValidity(
            "La fecha de Faena debe ser igual o posterior a la fecha de Carga."
          );
          $fechaFaena.reportValidity();
        } else if ($fechaFaena) {
          $fechaFaena.setCustomValidity("");
        }

        // Rellenar el resto como ya tenía
        document.getElementById("bruto").value = data.kilogramos_bruto;
        document.getElementById("tara").value = data.kilogramos_tara;
        document.getElementById("neto").value = data.kilogramos_neto;
        document.getElementById("kilos_faenados").value =
          data.kilogramos_faenado;
        document.getElementById("desbaste").value = data.porcentaje_desbaste;
        document.getElementById("precio_productor").value =
          data.precio_al_productor;
        document.getElementById("machos").value = data.machos;
        document.getElementById("hembras").value = data.hembras;
        document.getElementById("total_animales").value = data.total_animales;
        document.getElementById("descripcion").value = data.descripcion;

        document.getElementById("precio_matarife").value =
          data.precio_matarife;
        document.getElementById("porcentaje_comision").value =
          data.porcentaje_comision;
        document.getElementById("ganancia_comision").value =
          data.ganancia_comision;
        document.getElementById("ganancia_diferencia").value =
          data.ganancia_en_precio;
        document.getElementById("gastos_transporte").value =
          data.gastos_transporte;
        document.getElementById("ganancia_total").value = data.ganancia_total;
        document.getElementById("efectivo").value = data.efectivo;
        document.getElementById("kilos_faenados").value =
          data.kilogramos_faenado;
        document.getElementById("porcentaje_rinde").value = data.rinde;
        document.getElementById("retencion_ganancia").value =
          data.ret_ganancia;
        document.getElementById("iva").value = data.iva;
        document.getElementById("cheque_fisico").value =
          data.cheque_electronico;
        document.getElementById("cheque_fisico").value =
          data.cheque_electronico;
        document.getElementById("transferencia").value = data.transferencia;

        // Vencimientos (edición)
        const respVencimientos = await fetch(
          `https://consignataria-api.onrender.com/api/vencimientos/${data.idCargaGordo}?tipo=gordo`,
          { credentials: "include" }
        );
        const vencimientos = await respVencimientos.json();

        document.getElementById("cantidadVencimientos").value =
          vencimientos.length;
        document
          .getElementById("cantidadVencimientos")
          .dispatchEvent(new Event("change"));

        // Cargar fechas
        vencimientos.forEach((v, i) => {
          const input = document.getElementById(`vencimiento_${i + 1}`);
          if (input) input.value = v.fecha_vencimiento.split("T")[0];
        });

        // Recalcular chain (mins/habilitados) con datos cargados
        actualizarCadenaVtosGordos();

        calcularTodo();
        new bootstrap.Modal(document.getElementById("modalCRUD")).show();
      }

      if (target.classList.contains("btnVer")) {
        for (let key in data) {
          let span = document.getElementById("ver_" + key);
          if (!span) continue;

          let valor = data[key];
          // Formatear fechas
          if (key === "fecha_carga" || key === "fecha_faena") {
            valor = valor ? new Date(valor).toISOString().split("T")[0] : "";
          }
          // Agregar unidades a campos numéricos
          if (
            [
              "precio_al_productor",
              "precio_matarife",
              "monto_total",
              "ret_ganancia",
              "iva",
              "cheque_fisico",
              "cheque_electronico",
              "transferencia",
              "efectivo",
              "ganancia_comision",
              "ganancia_en_precio",
              "gastos_transporte",
              "ganancia_total",
            ].includes(key)
          ) {
            valor = valor
              ? `$ ${parseFloat(valor).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "";
          }

          if (key === "neto_con_desbaste") {
            valor = valor
              ? `${parseFloat(valor).toLocaleString("es-AR")} kg`
              : "";
          }

          if (
            [
              "kilogramos_bruto",
              "kilogramos_tara",
              "kilogramos_neto",
              "kilogramos_faenado",
            ].includes(key)
          ) {
            valor = valor
              ? `${parseFloat(valor).toLocaleString("es-AR")} kg`
              : "";
          }

          if (
            [
              "porcentaje_desbaste",
              "porcentaje_rinde",
              "porcentaje_comision",
            ].includes(key)
          ) {
            valor = valor
              ? `${parseFloat(valor).toLocaleString("es-AR")} %`
              : "";
          }

          span.textContent = valor;
        }
        // Mostrar vencimientos
        const respVencimientos = await fetch(
          `https://consignataria-api.onrender.com/api/vencimientos/${data.idCargaGordo}?tipo=gordo`,
          { credentials: "include" }
        );

        const vencimientos = await respVencimientos.json();

        const lista = document.getElementById("lista_vencimientos");
        lista.innerHTML = "";

        if (vencimientos.length === 0) {
          lista.innerHTML = "<li>Pago contado</li>";
        } else {
          vencimientos.forEach((v, i) => {
            const li = document.createElement("li");
            li.textContent = `Vencimiento ${i + 1}: ${
              v.fecha_vencimiento.split("T")[0]
            }`;
            lista.appendChild(li);
          });
        }

        new bootstrap.Modal(document.getElementById("modalVer")).show();
      }

      if (target.classList.contains("btnBorrar")) {
        Swal.fire({
          title: "¿Estás seguro?",
          text: "Esta acción no se puede deshacer",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        }).then(async (result) => {
          if (result.isConfirmed) {
            await fetch(url + data.idCargaGordo, { method: "DELETE",  credentials: "include", });
            await recargarTabla();
            Swal.fire("Eliminado", "La carga ha sido eliminada", "success");
          }
        });
      }
    });

  //Funcion para exportar excel
  document
    .getElementById("btnExportarExcel")
    .addEventListener("click", async () => {
      const datos = {
        fecha: document.getElementById("ver_fecha_carga").textContent,
        productor: document.getElementById("ver_productor").textContent,
        matarife: document.getElementById("ver_matarife").textContent,
        transporte: document.getElementById("ver_transporte").textContent,
        bruto: document.getElementById("ver_kilogramos_bruto").textContent,
        tara: document.getElementById("ver_kilogramos_tara").textContent,
        neto: document.getElementById("ver_kilogramos_neto").textContent,
        desbaste: document.getElementById("ver_porcentaje_desbaste").textContent,
        neto_con_desbaste:
          document.getElementById("ver_neto_con_desbaste").textContent,
        precio_productor:
          document.getElementById("ver_precio_al_productor").textContent,
        monto_pagar: document.getElementById("ver_monto_total").textContent,
        retencion_ganancia:
          document.getElementById("ver_ret_ganancia").textContent,
        iva: document.getElementById("ver_iva").textContent,
        cheque_fisico:
          document.getElementById("ver_cheque_fisico").textContent,
        cheque_electronico:
          document.getElementById("ver_cheque_electronico").textContent,
        transferencia: document.getElementById("ver_transferencia").textContent,
        efectivo: document.getElementById("ver_efectivo").textContent,
        machos: document.getElementById("ver_machos").textContent,
        hembras: document.getElementById("ver_hembras").textContent,
        total_animales: document.getElementById("ver_total_animales").textContent,
      };

      try {
        const response = await fetch(
          "https://consignataria-api.onrender.com/api/gordos/reporte-productor",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("No se pudo generar el reporte");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reporte_productor_${datos.fecha}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error al generar el Excel:", err);
        alert("Hubo un error al generar el reporte.");
      }
    });

  //Funcion mostrar vencimientos
  const selectCantidad = document.getElementById("cantidadVencimientos");
  const bloqueFechas = document.getElementById("bloqueVencimientosFechas");

  selectCantidad.addEventListener("change", function () {
    const cantidad = parseInt(this.value);
    bloqueFechas.style.display = cantidad === 0 ? "none" : "block";

    for (let i = 1; i <= 5; i++) {
      const grupo = document.getElementById(`grupo_vencimiento_${i}`);
      const input = document.getElementById(`vencimiento_${i}`);

      if (i <= cantidad) {
        grupo.style.display = "block";
      } else {
        grupo.style.display = "none";
        input.value = "";
      }
    }
    // al cambiar la cantidad, reencadenamos todo
    actualizarCadenaVtosGordos();
  });

  // === Reglas de encadenamiento para vencimientos ===
  // Usa las utilidades de fechas que ya definimos arriba: parseFechaFlexible() y toISO()
  function actualizarCadenaVtosGordos() {
    const cant = parseInt(document.getElementById("cantidadVencimientos")?.value || "0", 10);

    // Vto1: habilitado solo si hay al menos 1 y min = fecha_carga
    const v1 = document.getElementById("vencimiento_1");
    if (v1) {
      if (cant >= 1) {
        v1.disabled = false;
        const dCarga = parseFechaFlexible($fechaCarga?.value);
        if (dCarga) {
          v1.min = toISO(dCarga);
          if (v1.value) {
            const d1 = parseFechaFlexible(v1.value);
            if (d1 && d1 < dCarga) {
              v1.value = "";
              v1.setCustomValidity("El primer vencimiento debe ser igual o posterior a la fecha de carga.");
              v1.reportValidity();
              setTimeout(() => v1.setCustomValidity(""), 0);
            }
          }
        } else {
          v1.removeAttribute("min");
        }
      } else {
        v1.value = "";
        v1.disabled = true;
        v1.removeAttribute("min");
      }
    }

    // Del 2 al 5: habilitar solo si (i <= cant) y el anterior tiene fecha.
    for (let i = 2; i <= 5; i++) {
      const prev = document.getElementById(`vencimiento_${i-1}`);
      const curr = document.getElementById(`vencimiento_${i}`);
      if (!curr) continue;

      if (i > cant) {
        curr.value = "";
        curr.disabled = true;
        curr.removeAttribute("min");
        continue;
      }

      const dPrev = prev ? parseFechaFlexible(prev.value) : null;
      if (dPrev) {
        curr.disabled = false;
        const minNext = new Date(dPrev.getTime());
        minNext.setDate(minNext.getDate() + 1); // estrictamente posterior
        curr.min = toISO(minNext);

        if (curr.value) {
          const dCurr = parseFechaFlexible(curr.value);
          if (dCurr && dCurr < minNext) {
            curr.value = "";
            curr.setCustomValidity(`Debe ser posterior a Vencimiento ${i-1}.`);
            curr.reportValidity();
            setTimeout(() => curr.setCustomValidity(""), 0);
          }
        }
      } else {
        curr.value = "";
        curr.disabled = true;
        curr.removeAttribute("min");
      }
    }
  }

  // Escuchadores para cambios en fechas de vencimiento
  for (let i = 1; i <= 5; i++) {
    const inp = document.getElementById(`vencimiento_${i}`);
    if (inp) {
      inp.addEventListener("change", actualizarCadenaVtosGordos);
      inp.addEventListener("input", actualizarCadenaVtosGordos);
    }
  }
  if ($fechaCarga) {
    $fechaCarga.addEventListener("change", actualizarCadenaVtosGordos);
    $fechaCarga.addEventListener("input", actualizarCadenaVtosGordos);
  }

  // Inicialización al cargar
  actualizarMinFaenaSegunCarga();
  actualizarCadenaVtosGordos();

  // Estado inicial del bloque vencimientos
  selectCantidad.dispatchEvent(new Event("change"));
});
