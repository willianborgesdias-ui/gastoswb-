import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  PieChart,
  Layers,
  Building2,
  UserCheck,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Sparkles,
  Printer
} from 'lucide-react';
import { DateFilter, MaintenanceItem, PeriodFilterType, Transaction, UserProfile } from '../types';
import {
  filterTransactionsByPeriod,
  formatCurrency,
  formatDatePtBR,
  formatKm
} from '../utils/formatters';
import { exportReportToPDF, exportTransactionsToCSV } from '../utils/exportUtils';

interface ReportsProps {
  transactions: Transaction[];
  userProfile: UserProfile;
  maintenanceItems: MaintenanceItem[];
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
}

export const Reports: React.FC<ReportsProps> = ({
  transactions,
  userProfile,
  maintenanceItems,
  dateFilter,
  setDateFilter,
}) => {
  const [customStart, setCustomStart] = useState(dateFilter.startDate || '');
  const [customEnd, setCustomEnd] = useState(dateFilter.endDate || '');

  // Filtered transactions for the selected period
  const periodTransactions = useMemo(() => {
    return filterTransactionsByPeriod(transactions, dateFilter);
  }, [transactions, dateFilter]);

  // Breakdown Calculations
  const stats = useMemo(() => {
    // PJ
    const pjTx = periodTransactions.filter((t) => t.accountType === 'PJ');
    const receitasPJ = pjTx.filter((t) => t.type === 'RECEITA').reduce((s, t) => s + t.amount, 0);
    const despesasPJ = pjTx.filter((t) => t.type === 'DESPESA').reduce((s, t) => s + t.amount, 0);
    const saldoPJ = receitasPJ - despesasPJ;

    // PF
    const pfTx = periodTransactions.filter((t) => t.accountType === 'PF');
    const receitasPF = pfTx.filter((t) => t.type === 'RECEITA').reduce((s, t) => s + t.amount, 0);
    const despesasPF = pfTx.filter((t) => t.type === 'DESPESA').reduce((s, t) => s + t.amount, 0);
    const saldoPF = receitasPF - despesasPF;

    // Total Consolidated
    const receitasTotal = receitasPJ + receitasPF;
    const despesasTotal = despesasPJ + despesasPF;
    const saldoTotal = receitasTotal - despesasTotal;

    // Specific Fuel
    const combustivelTotal = pjTx
      .filter((t) => t.type === 'DESPESA' && (t.category.toLowerCase().includes('combust') || t.description.toLowerCase().includes('gasolina')))
      .reduce((s, t) => s + t.amount, 0);
    const combustivelRatio = receitasPJ > 0 ? (combustivelTotal / receitasPJ) * 100 : 0;

    // Expense split: % of spending that is PJ vs % PF
    const totalGastosGeral = despesasTotal > 0 ? despesasTotal : 1;
    const percentDespesasPJ = (despesasPJ / totalGastosGeral) * 100;
    const percentDespesasPF = (despesasPF / totalGastosGeral) * 100;

    // Categorical breakdown for Expenses
    const catMap: { [cat: string]: { total: number; accountType: 'PF' | 'PJ'; count: number } } = {};
    periodTransactions
      .filter((t) => t.type === 'DESPESA')
      .forEach((t) => {
        if (!catMap[t.category]) {
          catMap[t.category] = { total: 0, accountType: t.accountType, count: 0 };
        }
        catMap[t.category].total += t.amount;
        catMap[t.category].count += 1;
      });

    const categoryList = Object.entries(catMap)
      .map(([name, data]) => ({
        name,
        total: data.total,
        accountType: data.accountType,
        count: data.count,
        percentOfTotal: (data.total / totalGastosGeral) * 100,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      receitasPJ,
      despesasPJ,
      saldoPJ,
      receitasPF,
      despesasPF,
      saldoPF,
      receitasTotal,
      despesasTotal,
      saldoTotal,
      combustivelTotal,
      combustivelRatio,
      percentDespesasPJ,
      percentDespesasPF,
      categoryList,
    };
  }, [periodTransactions]);

  const getPeriodLabel = (): string => {
    switch (dateFilter.type) {
      case 'CURRENT_MONTH':
        return 'Mês Atual';
      case 'PREVIOUS_MONTH':
        return 'Mês Anterior';
      case 'LAST_7_DAYS':
        return 'Últimos 7 Dias';
      case 'CURRENT_YEAR':
        return 'Ano Atual';
      case 'CUSTOM':
        return `Personalizado (${formatDatePtBR(dateFilter.startDate || '')} a ${formatDatePtBR(dateFilter.endDate || '')})`;
      default:
        return 'Todos os Registros';
    }
  };

  const handleApplyCustomDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      alert('Por favor, selecione as duas datas.');
      return;
    }
    setDateFilter({
      type: 'CUSTOM',
      startDate: customStart,
      endDate: customEnd,
    });
  };

  const handleExportPDF = () => {
    exportReportToPDF({
      transactions: periodTransactions,
      profile: userProfile,
      periodName: getPeriodLabel(),
      totals: stats,
      maintenanceItems,
    });
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(
      periodTransactions,
      `extrato-${userProfile.name.toLowerCase().replace(/\s+/g, '-')}-${dateFilter.type.toLowerCase()}.csv`
    );
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header & Export Actions */}
      <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Painel de Análise Financeira</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Relatórios & Comparativos</h2>
            <p className="text-xs text-slate-400">
              Período ativo: <strong className="text-emerald-300">{getPeriodLabel()}</strong> ({periodTransactions.length} registros)
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportPDF}
              id="export-pdf-btn"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <FileText className="w-4 h-4 stroke-[2.5]" />
              <span>Exportar PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              id="export-csv-btn"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Baixar Excel/CSV</span>
            </button>
          </div>
        </div>

        {/* Period Filter Selector Pills */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(
              [
                { type: 'CURRENT_MONTH', label: 'Mês Atual' },
                { type: 'PREVIOUS_MONTH', label: 'Mês Anterior' },
                { type: 'LAST_7_DAYS', label: 'Últimos 7 Dias' },
                { type: 'CURRENT_YEAR', label: 'Ano Atual' },
                { type: 'CUSTOM', label: 'Personalizado' },
              ] as const
            ).map((item) => (
              <button
                key={item.type}
                onClick={() => setDateFilter({ type: item.type })}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  dateFilter.type === item.type
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Custom Date Form */}
          {dateFilter.type === 'CUSTOM' && (
            <form
              onSubmit={handleApplyCustomDates}
              className="mt-3 p-3 bg-slate-950 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-end gap-2"
            >
              <div className="flex-1 w-full">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">De:</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  required
                />
              </div>

              <div className="flex-1 w-full">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Até:</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                Aplicar Filtro
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Relatório Comparativo PF vs PJ (Trabalho vs Pessoal) */}
      <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Comparativo PF vs. PJ</h3>
              <p className="text-[11px] text-slate-400">Distribuição dos gastos entre trabalho e uso pessoal</p>
            </div>
          </div>
        </div>

        {/* Visual Proportional Bar (PJ Blue/Emerald vs PF Orange/Rose) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> PJ (Trabalho/Moto): {stats.percentDespesasPJ.toFixed(1)}%
            </span>
            <span className="text-blue-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> PF (Pessoal/Casa): {stats.percentDespesasPF.toFixed(1)}%
            </span>
          </div>

          <div className="w-full h-4 rounded-full bg-slate-950 flex overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-l-full transition-all duration-500"
              style={{ width: `${stats.percentDespesasPJ}%` }}
              title={`PJ: ${formatCurrency(stats.despesasPJ)}`}
            />
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-r-full transition-all duration-500"
              style={{ width: `${stats.percentDespesasPF}%` }}
              title={`PF: ${formatCurrency(stats.despesasPF)}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-emerald-900/30">
              <span className="text-slate-400 block text-[11px]">Total Gasto no Trabalho (PJ)</span>
              <span className="text-base font-bold text-emerald-300">{formatCurrency(stats.despesasPJ)}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Combustível, óleo, peças, MEI</p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-blue-900/30">
              <span className="text-slate-400 block text-[11px]">Total Gasto no Pessoal (PF)</span>
              <span className="text-base font-bold text-blue-300">{formatCurrency(stats.despesasPF)}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Aluguel, mercado, contas, lazer</p>
            </div>
          </div>
        </div>

        {/* 3 Pillars Summary Cards: PJ, PF, Consolidado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
          {/* PJ Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-emerald-400 block">Resultado PJ (Moto)</span>
            <div className="text-xs flex justify-between text-slate-300">
              <span>Faturamento:</span>
              <strong className="text-emerald-400">{formatCurrency(stats.receitasPJ)}</strong>
            </div>
            <div className="text-xs flex justify-between text-slate-300">
              <span>Despesas:</span>
              <strong className="text-rose-400">-{formatCurrency(stats.despesasPJ)}</strong>
            </div>
            <div className="text-xs flex justify-between font-bold pt-1 border-t border-slate-800">
              <span>Lucro PJ:</span>
              <strong className={stats.saldoPJ >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(stats.saldoPJ)}
              </strong>
            </div>
          </div>

          {/* PF Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-blue-400 block">Resultado PF (Casa)</span>
            <div className="text-xs flex justify-between text-slate-300">
              <span>Renda/Pró-Labore:</span>
              <strong className="text-emerald-400">{formatCurrency(stats.receitasPF)}</strong>
            </div>
            <div className="text-xs flex justify-between text-slate-300">
              <span>Despesas:</span>
              <strong className="text-rose-400">-{formatCurrency(stats.despesasPF)}</strong>
            </div>
            <div className="text-xs flex justify-between font-bold pt-1 border-t border-slate-800">
              <span>Sobra PF:</span>
              <strong className={stats.saldoPF >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(stats.saldoPF)}
              </strong>
            </div>
          </div>

          {/* Consolidado Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-900/40 space-y-1.5">
            <span className="text-xs font-bold text-purple-400 block">Consolidado Total</span>
            <div className="text-xs flex justify-between text-slate-300">
              <span>Total Entradas:</span>
              <strong className="text-emerald-400">{formatCurrency(stats.receitasTotal)}</strong>
            </div>
            <div className="text-xs flex justify-between text-slate-300">
              <span>Total Saídas:</span>
              <strong className="text-rose-400">-{formatCurrency(stats.despesasTotal)}</strong>
            </div>
            <div className="text-xs flex justify-between font-bold pt-1 border-t border-slate-800">
              <span>Saldo Geral:</span>
              <strong className={stats.saldoTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(stats.saldoTotal)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Detalhamento de Gastos por Categoria */}
      <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Detalhamento por Categoria</h3>
            <p className="text-[11px] text-slate-400">Onde foi parar seu dinheiro no período</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {stats.categoryList.length} categorias com gastos
          </span>
        </div>

        {stats.categoryList.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Nenhuma despesa registrada neste período.</p>
        ) : (
          <div className="space-y-2.5">
            {stats.categoryList.map((cat) => (
              <div key={cat.name} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`text-[9px] font-bold px-1 rounded ${
                        cat.accountType === 'PF'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {cat.accountType}
                    </span>
                    <span className="font-bold text-slate-200 truncate">{cat.name}</span>
                    <span className="text-[10px] text-slate-500">({cat.count} lançamentos)</span>
                  </div>

                  <div className="flex items-center gap-2 font-bold shrink-0">
                    <span className="text-slate-100">{formatCurrency(cat.total)}</span>
                    <span className="text-[10px] text-slate-400 w-11 text-right">
                      {cat.percentOfTotal.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar per category */}
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full ${
                      cat.accountType === 'PF' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(cat.percentOfTotal, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
