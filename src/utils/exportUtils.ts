import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MaintenanceItem, Transaction, UserProfile } from '../types';
import { calculateMaintenanceStatus, formatCurrency, formatDatePtBR } from './formatters';

export const exportTransactionsToCSV = (
  transactions: Transaction[],
  fileName = 'relatorio-financeiro-autonomo.csv'
) => {
  // Brazilian CSV standard: Semicolon separated, UTF-8 BOM for Excel compatibility
  const headers = [
    'ID',
    'Data',
    'Tipo Conta',
    'Natureza',
    'Categoria',
    'Descricao',
    'Valor (R$)',
    'Forma de Pagamento',
    'KM Hodometro',
    'Observacoes'
  ];

  const rows = transactions.map((t) => [
    t.id,
    formatDatePtBR(t.date),
    t.accountType === 'PF' ? 'Pessoa Física (PF)' : 'Pessoa Jurídica (PJ)',
    t.type === 'RECEITA' ? 'Receita (+)' : 'Despesa (-)',
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2).replace('.', ','),
    t.paymentMethod || '',
    t.odometerKm ? `${t.odometerKm} km` : '',
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export interface PDFExportData {
  transactions: Transaction[];
  profile: UserProfile;
  periodName: string;
  totals: {
    receitasPF: number;
    despesasPF: number;
    saldoPF: number;
    receitasPJ: number;
    despesasPJ: number;
    saldoPJ: number;
    receitasTotal: number;
    despesasTotal: number;
    saldoTotal: number;
    combustivelTotal: number;
    combustivelRatio: number;
  };
  maintenanceItems: MaintenanceItem[];
}

export const exportReportToPDF = (data: PDFExportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { transactions, profile, periodName, totals, maintenanceItems } = data;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GESTAO FINANCEIRA DO AUTONOMO & MOTOBOY', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Profissional: ${profile.name} | Veiculo: ${profile.motoModel} (${profile.motoPlate || 'Sem placa'}) | KM Atual: ${profile.currentOdometer.toLocaleString('pt-BR')} km`, 14, 21);
  doc.text(`Periodo: ${periodName} | Gerado em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 14, 27);

  // Financial Summary Cards Box
  let yPos = 40;

  // PJ Summary Box (Blue)
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(14, yPos, 58, 28, 2, 2, 'FD');

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PESSOA JURIDICA (PJ - Moto)', 17, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Faturamento: ${formatCurrency(totals.receitasPJ)}`, 17, yPos + 12);
  doc.text(`Despesas Moto: ${formatCurrency(totals.despesasPJ)}`, 17, yPos + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(totals.saldoPJ >= 0 ? 16 : 220, totals.saldoPJ >= 0 ? 185 : 38, totals.saldoPJ >= 0 ? 129 : 38);
  doc.text(`Lucro Liquido PJ: ${formatCurrency(totals.saldoPJ)}`, 17, yPos + 23);

  // PF Summary Box (Emerald)
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(76, yPos, 58, 28, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PESSOA FISICA (PF - Casa)', 79, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Renda / Retirada: ${formatCurrency(totals.receitasPF)}`, 79, yPos + 12);
  doc.text(`Despesas Pessoais: ${formatCurrency(totals.despesasPF)}`, 79, yPos + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(totals.saldoPF >= 0 ? 16 : 220, totals.saldoPF >= 0 ? 185 : 38, totals.saldoPF >= 0 ? 129 : 38);
  doc.text(`Saldo Sobra PF: ${formatCurrency(totals.saldoPF)}`, 79, yPos + 23);

  // Consolidated Box (Purple)
  doc.setFillColor(250, 245, 255); // purple-50
  doc.setDrawColor(233, 213, 255);
  doc.roundedRect(138, yPos, 58, 28, 2, 2, 'FD');

  doc.setTextColor(107, 33, 168);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CONSOLIDADO (Total)', 141, yPos + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Entradas Totais: ${formatCurrency(totals.receitasTotal)}`, 141, yPos + 12);
  doc.text(`Saidas Totais: ${formatCurrency(totals.despesasTotal)}`, 141, yPos + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(totals.saldoTotal >= 0 ? 16 : 220, totals.saldoTotal >= 0 ? 185 : 38, totals.saldoTotal >= 0 ? 129 : 38);
  doc.text(`Saldo Geral: ${formatCurrency(totals.saldoTotal)}`, 141, yPos + 23);

  yPos += 34;

  // Key KPI Bar: Fuel vs Revenue & Maintenance alerts
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, 182, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Indice de Combustivel: ${totals.combustivelRatio.toFixed(1)}% do faturamento foi em gasolina (${formatCurrency(totals.combustivelTotal)})`, 18, yPos + 6);

  // Status of oil
  const oilItem = maintenanceItems.find(m => m.id === 'maint_oleo');
  let oilStatusText = 'Oleo em dia';
  if (oilItem) {
    const status = calculateMaintenanceStatus(oilItem, profile.currentOdometer);
    oilStatusText = `Status Troca de Oleo: ${status.label} (Ultima troca: ${oilItem.lastKm.toLocaleString('pt-BR')} km)`;
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(oilStatusText, 18, yPos + 12);

  yPos += 22;

  // Transactions Table using autoTable
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Extrato Detalhado de Transacoes (${transactions.length} registros)`, 14, yPos);

  const tableBody = transactions.map((t) => [
    formatDatePtBR(t.date),
    t.accountType,
    t.type === 'RECEITA' ? 'Entrada' : 'Saida',
    t.category,
    t.description,
    t.paymentMethod || 'Pix',
    (t.type === 'RECEITA' ? '+ ' : '- ') + formatCurrency(t.amount),
  ]);

  autoTable(doc, {
    startY: yPos + 3,
    head: [['Data', 'Conta', 'Tipo', 'Categoria', 'Descricao', 'Pagamento', 'Valor']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 35 },
      4: { cellWidth: 50 },
      5: { cellWidth: 22 },
      6: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const text = String(data.cell.raw);
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129]; // green
        } else {
          data.cell.styles.textColor = [239, 68, 68]; // red
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Footer note on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Pagina ${i} de ${pageCount} - Controle Financeiro Autonomo & Motoboy - Gerado automaticamente`,
      105,
      290,
      { align: 'center' }
    );
  }

  doc.save(`relatorio-financeiro-${profile.name.toLowerCase().replace(/\s+/g, '-')}-${periodName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};
