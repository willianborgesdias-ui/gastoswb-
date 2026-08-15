import React, { useState } from 'react';
import { Download, FileSpreadsheet, Printer, Check, Info, Award, Calculator, TrendingUp } from 'lucide-react';
import { DeliveryLog, FuelExpense, MaintenanceRecord, OtherExpense } from '../types';

interface ReportGeneratorProps {
  deliveries: DeliveryLog[];
  fuelExpenses: FuelExpense[];
  maintenanceRecords: MaintenanceRecord[];
  otherExpenses: OtherExpense[];
}

export default function ReportGenerator({
  deliveries,
  fuelExpenses,
  maintenanceRecords,
  otherExpenses
}: ReportGeneratorProps) {
  const [reportMonth, setReportMonth] = useState<string>('07'); // July default
  const [reportYear, setReportYear] = useState<string>('2026');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Filter lists based on selected month & year
  const filterByMonthAndYear = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    return year === reportYear && month === reportMonth;
  };

  const filteredDeliveries = deliveries.filter(d => filterByMonthAndYear(d.date));
  const filteredFuel = fuelExpenses.filter(f => filterByMonthAndYear(f.date));
  const filteredMaintenance = maintenanceRecords.filter(m => filterByMonthAndYear(m.date));
  const filteredOther = otherExpenses.filter(o => filterByMonthAndYear(o.date));

  // Computations
  const totalDeliveriesCount = filteredDeliveries.length;
  const totalGrossEarnings = filteredDeliveries.reduce((sum, d) => sum + d.earnings + d.tip, 0);
  const totalFuelCost = filteredFuel.reduce((sum, f) => sum + f.totalCost, 0);
  const totalMaintenanceCost = filteredMaintenance.reduce((sum, m) => sum + m.cost, 0);
  const totalOtherCost = filteredOther.reduce((sum, o) => sum + o.cost, 0);
  
  const totalExpenses = totalFuelCost + totalMaintenanceCost + totalOtherCost;
  const netEarnings = totalGrossEarnings - totalExpenses;
  const totalDistance = filteredDeliveries.reduce((sum, d) => sum + d.distanceKm, 0);

  // Generate CSV for download
  const generateCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header
    csvContent += "TIPO,DATA,DESCRICAO,VALOR BRUTO (R$),DISTANCIA (KM),DADOS ADICIONAIS\n";

    // Add Deliveries
    filteredDeliveries.forEach(d => {
      csvContent += `ENTREGA,${d.date},Corrida ${d.app},${(d.earnings + d.tip).toFixed(2)},${d.distanceKm},Gorjeta: ${d.tip.toFixed(2)} / Espera: ${d.waitTimeMin}min\n`;
    });

    // Add Fuel
    filteredFuel.forEach(f => {
      csvContent += `DESPESA_COMBUSTIVEL,${f.date},Abastecimento ${f.liters}L,${f.totalCost.toFixed(2)},0,Preço por L: ${f.pricePerLiter.toFixed(2)} / KM: ${f.kmAtFuel}\n`;
    });

    // Add Maintenance
    filteredMaintenance.forEach(m => {
      csvContent += `DESPESA_MANUTENCAO,${m.date},${m.type},${m.cost.toFixed(2)},0,Proximo KM: ${m.nextDueKm} / Desc: ${m.description || ''}\n`;
    });

    // Add Other
    filteredOther.forEach(o => {
      csvContent += `DESPESA_OPERACIONAL,${o.date},${o.type},${o.cost.toFixed(2)},0,Desc: ${o.description || ''}\n`;
    });

    // Create download element
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Relatorio_MotoboyPro_${reportYear}_${reportMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="report-generator-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Toast */}
      {exportSuccess && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-black px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 font-semibold text-sm animate-bounce">
          <Check className="w-5 h-5" />
          Relatório exportado com sucesso (.CSV)!
        </div>
      )}

      {/* Control Configuration Panel */}
      <div className="bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-display font-semibold text-white">Declarador de Ganhos</h3>
              <p className="text-xs text-gray-400">Configure o fechamento mensal</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Mês de Referência</label>
            <select
              id="report-month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Ano</label>
            <select
              id="report-year"
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* MEI Info Banner */}
          <div className="bg-[#18191c] border border-[#2d2e33] rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xxs font-bold text-white uppercase tracking-wider">Facilitador do MEI</p>
              <p className="text-3xs text-gray-400 mt-1 leading-relaxed">
                Motoboys registrados como Microempreendedor Individual (MEI) devem declarar anualmente os seus rendimentos brutos. 
                Utilize o fechamento abaixo para preencher o relatório mensal de receitas brutas obrigatório do Simples Nacional.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-[#212327] mt-6">
          <button
            id="btn-export-csv"
            onClick={generateCsv}
            className="w-full py-3 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow-lg shadow-yellow-400/10 transition-all flex items-center justify-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV Excel
          </button>
          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="w-full py-3 px-4 rounded-lg bg-[#1c1d20] border border-[#2d2e33] hover:border-gray-600 text-gray-300 font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Visual Report Card (Aesthetic MEI receipt sheet) */}
      <div className="lg:col-span-2 bg-white text-black rounded-xl p-8 shadow-2xl space-y-6 print:m-0 print:p-0">
        
        {/* Print Header */}
        <div className="border-b-2 border-dashed border-gray-300 pb-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <span className="text-xxs font-extrabold px-2.5 py-1 rounded bg-black text-white uppercase tracking-widest">
              Relatório Mensal de Ganhos
            </span>
            <h4 className="font-display font-bold text-2xl text-black tracking-tight mt-1.5">
              MOTOBOY PRO LEDGER
            </h4>
            <p className="text-xs text-gray-500">Documento de fechamento fiscal individual simplificado</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xxs text-gray-400 uppercase font-bold">Referência</p>
            <p className="text-lg font-mono font-bold text-black">{reportMonth}/{reportYear}</p>
            <p className="text-xxs text-gray-500">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
          <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-lg">
            <p className="text-xxs text-gray-400 uppercase font-bold">Faturamento Bruto</p>
            <p className="text-lg font-mono font-bold text-gray-900 mt-1">R$ {totalGrossEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-lg">
            <p className="text-xxs text-gray-400 uppercase font-bold">Despesas Totais</p>
            <p className="text-lg font-mono font-bold text-red-600 mt-1">- R$ {totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-gray-100 border border-gray-300 p-3.5 rounded-lg">
            <p className="text-xxs text-gray-500 uppercase font-bold">Rendimento Líquido</p>
            <p className="text-lg font-mono font-bold text-emerald-600 mt-1">R$ {netEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-lg">
            <p className="text-xxs text-gray-400 uppercase font-bold">KMs Rodados</p>
            <p className="text-lg font-mono font-bold text-gray-900 mt-1">{totalDistance.toFixed(0)} KM</p>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="space-y-4">
          <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1.5">Detalhamento Financeiro</h5>
          
          <div className="space-y-2.5 text-xs text-gray-700">
            <div className="flex justify-between items-center">
              <span>Ganhos Brutos por Serviços (iFood, Rappi, etc):</span>
              <span className="font-mono font-bold text-gray-900">R$ {filteredDeliveries.reduce((s,d) => s + d.earnings, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Gorjetas Extra Recebidas diretamente de Clientes:</span>
              <span className="font-mono font-bold text-emerald-600">R$ {filteredDeliveries.reduce((s,d) => s + d.tip, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-2">
              <span>Custo Total com Combustível:</span>
              <span className="font-mono font-bold text-red-600">R$ {totalFuelCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Gastos com Peças & Oficinas (Revisões):</span>
              <span className="font-mono font-bold text-red-600">R$ {totalMaintenanceCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Refeições e Custos de Internet Operacional:</span>
              <span className="font-mono font-bold text-red-600">R$ {totalOtherCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Declaratory compliance statement */}
        <div className="border-t-2 border-gray-100 pt-5 space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xxs font-bold text-emerald-900 uppercase">Validador de Desempenho Ativo</p>
              <p className="text-3xs text-emerald-700 mt-0.5 leading-relaxed">
                O seu rendimento líquido real corresponde a <strong className="text-emerald-900 font-bold">{totalGrossEarnings > 0 ? Math.round((netEarnings / totalGrossEarnings) * 100) : 0}%</strong> de aproveitamento. 
                Sua despesa com combustível representou <strong class="text-emerald-900 font-bold">{totalGrossEarnings > 0 ? Math.round((totalFuelCost / totalGrossEarnings) * 100) : 0}%</strong> do seu custo operacional neste mês.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center text-gray-400 text-3xs italic">
            Assinado digitalmente por Motoboy Pro Ledger. O uso destas informações é estritamente pessoal e informativo.
          </div>
        </div>

      </div>

    </div>
  );
}
