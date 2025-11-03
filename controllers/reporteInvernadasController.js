const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Ruta a la plantilla única
const plantillaPath = path.join(
  __dirname,
  '../public/planillas_excel/planilla_reporte_carga_productor_invernada.xlsx'
);

exports.generarExcelInvernada = async (req, res) => {
  try {
    const { tipo, ...datos } = req.body; 
    // tipo puede ser "vendedor" o "comprador"

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(plantillaPath);
    const worksheet = workbook.getWorksheet(1);

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        const valor = cell.value;
        if (valor && typeof valor === 'string' && valor.includes('*')) {
          cell.value = valor
            .replace('*FECHA*', datos.fecha || '')
            .replace('*PRODUCTOR*', 
              tipo === 'vendedor' ? datos.productorVendedor : datos.productorComprador || '')
            .replace('*TRANSPORTE*', datos.transporte || '')
            .replace('*BRUTO*', datos.bruto || '')
            .replace('*TARA*', datos.tara || '')
            .replace('*NETO*', datos.neto || '')
            .replace('*DESBASTE*', datos.desbaste || '')
            .replace('*NETO_DESBASTE*', datos.neto_con_desbaste || '')
            .replace('*PRECIO_PRODUCTOR*', 
              tipo === 'vendedor' ? datos.precio_productor_vendedor : datos.precio_productor_comprador || '')
            .replace('*MONTO_PAGAR*',
              tipo ==='vendedor' ? datos.monto_pagar : datos.monto_a_pagar_comprador|| '')
            .replace('*IVA*', 
              tipo === 'vendedor' ? datos.iva_vendedor : datos.iva_comprador || '')
            .replace('*CHEQUE_FISICO*', 
              tipo === 'vendedor' ? datos.cheque_fisico_vendedor : datos.cheque_fisico_comprador || '')
            .replace('*CHEQUE*', 
              tipo === 'vendedor' ? datos.cheque_electronico_vendedor : datos.cheque_electronico_comprador || '')
            .replace('*TRANSFERENCIA*', 
              tipo === 'vendedor' ? datos.transferencia_vendedor : datos.transferencia_comprador || '')
            .replace('*EFECTIVO*', 
              tipo === 'vendedor' ? datos.efectivo_vendedor : datos.efectivo_comprador || '')
            .replace('*MACHOS*', datos.machos || '')
            .replace('*HEMBRAS*', datos.hembras || '')
            .replace('*TOTAL_ANIMALES*', datos.total_animales || '')
            .replace('*COMISION*', 
              tipo === 'vendedor' ? datos.porcentaje_comision_vendedor : datos.porcentaje_comision_comprador || '')
            .replace('*MONTO_COMISION*', 
              tipo === 'vendedor' ? datos.ganancia_comision_vendedor : datos.ganancia_comision_comprador || '')
            .replace('*SUBTOTAL_MAS_IVA*', 
              tipo === 'vendedor' ? datos.monto_total_con_iva : datos.monto_a_pagar_comprador_con_iva || '');
        }
      });
    });

    // Nombre dinámico según el tipo
    const nombreArchivo = `reporte_${tipo}_${Date.now()}.xlsx`;
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


