const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Ruta absoluta a la plantilla dentro de public/planillas_excel
const plantillaPath = path.join(__dirname, '../public/planillas_excel/planilla_reporte_carga_productor.xlsx');

exports.generarExcelProductor = async (req, res) => {
  try {
    const datos = req.body;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(plantillaPath);
    const worksheet = workbook.getWorksheet(1);

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        const valor = cell.value;
        if (valor && typeof valor === 'string' && valor.includes('*')) {
          if (valor.includes('*FECHA*')) cell.value = datos.fecha;
          if (valor.includes('*PRODUCTOR*')) cell.value = datos.productor;
          if (valor.includes('*MATARIFE*')) cell.value = datos.matarife;
          if (valor.includes('*TRANSPORTE*')) cell.value = datos.transporte;
          if (valor.includes('*BRUTO*')) cell.value = datos.bruto;
          if (valor.includes('*TARA*')) cell.value = datos.tara;
          if (valor.includes('*NETO*')) cell.value = datos.neto;
          if (valor.includes('*DESBASTE*')) cell.value = datos.desbaste;
          if (valor.includes('*NETO_DESBASTE*')) cell.value = datos.neto_con_desbaste;
          if (valor.includes('*PRECIO_PRODUCTOR*')) cell.value = datos.precio_productor;
          if (valor.includes('*MONTO_PAGAR*')) cell.value = datos.monto_pagar;
          if (valor.includes('*RET_GANANCIA*')) cell.value = datos.retencion_ganancia;
          if (valor.includes('*IVA*')) cell.value = datos.iva;
          if (valor.includes('*CHEQUE_FISICO*')) cell.value = datos.cheque_fisico;
          if (valor.includes('*CHEQUE*')) cell.value = datos.cheque_electronico;
          if (valor.includes('*TRANSFERENCIA*')) cell.value = datos.transferencia;
          if (valor.includes('*EFECTIVO*')) cell.value = datos.efectivo;
          if (valor.includes('*MACHOS*')) cell.value = datos.machos;
          if (valor.includes('*HEMBRAS*')) cell.value = datos.hembras;
          if (valor.includes('*TOTAL_ANIMALES*')) cell.value = datos.total_animales
        }
      });
    });

    const nombreArchivo = `reporte_productor_${Date.now()}.xlsx`;
    const rutaTemporal = path.join(__dirname, '../public/planillas_excel/', nombreArchivo);

    await workbook.xlsx.writeFile(rutaTemporal);

    res.download(rutaTemporal, nombreArchivo, (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err);
      } else {
        setTimeout(() => {
          try {
            fs.unlinkSync(rutaTemporal);
          } catch (e) {
            console.warn('No se pudo eliminar el archivo temporal:', e.message);
          }
        }, 10000);
      }
    });
  } catch (error) {
    console.error('Error generando el Excel:', error);
    res.status(500).send('Error al generar el Excel');
  }
};



