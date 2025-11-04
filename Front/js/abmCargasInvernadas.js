document.addEventListener("DOMContentLoaded", async function () {
  const url = "https://consignataria-api.onrender.com/api/invernadas/";
  let opcion = null;
  let tablaCargas;
  let idCargaEnEdicion = null;

 
// Carga la lista de Productores Vendedores en el select del formulario
async function cargarProductoresVendedores() {
  try {
    const response = await fetch("https://consignataria-api.onrender.com/api/productores", {
      credentials: 'include' // Si usas JWT con cookies
    });
    const productores = await response.json();
    const select = document.getElementById("productor_vendedor");
    select.innerHTML = "<option value=''>Seleccione un Productor</option>";
    productores.forEach(p => {
      select.innerHTML += `<option value="${p.idProductor}">${p.razón_social}</option>`;
    });
  } catch (error) {
    console.error("Error cargando productores:", error);
  }
}

// Carga la lista de Productores Compradores en el select del formulario
async function cargarProductoresCompradores() {
  try {
    const response = await fetch("https://consignataria-api.onrender.com/api/productores", {
      credentials: 'include'
    });
    const productores = await response.json();
    const select = document.getElementById("productor_comprador");
    select.innerHTML = "<option value=''>Seleccione un Productor</option>";
    productores.forEach(p => {
      select.innerHTML += `<option value="${p.idProductor}">${p.razón_social}</option>`;
    });
  } catch (error) {
    console.error("Error cargando productores:", error);
  }
}


// Carga la lista de Transportes en el select del formulario
async function cargarTransportes() {
  try {
    const response = await fetch("https://consignataria-api.onrender.com/api/transportes", {
      credentials: 'include'
    });
    const transportes = await response.json();
    const select = document.getElementById("transporte");
    select.innerHTML = "<option value=''>Seleccione un Transporte</option>";
    transportes.forEach(t => {
      select.innerHTML += `<option value="${t.idTransporte}">${t.razón_social}</option>`;
    });
  } catch (error) {
    console.error("Error cargando transportes:", error);
  }
}

// Funcion para autocalcular todo
function calcularTodo() {
  const bruto = parseFloat(document.getElementById("bruto").value) || 0;
  const tara = parseFloat(document.getElementById("tara").value) || 0;
  const desbaste = parseFloat(document.getElementById("desbaste").value) || 0;
  const precioProductorVendedor = parseFloat(document.getElementById("precio_productor_vendedor").value) || 0;
  const precioProductorComprador = parseFloat(document.getElementById("precio_productor_comprador").value) || 0;
  const porcentajeComisionVendedor = parseFloat(document.getElementById("porcentaje_comision_vendedor").value) || 0;
  const porcentajeComisionComprador = parseFloat(document.getElementById("porcentaje_comision_comprador").value) || 0;
  const porcentajeComisionIntermediario = parseFloat(document.getElementById("porcentaje_comision_intermediario").value) || 0;
  const machos = parseInt(document.getElementById("machos").value) || 0;
  const hembras = parseInt(document.getElementById("hembras").value) || 0;
  
  const chequeFisicoVendedor = parseFloat(document.getElementById("cheque_fisico_vendedor").value) || 0;
  const chequeElectronicoVendedor = parseFloat(document.getElementById("cheque_electronico_vendedor").value) || 0;
  const transferenciaVendedor = parseFloat(document.getElementById("transferencia_vendedor").value) || 0;

  const chequeFisicoComprador = parseFloat(document.getElementById("cheque_fisico_comprador").value) || 0;
  const chequeElectronicoComprador = parseFloat(document.getElementById("cheque_electronico_comprador").value) || 0;
  const transferenciaComprador = parseFloat(document.getElementById("transferencia_comprador").value) || 0;

  const gastosTransporte = parseFloat(document.getElementById("gastos_transporte").value) || 0;

  // Neto = Bruto - Tara
  const neto = bruto - tara;
  document.getElementById("neto").value = neto > 0 ? neto.toFixed(2) : 0;

  // Neto con Desbaste
  const netoConDesbaste = neto - (neto * desbaste / 100);
  document.getElementById("neto_con_desbaste").value = netoConDesbaste > 0 ? netoConDesbaste.toFixed(2) : 0;

  // Monto subtotal a pagar al productor vendedor (sin iva)
  const montoPagarProductorVendedor = netoConDesbaste * precioProductorVendedor;
  document.getElementById("monto_pagar").value = montoPagarProductorVendedor > 0 ? montoPagarProductorVendedor.toFixed(2) : 0;

  // IVA vendedor
  const ivaVendedor= (montoPagarProductorVendedor * 0.105)
  document.getElementById("iva_vendedor").value = ivaVendedor.toFixed(2);

  // Subtotal comprador
  const subtotalComprador = netoConDesbaste * precioProductorComprador;
  document.getElementById("subtotal_comprador").value = subtotalComprador > 0 ? subtotalComprador.toFixed(2) : 0;

  // IVA comprador
  const ivaComprador= (subtotalComprador * 0.105)
  document.getElementById("iva_comprador").value = ivaComprador.toFixed(2);
  
  //  Total Animales
  document.getElementById("total_animales").value = machos + hembras;

  //  Ganancia Comisión Vendedor
  const gananciaComisionVendedor = ((netoConDesbaste * precioProductorVendedor) * porcentajeComisionVendedor) / 100;
  document.getElementById("ganancia_comision_vendedor").value = gananciaComisionVendedor.toFixed(2);

  //  Ganancia Comisión Comprador
  const gananciaComisionComprador = ((netoConDesbaste * precioProductorComprador) * porcentajeComisionComprador) / 100;
  document.getElementById("ganancia_comision_comprador").value = gananciaComisionComprador.toFixed(2);

  // Ganancia Diferencia en Precio
  const gananciaDiferencia = (precioProductorComprador - precioProductorVendedor) * netoConDesbaste;
  document.getElementById("ganancia_diferencia").value = gananciaDiferencia.toFixed(2);

  //  Gastos Comisión Intermediario (nuevo cálculo)
  const gastosComisionIntermediario = (montoPagarProductorVendedor * porcentajeComisionIntermediario) / 100;
  document.getElementById("gastos_comision_intermediario").value = gastosComisionIntermediario.toFixed(2);

  // Ganancia Total
  const gananciaTotal = (gananciaComisionVendedor + gananciaComisionComprador + gananciaDiferencia)
                      - gastosTransporte - gastosComisionIntermediario;
  document.getElementById("ganancia_total").value = gananciaTotal.toFixed(2);

  // Efectivo Vendedor
  const efectivoVendedor = montoPagarProductorVendedor - chequeFisicoVendedor - chequeElectronicoVendedor - transferenciaVendedor;
  document.getElementById("efectivo_vendedor").value = efectivoVendedor > 0 ? efectivoVendedor.toFixed(2) : 0;

  // Total Vendedor (con iva incluido)
  const totalVendedor = montoPagarProductorVendedor + ivaVendedor;
  document.getElementById("total_vendedor").value = totalVendedor > 0 ? totalVendedor.toFixed(2) : 0;


  // Efectivo Comprador
  const efectivoComprador = (netoConDesbaste * precioProductorComprador) - chequeFisicoComprador - chequeElectronicoComprador - transferenciaComprador;
  document.getElementById("efectivo_comprador").value = efectivoComprador > 0 ? efectivoComprador.toFixed(2) : 0;


  // Total a pagar por el comprador (con IVA)
  const montoPagarPorComprador = subtotalComprador + ivaComprador;
  document.getElementById("monto_a_pagar_comprador").value = montoPagarPorComprador > 0 ? montoPagarPorComprador.toFixed(2) : 0;


}

// Escuchar cambios
document.addEventListener("input", calcularTodo);

// Obtiene todas las cargas desde la API
async function obtenerCargas() {
  try {
    const res = await fetch(url, {
      credentials: 'include'    
    });
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
    dom: '<"row"<"col-sm-6"l><"col-sm-6"f>>' +
         '<"row"<"col-sm-12"tr>>' +
         '<"row"<"col-sm-5"i><"col-sm-7"p>>' +
         '<"row"<"col-sm-12"B>>',
    buttons: [/* Botones de exportación */],
    data: data,
    columns: [
      { data: "idCargaInvernada" },
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
      { data: "productor_vendedor" },
      { data: "productor_comprador" },
      { data: "transporte" },
      { data: "descripcion" },
      {
        defaultContent: `
          <div class='text-center'>
            <button class='btn btnVer btn-sm'><i class="bi bi-eye"></i></button>
            <button class='btn btnEditar btn-sm'><i class="bi bi-pencil-square"></i></button>
            <button class='btn btnBorrar btn-sm'><i class="bi bi-trash"></i></button>
          </div>`
      }
    ],
    language: { url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"}
  });
}


// Ejecuta la carga inicial de la tabla al cargar la página
  await inicializarTabla();

// Recarga la tabla con datos actualizados desde la API
  async function recargarTabla() {
    const data = await obtenerCargas();
    tablaCargas.clear().rows.add(data).draw();
  }


// Abre el modal para crear una nueva carga y prepara el formulario
  document.getElementById("btnCrear").addEventListener("click", function () {

    opcion = "crear";  // Bandera para saber que estamos creando
    idCargaEnEdicion = null; // Limpia el ID al crear
    document.getElementById("formCarga").reset();  // Limpia el formulario

    // Carga los select con los datos actualizados
    cargarProductoresVendedores();
    cargarProductoresCompradores();
    cargarTransportes();

    // 🔁 reset vencimientos a "Contado" (ocultos, vacíos y deshabilitados)
    resetVencimientosInv();

    // Cambia el título del modal
    document.querySelector("#modalCRUD .modal-title").textContent = "Crear Carga Invernada";

    // Abre el modal usando Bootstrap 5
    const modal = new bootstrap.Modal(document.getElementById("modalCRUD"));
    modal.show();
});

// Envía los datos del formulario para crear o editar una carga
 document.getElementById("formCarga").addEventListener("submit", async function (e) {
    e.preventDefault();
    e.stopPropagation();

    console.log("Abriendo modal de creación...");
    console.log("OPCION:", opcion);

    const idProductorVendedor = document.getElementById("productor_vendedor").value;
    const idProductorComprador = document.getElementById("productor_comprador").value;
    const idTransporte = document.getElementById("transporte").value;

    if (!idProductorVendedor || !idProductorComprador || !idTransporte) {
        Swal.fire("Error", "Debe seleccionar Productores y Transporte", "warning");
        return;
    }

    const datos = {
        idProductorVendedor,
        idProductorComprador,
        idTransporte,
        fecha_carga: document.getElementById("fecha_carga").value,

        kilogramos_bruto: parseFloat(document.getElementById("bruto").value) || 0,
        kilogramos_tara: parseFloat(document.getElementById("tara").value) || 0,
        porcentaje_desbaste: parseFloat(document.getElementById("desbaste").value) || 0,
        precio_al_vendedor: parseFloat(document.getElementById("precio_productor_vendedor").value) || 0,
        precio_al_comprador: parseFloat(document.getElementById("precio_productor_comprador").value) || 0,
        machos: parseInt(document.getElementById("machos").value) || 0,
        hembras: parseInt(document.getElementById("hembras").value) || 0,
        descripcion: document.getElementById("descripcion").value || "",

        cheque_fisico_vendedor: parseFloat(document.getElementById("cheque_fisico_vendedor").value) || 0,
        cheque_electronico_vendedor: parseFloat(document.getElementById("cheque_electronico_vendedor").value) || 0,
        transferencia_vendedor: parseFloat(document.getElementById("transferencia_vendedor").value) || 0,
        
        cheque_fisico_comprador: parseFloat(document.getElementById("cheque_fisico_comprador").value) || 0,
        cheque_electronico_comprador: parseFloat(document.getElementById("cheque_electronico_comprador").value) || 0,
        transferencia_comprador: parseFloat(document.getElementById("transferencia_comprador").value) || 0,



        porcentaje_comision_vendedor: parseFloat(document.getElementById("porcentaje_comision_vendedor").value) || 0,
        porcentaje_comision_comprador: parseFloat(document.getElementById("porcentaje_comision_comprador").value) || 0,
        porcentaje_comision_intermediario: parseFloat(document.getElementById("porcentaje_comision_intermediario").value) || 0,
        gastos_comision_intermediario: parseFloat(document.getElementById("gastos_comision_intermediario").value) || 0,
        gastos_transporte: parseFloat(document.getElementById("gastos_transporte").value) || 0,



};


// Captura de fechas de vencimientos
const cantidadVencimientos = parseInt(document.getElementById("cantidadVencimientos").value);
datos.cantidad_vencimientos = cantidadVencimientos;
datos.fechas_vencimiento = [];
datos.tipo_carga = "invernada";

for (let i = 1; i <= cantidadVencimientos; i++) {
  const fecha = document.getElementById(`vencimiento_${i}`).value;
  if (fecha) datos.fechas_vencimiento.push(fecha);
}


    // Solo en modo edición, agregamos el ID de la carga
    if (opcion === "editar") {
        datos.idCargaInvernada = idCargaEnEdicion;
    }

    const metodo = opcion === "crear" ? "POST" : "PUT";
    const endpoint = opcion === "crear" ? url : `${url}${idCargaEnEdicion}`;


    console.log("Método:", metodo, "Endpoint:", endpoint);

try {
  const response = await fetch(endpoint, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
    credentials: "include"
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error del servidor:", errorText);
    Swal.fire("Error", "No se pudo guardar la carga. Ver consola.", "error");
    return;
  }

  const resultado = await response.json();
  console.log("✅ Guardado exitoso:", resultado);

  await recargarTabla();
  bootstrap.Modal.getInstance(document.getElementById("modalCRUD")).hide();
  Swal.fire("Éxito", opcion === "crear" ? "Carga creada correctamente" : "Carga actualizada correctamente", "success");

} catch (err) {
  console.error("❌ Error en el fetch:", err);
  Swal.fire("Error", "Hubo un error al comunicar con el servidor.", "error");
}

});



// Maneja los botones Ver, Editar y Borrar dentro de la tabla
  document.getElementById("tablaCargas").addEventListener("click", async function (event) {
    let target = event.target.tagName === "I" ? event.target.closest("button") : event.target;
    let fila = target.closest("tr");
    let data = tablaCargas.row(fila).data();


if (target.classList.contains("btnEditar")) {
  opcion = "editar";
  idCargaEnEdicion = data.idCargaInvernada; // Guarda el ID de la carga a editar
  document.querySelector("#modalCRUD .modal-title").textContent = "Editar Carga Invernada";

  // Cargar opciones
  await cargarProductoresVendedores();
  await cargarProductoresCompradores();
  await cargarTransportes();

  // Insertar como primera opción la actual (solo si existe)
  const productorVendedorSelect = document.getElementById("productor_vendedor");
  productorVendedorSelect.insertAdjacentHTML('afterbegin', `<option value="${data.idProductorVendedor}" selected>${data.productor_vendedor}</option>`);

  const productorCompradorSelect = document.getElementById("productor_comprador");
  productorCompradorSelect.insertAdjacentHTML('afterbegin', `<option value="${data.idProductorComprador}" selected>${data.productor_comprador}</option>`);

  const transporteSelect = document.getElementById("transporte");
  transporteSelect.insertAdjacentHTML('afterbegin', `<option value="${data.idTransporte}" selected>${data.transporte}</option>`);

  // Pongo los valores del objeto dentro de los input del modal con la informacion actual de la carga
  document.getElementById("fecha_carga").value = data.fecha_carga.split('T')[0];
  document.getElementById("bruto").value = data.kilogramos_bruto;
  document.getElementById("tara").value = data.kilogramos_tara;
  
  document.getElementById("desbaste").value = data.porcentaje_desbaste;
  document.getElementById("precio_productor_vendedor").value = data.precio_al_vendedor;
  document.getElementById("precio_productor_comprador").value = data.precio_al_comprador;
  document.getElementById("machos").value = data.machos;
  document.getElementById("hembras").value = data.hembras;
  
  document.getElementById("descripcion").value = data.descripcion;

  document.getElementById("porcentaje_comision_vendedor").value = data.porcentaje_comision_vendedor;
  document.getElementById("porcentaje_comision_comprador").value = data.porcentaje_comision_comprador;
  document.getElementById("porcentaje_comision_intermediario").value = data.porcentaje_comision_intermediario || 0;

  document.getElementById("gastos_transporte").value = data.gastos_transporte;
  document.getElementById("ganancia_total").value = data.ganancia_total;
  

  document.getElementById("cheque_fisico_vendedor").value = data.cheque_fisico_vendedor;
  document.getElementById("cheque_electronico_vendedor").value = data.cheque_electronico_vendedor;
  document.getElementById("transferencia_vendedor").value = data.transferencia_vendedor;

  document.getElementById("cheque_fisico_comprador").value = data.cheque_fisico_comprador;
  document.getElementById("cheque_electronico_comprador").value = data.cheque_electronico_comprador;
  document.getElementById("transferencia_comprador").value = data.transferencia_comprador;
  
// 🔽 NUEVO BLOQUE PARA TRAER Y MOSTRAR VENCIMIENTOS
const respVencimientos = await fetch(`https://consignataria-api.onrender.com/api/vencimientos/${data.idCargaInvernada}?tipo=Invernada`, {
  credentials: "include"
});
const vencimientos = await respVencimientos.json();

// Establece cantidad en el selector y actualiza la visibilidad
document.getElementById("cantidadVencimientos").value = vencimientos.length;
document.getElementById("cantidadVencimientos").dispatchEvent(new Event('change'));

// Carga fechas
vencimientos.forEach((v, i) => {
  const input = document.getElementById(`vencimiento_${i + 1}`);
  if (input) input.value = v.fecha_vencimiento.split("T")[0];
});

// Recalcula las restricciones de mínimos entre vencimientos ya cargados
if (typeof actualizarCadenaVtos === "function") actualizarCadenaVtos();

// 🔁 Recalcular campos autogenerados antes de abrir el modal
calcularTodo();

  new bootstrap.Modal(document.getElementById("modalCRUD")).show();
}



if (target.classList.contains("btnVer")) {
  for (let key in data) {
    console.log(Object.keys(data));

    let span = document.getElementById("ver_" + key);
    if (!span) continue;

    let valor = data[key];

    // Formatear fechas
    if (key === "fecha_carga") {
      valor = valor ? new Date(valor).toISOString().split('T')[0] : '';
    }

    // Agregar unidades a campos numéricos
    if (["precio_al_vendedor", "precio_al_comprador",
      "monto_total", "monto_total_con_iva",
     "monto_a_pagar_comprador", "monto_a_pagar_comprador_con_iva",
      "iva_vendedor", "iva_comprador",
      "cheque_fisico_vendedor", "cheque_electronico_vendedor", "transferencia_vendedor", "efectivo_vendedor",
      "cheque_fisico_comprador", "cheque_electronico_comprador", "transferencia_comprador", "efectivo_comprador",
      "ganancia_comision_vendedor", "ganancia_comision_comprador", "ganancia_en_precio",
      "gastos_transporte", "gastos_comision_intermediario", "ganancia_total"].includes(key)) {
      valor = valor
      ? `$ ${parseFloat(valor).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '';
    }

    if (key === "neto_con_desbaste") {
        valor = valor ? `${parseFloat(valor).toLocaleString('es-AR')} kg` : '';
      }

    if (["kilogramos_bruto", "kilogramos_tara", "kilogramos_neto"].includes(key)) {
        valor = valor ? `${parseFloat(valor).toLocaleString('es-AR')} kg` : '';
      }

    if (["porcentaje_desbaste", "porcentaje_comision_vendedor", "porcentaje_comision_comprador", "porcentaje_comision_intermediario"].includes(key)) {
  valor = valor ? `${parseFloat(valor).toLocaleString('es-AR')} %` : '';
  }


    span.textContent = valor;
  }

    // 🔽 Mostrar vencimientos
const respVencimientos = await fetch(`https://consignataria-api.onrender.com/api/vencimientos/${data.idCargaInvernada}?tipo=Invernada`, {
  credentials: "include"
});
const vencimientos = await respVencimientos.json();

const lista = document.getElementById("lista_vencimientos");
lista.innerHTML = "";

if (vencimientos.length === 0) {
  lista.innerHTML = "<li>Pago contado</li>";
} else {
  vencimientos.forEach((v, i) => {
    const li = document.createElement("li");
    li.textContent = `Vencimiento ${i + 1}: ${v.fecha_vencimiento.split("T")[0]}`;
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
        cancelButtonText: "Cancelar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          await fetch(url + data.idCargaInvernada, { method: "DELETE", credentials: "include" });
          await recargarTabla();
          Swal.fire("Eliminado", "La carga ha sido eliminada", "success");
        }
      });
    }
  });


//Funcion para exportar excel
 // Reporte Vendedor
document.getElementById("btnExportarExcelVendedor").addEventListener("click", () => {
  const datos = obtenerDatosReporte();
  datos.tipo = "vendedor";
  generarReporteExcel(datos);
});

// Reporte Comprador
document.getElementById("btnExportarExcelComprador").addEventListener("click", () => {
  const datos = obtenerDatosReporte();
  datos.tipo = "comprador";
  generarReporteExcel(datos);
});

function obtenerDatosReporte() {
  return {
    fecha: document.getElementById("ver_fecha_carga").textContent,
    productorVendedor: document.getElementById("ver_productor_vendedor").textContent,
    productorComprador: document.getElementById("ver_productor_comprador").textContent,
    transporte: document.getElementById("ver_transporte").textContent,
    bruto: document.getElementById("ver_kilogramos_bruto").textContent,
    tara: document.getElementById("ver_kilogramos_tara").textContent,
    neto: document.getElementById("ver_kilogramos_neto").textContent,
    desbaste: document.getElementById("ver_porcentaje_desbaste").textContent,
    neto_con_desbaste: document.getElementById("ver_neto_con_desbaste").textContent,
    precio_productor_vendedor: document.getElementById("ver_precio_al_vendedor").textContent,
    precio_productor_comprador: document.getElementById("ver_precio_al_comprador").textContent,
    monto_pagar: document.getElementById("ver_monto_total").textContent,
    iva_vendedor: document.getElementById("ver_iva_vendedor").textContent,
    iva_comprador: document.getElementById("ver_iva_comprador").textContent,
    cheque_fisico_vendedor: document.getElementById("ver_cheque_fisico_vendedor").textContent,
    cheque_fisico_comprador: document.getElementById("ver_cheque_fisico_comprador").textContent,
    cheque_electronico_vendedor: document.getElementById("ver_cheque_electronico_vendedor").textContent,
    cheque_electronico_comprador: document.getElementById("ver_cheque_electronico_comprador").textContent,
    transferencia_vendedor: document.getElementById("ver_transferencia_vendedor").textContent,
    transferencia_comprador: document.getElementById("ver_transferencia_comprador").textContent,
    efectivo_vendedor: document.getElementById("ver_efectivo_vendedor").textContent,
    efectivo_comprador: document.getElementById("ver_efectivo_comprador").textContent,
    machos: document.getElementById("ver_machos").textContent,
    hembras: document.getElementById("ver_hembras").textContent,
    total_animales: document.getElementById("ver_total_animales").textContent,
    monto_a_pagar_comprador: document.getElementById("ver_monto_a_pagar_comprador").textContent,
    porcentaje_comision_vendedor: document.getElementById("ver_porcentaje_comision_vendedor").textContent,
    porcentaje_comision_comprador: document.getElementById("ver_porcentaje_comision_comprador").textContent,
    ganancia_comision_vendedor: document.getElementById("ver_ganancia_comision_vendedor").textContent,
    ganancia_comision_comprador: document.getElementById("ver_ganancia_comision_comprador").textContent,
    monto_total_con_iva: document.getElementById("ver_monto_total_con_iva").textContent,
    monto_a_pagar_comprador_con_iva: document.getElementById("ver_monto_a_pagar_comprador_con_iva").textContent,
  };
}

async function generarReporteExcel(datos) {
  try {
    const response = await fetch("https://consignataria-api.onrender.com/api/invernadas/reporte", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
      credentials: "include"
    });

    if (!response.ok) throw new Error("No se pudo generar el reporte");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_${datos.tipo}_${datos.fecha}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error al generar el Excel:", err);
    Swal.fire("Error", "Hubo un error al generar el reporte.", "error");
  }
}



//Funcion mostrar vencimientos
//  Obtiene el elemento <select> donde el usuario elige la cantidad de vencimientos
const selectCantidad = document.getElementById('cantidadVencimientos');

//  Obtiene el contenedor que agrupa todos los inputs de fechas de vencimiento
const bloqueFechas = document.getElementById('bloqueVencimientosFechas');

// Escucha cuando cambia el valor del select (ej: de 0 a 3 vencimientos)
selectCantidad.addEventListener('change', function () {
  
  // Convierte el valor seleccionado (string) a número entero
  const cantidad = parseInt(this.value);

  // Si la cantidad es 0 → oculta el bloque, si no → lo muestra
  bloqueFechas.style.display = cantidad === 0 ? 'none' : 'block';

  // Recorre del 1 al 5, porque podés tener hasta 5 vencimientos
  for (let i = 1; i <= 5; i++) {
    // Obtiene el <div> que agrupa cada input de fecha de vencimiento
    const grupo = document.getElementById(`grupo_vencimiento_${i}`);
    // Obtiene el input de la fecha (dentro del grupo)
    const input = document.getElementById(`vencimiento_${i}`);

    // Si el índice i es menor o igual a la cantidad elegida → muestra el input
    if (i <= cantidad) {
      grupo.style.display = 'block';
      input.disabled = false; // 🔁 habilitamos; el encadenado ajusta después
    } else {
      // Si no, oculta el grupo e inicializa el input vacío
      grupo.style.display = 'none';
      input.value = '';
      input.disabled = true;   // 🔁 también lo deshabilitamos
      input.removeAttribute('min');
    }
  }
});


// 🔒 Encadenar vencimientos: si el i está vacío, el (i+1) queda bloqueado.
// También aplica el "min" del siguiente = fecha del anterior + 1 día.
function actualizarCadenaVtos() {
  const $selCant     = document.getElementById('cantidadVencimientos');
  const $fechaCarga  = document.getElementById('fecha_carga');

  function toISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function parseFecha(str) {
    if (!str) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y,m,d] = str.split('-').map(Number);
      return new Date(y,m-1,d);
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
      const [d,m,y] = str.split('/').map(Number);
      return new Date(y,m-1,d);
    }
    return null;
  }

  const cant = parseInt($selCant.value || "0", 10);

  // Siempre habilitar Vto1 si está visible; su "min" es la fecha de carga.
  const v1 = document.getElementById('vencimiento_1');
  if (v1) {
    v1.disabled = cant < 1;
    const dCarga = parseFecha($fechaCarga?.value);
    if (dCarga) v1.min = toISO(dCarga); else v1.removeAttribute('min');
  }

  // Del 2 al 5: sólo habilitar si el anterior tiene fecha cargada.
  for (let i = 2; i <= 5; i++) {
    const prev = document.getElementById(`vencimiento_${i-1}`);
    const curr = document.getElementById(`vencimiento_${i}`);

    if (!curr) continue;

    if (i > cant) {
      curr.value = "";
      curr.disabled = true;
      curr.removeAttribute('min');
      continue;
    }

    const dPrev = prev ? parseFecha(prev.value) : null;

    if (dPrev) {
      curr.disabled = false;
      const minNext = new Date(dPrev);
      minNext.setDate(minNext.getDate() + 1); // estrictamente posterior
      curr.min = toISO(minNext);

      if (curr.value) {
        const dCurr = parseFecha(curr.value);
        if (dCurr && dCurr < minNext) curr.value = "";
      }
    } else {
      curr.value = "";
      curr.disabled = true;
      curr.removeAttribute('min');
    }
  }
}

// ✅ Hacemos que el encadenado se ejecute en todos los cambios relevantes
(function attachCadenaListeners(){
  const $selCant     = document.getElementById('cantidadVencimientos');
  const $fechaCarga  = document.getElementById('fecha_carga');
  $selCant.addEventListener('change', actualizarCadenaVtos);
  if ($fechaCarga) {
    $fechaCarga.addEventListener('change', actualizarCadenaVtos);
    $fechaCarga.addEventListener('input',  actualizarCadenaVtos);
  }
  for (let i = 1; i <= 5; i++) {
    const v = document.getElementById(`vencimiento_${i}`);
    if (v) {
      v.addEventListener('change', actualizarCadenaVtos);
      v.addEventListener('input',  actualizarCadenaVtos);
    }
  }
})();


// 🔁 Reset de vencimientos (deja "Contado", oculta, limpia y deshabilita todo)
function resetVencimientosInv() {
  const sel = document.getElementById('cantidadVencimientos');
  if (!sel) return;
  sel.value = "0";
  sel.dispatchEvent(new Event('change')); // esto oculta el bloque y limpia

  for (let i = 1; i <= 5; i++) {
    const v = document.getElementById(`vencimiento_${i}`);
    if (!v) continue;
    v.value = "";
    v.disabled = true;
    v.removeAttribute('min');
  }
  actualizarCadenaVtos();
}


// Inicializar correctamente al cargar
selectCantidad.dispatchEvent(new Event('change'));
actualizarCadenaVtos();

});
