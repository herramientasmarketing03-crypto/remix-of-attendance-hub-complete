import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Excel Export
export function exportToExcel<T extends object>(
  data: T[],
  fileName: string,
  sheetName: string = 'Datos'
): void {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Auto-size columns
    const firstRow = data[0] || {};
    const colWidths = Object.keys(firstRow).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String((row as Record<string, unknown>)[key] || '').length)) + 2
    }));
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Error al exportar a Excel');
  }
}

// PDF Export
export function exportToPDF<T extends object>(
  data: T[],
  fileName: string,
  title: string,
  columns: { header: string; dataKey: string }[]
): void {
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(title, 14, 22);
    
    // Subtitle with date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-PE')}`, 14, 30);
    
    // Table
    const tableData = data as Record<string, unknown>[];
    autoTable(doc, {
      startY: 35,
      head: [columns.map(col => col.header)],
      body: tableData.map(row => columns.map(col => String(row[col.dataKey] ?? ''))),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });
    
    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Error al exportar a PDF');
  }
}

// Attendance Report Export
export interface AttendanceReportRow {
  empleado: string;
  departamento: string;
  diasTrabajados: number;
  tardanzas: number;
  minutosTardanza: number;
  ausencias: number;
  horasExtra: number;
}

export function exportAttendanceReport(
  data: AttendanceReportRow[],
  format: 'excel' | 'pdf',
  period: string
): void {
  const fileName = `reporte-asistencia-${period}`;
  
  if (format === 'excel') {
    exportToExcel(data, fileName, 'Asistencia');
  } else {
    exportToPDF(data, fileName, `Reporte de Asistencia - ${period}`, [
      { header: 'Empleado', dataKey: 'empleado' },
      { header: 'Departamento', dataKey: 'departamento' },
      { header: 'Días Trabajados', dataKey: 'diasTrabajados' },
      { header: 'Tardanzas', dataKey: 'tardanzas' },
      { header: 'Min. Tardanza', dataKey: 'minutosTardanza' },
      { header: 'Ausencias', dataKey: 'ausencias' },
      { header: 'Horas Extra', dataKey: 'horasExtra' },
    ]);
  }
}

// Payroll Report Export
export interface PayrollReportRow {
  empleado: string;
  cargo: string;
  sueldoBruto: number;
  descuentos: number;
  sueldoNeto: number;
  tardanzas: number;
}

export function exportPayrollReport(
  data: PayrollReportRow[],
  format: 'excel' | 'pdf',
  period: string
): void {
  const fileName = `reporte-nomina-${period}`;
  
  if (format === 'excel') {
    exportToExcel(data, fileName, 'Nómina');
  } else {
    exportToPDF(data, fileName, `Reporte de Nómina - ${period}`, [
      { header: 'Empleado', dataKey: 'empleado' },
      { header: 'Cargo', dataKey: 'cargo' },
      { header: 'Sueldo Bruto', dataKey: 'sueldoBruto' },
      { header: 'Descuentos', dataKey: 'descuentos' },
      { header: 'Sueldo Neto', dataKey: 'sueldoNeto' },
      { header: 'Min. Tardanza', dataKey: 'tardanzas' },
    ]);
  }
}
