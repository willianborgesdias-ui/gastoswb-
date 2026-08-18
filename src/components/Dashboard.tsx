import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Fuel,
  Wrench,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  Bike,
  PlusCircle,
  Clock,
  CheckCircle2,
  PieChart,
  Edit2,
  Trash2
} from 'lucide-react';
import { AccountType, DateFilter, MaintenanceItem, Transaction, UserProfile } from '../types';
import {
  calculateMaintenanceStatus,
  formatCurrency,
  formatDatePtBR,
  formatKm,
  getRelativeDateLabel
} from '../utils/formatters';

interface DashboardProps {
  activeAccount: AccountType;
  transactions: Transaction[];
  maintenanceItems: MaintenanceItem[];
  userProfile: UserProfile;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  onOpenNewTransactionWithDefaults?: (defaults: Partial<Transaction>) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onNavigateToMaintenance: () => void;
  onNavigateToReports: () => void;
  onNavigateToTransactions: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeAccount,
  transactions,
  maintenanceItems,
  userProfile,
  dateFilter,
  setDateFilter,
  onOpenNewTransactionWithDefaults,
  onEditTransaction,
  onDeleteTransaction,
  onNavigateToMaintenance,
  onNavigateToReports,
  onNavigateToTransactions,
}) => {
  // Filter transactions based on active account
  const accountFilteredTransactions = transactions.filter((t) => {
    if (activeAccount === 'CONSOLIDADO') return true;
    return t.accountType === activeAccount;
  });

  // Calculate totals
  const totalReceitas = accountFilteredTransactions
    .filter((t) => t.type === 'RECEITA')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = accountFilteredTransactions
    .filter((t) => t.type === 'DESPESA')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  // Specific PJ calculations: Fuel vs Total PJ Revenue
  const pjTransactions = transactions.filter((t) => t.accountType === 'PJ');
  const pjReceitas = pjTransactions
    .filter((t) => t.type === 'RECEITA')
    .reduce((sum, t) => sum + t.amount, 0);

  const pjCombustivel = pjTransactions
    .filter((t) => t.type === 'DESPESA' && (t.category.toLowerCase().includes('combust') || t.description.toLowerCase().includes('gasolina') || t.description.toLowerCase().includes('etanol')))
    .reduce((sum, t) => sum + t.amount, 0);

  const combustivelRatio = pjReceitas > 0 ? (pjCombustivel / pjReceitas) * 100 : 0;

  // Oil change and maintenance alerts
  const urgentMaintenance = maintenanceItems
    .map((item) => ({
      item,
      status: calculateMaintenanceStatus(item, userProfile.currentOdometer),
    }))
    .filter((m) => m.status.status === 'VENCIDO' || m.status.status === 'ATENCAO')
    .sort((a, b) => (a.status.status === 'VENCIDO' ? -1 : 1));

  // Goal progress
  const revenueGoal = userProfile.monthlyRevenueGoal || 4500;
  const goalProgressPercent = Math.min(Math.round((pjReceitas / revenueGoal) * 100), 100);

  // Recent 5 transactions
  const recentTransactions = [...accountFilteredTransactions]
    .sort((a, b) => new Date(b.date + 'T' + (b.createdAt?.split('T')[1] || '00:00:00')).getTime() - new Date(a.date + 'T' + (a.createdAt?.split('T')[1] || '00:00:00')).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4 pb-20">
      {/* Period Selector Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            id="period-current-month"
            onClick={() => setDateFilter({ type: 'CURRENT_MONTH' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              dateFilter.type === 'CURRENT_MONTH'
                ? 'bg-slate-700 text-emerald-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mês Atual
          </button>
          <button
            id="period-last-7-days"
            onClick={() => setDateFilter({ type: 'LAST_7_DAYS' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              dateFilter.type === 'LAST_7_DAYS'
                ? 'bg-slate-700 text-emerald-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7 Dias
          </button>
          <button
            id="period-previous-month"
            onClick={() => setDateFilter({ type: 'PREVIOUS_MONTH' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              dateFilter.type === 'PREVIOUS_MONTH'
                ? 'bg-slate-700 text-emerald-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mês Anterior
          </button>
          <button
            id="period-current-year"
            onClick={() => setDateFilter({ type: 'CURRENT_YEAR' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              dateFilter.type === 'CURRENT_YEAR'
                ? 'bg-slate-700 text-emerald-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ano
          </button>
        </div>

        <button
          onClick={onNavigateToReports}
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Filtrar</span>
        </button>
      </div>

      {/* Main Account Hero Banner */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
          activeAccount === 'PF'
            ? 'bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950 border-blue-800/50'
            : activeAccount === 'PJ'
            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-800/50'
            : 'bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-950 border-purple-800/50'
        }`}
      >
        {/* Background glow circle */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                activeAccount === 'PF'
                  ? 'bg-blue-400'
                  : activeAccount === 'PJ'
                  ? 'bg-emerald-400'
                  : 'bg-purple-400'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {activeAccount === 'PF'
                ? 'Saldo Líquido Pessoal (PF)'
                : activeAccount === 'PJ'
                ? 'Lucro Líquido do Trabalho (PJ)'
                : 'Saldo Consolidado (Geral)'}
            </span>
          </div>

          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
              saldoLiquido >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {saldoLiquido >= 0 ? 'Saldo Positivo' : 'Em Déficit'}
          </span>
        </div>

        {/* Big Balance Number */}
        <div className="flex items-baseline gap-2 mb-4">
          <h2
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              saldoLiquido >= 0 ? 'text-white' : 'text-rose-400'
            }`}
          >
            {formatCurrency(saldoLiquido)}
          </h2>
        </div>

        {/* 2-Column Subcard for Receitas vs Despesas */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
              <ArrowDownLeft className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase">Ganhos / Entradas</span>
            </div>
            <p className="text-lg font-bold text-slate-100">{formatCurrency(totalReceitas)}</p>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-rose-400 mb-1">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase">Gastos / Saídas</span>
            </div>
            <p className="text-lg font-bold text-slate-100">{formatCurrency(totalDespesas)}</p>
          </div>
        </div>
      </div>

      {/* Motoboy & PJ Specific Widgets (Fuel & Maintenance Status) */}
      {(activeAccount === 'PJ' || activeAccount === 'CONSOLIDADO') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Fuel Efficiency Indicator */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Gasto com Gasolina</h4>
                  <p className="text-[11px] text-slate-400">Impacto no Faturamento PJ</p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  combustivelRatio <= 15
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : combustivelRatio <= 25
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {combustivelRatio.toFixed(1)}% do ganho
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <span className="text-lg font-bold text-amber-300">
                {formatCurrency(pjCombustivel)}
              </span>
              <span className="text-[11px] text-slate-400">
                Faturamento: {formatCurrency(pjReceitas)}
              </span>
            </div>

            {/* Fuel Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  combustivelRatio <= 15
                    ? 'bg-emerald-500'
                    : combustivelRatio <= 25
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(combustivelRatio, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
              <span>0% (Ideal &lt; 15%)</span>
              <span>25%+ (Alerta de custo alto)</span>
            </p>
          </div>

          {/* Quick Maintenance Reminder Alert Box */}
          <div
            onClick={onNavigateToMaintenance}
            className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Manutenção da Moto</h4>
                  <p className="text-[11px] text-slate-400">{userProfile.motoModel || 'Minha Moto'}</p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            {urgentMaintenance.length > 0 ? (
              <div className="space-y-1.5 mt-1">
                {urgentMaintenance.slice(0, 2).map((m) => (
                  <div
                    key={m.item.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium ${
                      m.status.status === 'VENCIDO'
                        ? 'bg-rose-950/50 border border-rose-800/60 text-rose-200'
                        : 'bg-amber-950/50 border border-amber-800/60 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{m.item.title}</span>
                    </div>
                    <span className="text-[10px] font-bold shrink-0">{m.status.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Troca de óleo e peças da moto estão em dia!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Launch Buttons (Gasolina Rápida, Faturamento Rápido, etc.) */}
      <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
          Lançamentos Rápidos
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() =>
              onOpenNewTransactionWithDefaults &&
              onOpenNewTransactionWithDefaults({
                accountType: 'PJ',
                type: 'DESPESA',
                category: 'Combustível',
                description: 'Abastecimento Gasolina',
                paymentMethod: 'PIX',
              })
            }
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-semibold transition-all active:scale-95"
          >
            <Fuel className="w-4 h-4 mb-1 text-amber-400" />
            <span>Abastecer</span>
          </button>

          <button
            onClick={() =>
              onOpenNewTransactionWithDefaults &&
              onOpenNewTransactionWithDefaults({
                accountType: 'PJ',
                type: 'RECEITA',
                category: 'Faturamento / Corridas',
                description: 'Faturamento do Dia / Corridas',
                paymentMethod: 'PIX',
              })
            }
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all active:scale-95"
          >
            <Bike className="w-4 h-4 mb-1 text-emerald-400" />
            <span>Ganho / Corridas</span>
          </button>

          <button
            onClick={() =>
              onOpenNewTransactionWithDefaults &&
              onOpenNewTransactionWithDefaults({
                accountType: 'PF',
                type: 'DESPESA',
                category: 'Mercado / Casa',
                description: 'Mercado / Compras Casa',
                paymentMethod: 'CARTAO_DEBITO',
              })
            }
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 text-xs font-semibold transition-all active:scale-95"
          >
            <Wallet className="w-4 h-4 mb-1 text-blue-400" />
            <span>Gasto Pessoal</span>
          </button>
        </div>
      </div>

      {/* Monthly Goal Bar */}
      {activeAccount !== 'PF' && (
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Meta de Faturamento Mensal
            </span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(pjReceitas)} / {formatCurrency(revenueGoal)}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${goalProgressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex justify-between">
            <span>{goalProgressPercent}% alcançado</span>
            <span>Faltam {formatCurrency(Math.max(revenueGoal - pjReceitas, 0))}</span>
          </p>
        </div>
      )}

      {/* Recent Transactions List Section */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Últimos Lançamentos</h3>
          </div>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center text-slate-400">
            <p className="text-sm">Nenhum lançamento no período selecionado.</p>
            <p className="text-xs text-slate-500 mt-1">Toque no botão '+' abaixo para cadastrar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onEditTransaction(tx)}
                className="bg-slate-900/90 hover:bg-slate-800/90 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'RECEITA'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {tx.type === 'RECEITA' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-1">
                      {tx.description}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span
                        className={`font-semibold px-1 rounded text-[10px] ${
                          tx.accountType === 'PF'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {tx.accountType}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[110px]">{tx.category}</span>
                      <span>•</span>
                      <span>{getRelativeDateLabel(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-bold block ${
                        tx.type === 'RECEITA' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'RECEITA' ? '+ ' : '- '}
                      {formatCurrency(tx.amount)}
                    </span>
                    {tx.paymentMethod && (
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                        {tx.paymentMethod.replace('_', ' ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 pl-1 border-l border-slate-800 ml-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTransaction(tx);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Editar lançamento"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                    </button>

                    {onDeleteTransaction && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Deseja realmente apagar o lançamento "${tx.description}"?`)) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Apagar lançamento"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
