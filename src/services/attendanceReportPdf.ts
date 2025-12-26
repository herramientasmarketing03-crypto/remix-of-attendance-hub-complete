import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ParsedBiometricReport } from '@/types/payroll';
import { DeductionSummary, formatCurrency } from './deductionCalculator';
import { formatMinutesToTime } from './biometricParser';

export interface AttendanceReportOptions {
  companyName?: string;
  reportTitle?: string;
  showDeductions?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
}

export function generateAttendancePdf(
  report: ParsedBiometricReport,
  deductions: DeductionSummary,
  options: AttendanceReportOptions = {}
): jsPDF {
  const {
    companyName = 'Empresa',
    reportTitle = 'Reporte de Asistencia',
    showDeductions = true,
    includeSummary = true,
    includeDetails = true
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.text(reportTitle, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${report.period.start} al ${report.period.end}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;

  // Summary Section
  if (includeSummary) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen General', 14, yPos);
    yPos += 8;

    const summaryData = [
      ['Total Empleados', String(report.totalEmployees)],
      ['Empleados con Coincidencia', String(report.matchedEmployees)],
      ['Empleados Sin Coincidencia', String(report.unmatchedEmployees)],
      ['Total Minutos de Tardanza', String(report.summary.totalTardyMinutes)],
      ['Total Faltas', String(report.summary.totalAbsences)],
      ['Total Minutos Salida Temprana', String(report.summary.totalEarlyLeaveMinutes)],
      ['Total Horas Extra', formatMinutesToTime(report.summary.totalOvertimeMinutes)]
    ];

    if (showDeductions) {
      summaryData.push(
        ['Empleados con Descuentos', String(deductions.employeesWithDeductions)],
        ['Total Descuento por Tardanzas', formatCurrency(deductions.totalTardyDeduction)],
        ['Total Descuento por Faltas', formatCurrency(deductions.totalAbsenceDeduction)],
        ['Total Descuento por Salidas Tempranas', formatCurrency(deductions.totalEarlyLeaveDeduction)],
        ['TOTAL DESCUENTOS', formatCurrency(deductions.grandTotalDeduction)]
      );
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Concepto', 'Valor']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { halign: 'right', cellWidth: 60 }
      },
      margin: { left: 14, right: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Detail Section - All Employees
  if (includeDetails) {
    // Check if we need a new page
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle por Empleado', 14, yPos);
    yPos += 8;

    const detailHeaders = showDeductions 
      ? ['DNI', 'Nombre', 'Área', 'H. Prog', 'H. Real', 'Tardanzas', 'Faltas', 'Descuento']
      : ['DNI', 'Nombre', 'Área', 'H. Prog', 'H. Real', 'Tardanzas', 'Min. Tard', 'Faltas'];

    const detailData = report.records.map((record, index) => {
      const deduction = deductions.deductions.find(d => d.documentId === record.documentId);
      
      if (showDeductions) {
        return [
          record.documentId,
          record.employeeName.substring(0, 20),
          record.department.substring(0, 10),
          formatMinutesToTime(record.scheduledHours),
          formatMinutesToTime(record.actualHours),
          String(record.tardyCount),
          String(record.absences),
          formatCurrency(deduction?.totalDeduction || 0)
        ];
      } else {
        return [
          record.documentId,
          record.employeeName.substring(0, 20),
          record.department.substring(0, 10),
          formatMinutesToTime(record.scheduledHours),
          formatMinutesToTime(record.actualHours),
          String(record.tardyCount),
          String(record.tardyMinutes),
          String(record.absences)
        ];
      }
    });

    autoTable(doc, {
      startY: yPos,
      head: [detailHeaders],
      body: detailData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' },
        7: { cellWidth: 22, halign: 'right' }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer on each page
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Deductions Detail Page (if there are deductions)
  if (showDeductions && deductions.employeesWithDeductions > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Descuentos', 14, yPos);
    yPos += 8;

    const deductionHeaders = ['DNI', 'Nombre', 'Min. Tard', 'Desc. Tard', 'Faltas', 'Desc. Falta', 'Total'];
    
    const deductionData = deductions.deductions
      .filter(d => d.totalDeduction > 0)
      .map(d => [
        d.documentId,
        d.employeeName.substring(0, 25),
        String(d.tardyMinutes),
        formatCurrency(d.tardyDeduction),
        String(d.absences),
        formatCurrency(d.absenceDeduction),
        formatCurrency(d.totalDeduction)
      ]);

    autoTable(doc, {
      startY: yPos,
      head: [deductionHeaders],
      body: deductionData,
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 45 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 },
      foot: [[
        '', 'TOTALES',
        String(deductions.totalTardyMinutes),
        formatCurrency(deductions.totalTardyDeduction),
        String(deductions.totalAbsences),
        formatCurrency(deductions.totalAbsenceDeduction),
        formatCurrency(deductions.grandTotalDeduction)
      ]],
      footStyles: { fillColor: [254, 226, 226], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
  }

  return doc;
}

export function downloadAttendancePdf(
  report: ParsedBiometricReport,
  deductions: DeductionSummary,
  options: AttendanceReportOptions = {}
): void {
  const doc = generateAttendancePdf(report, deductions, options);
  const filename = `reporte_asistencia_${report.period.start}_${report.period.end}.pdf`;
  doc.save(filename);
}
