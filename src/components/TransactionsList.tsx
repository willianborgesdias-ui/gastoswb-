import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Building2,
  UserCheck,
  CheckCircle2,
  Download,
  AlertCircle
} from 'lucide-react';
import { AccountType, DateFilter, Transaction } from '../types';
import { formatCurrency, formatDatePtBR, getRelativeDateLabel } from '../utils/formatters';

interface TransactionsListProps {
  transactions: Transaction[];
  activeAccount: AccountType;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onOpenNewTransaction: () => void;
  onExportCSV: () => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  activeAccount,
  onEditTransaction,
  onDeleteTransaction,
  onOpenNewTransaction,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNature, setSelectedNature] = useState<'ALL' | 'RECEITA' | 'DESPESA'>('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filter by top account switcher if not consolidado
      if (activeAccount !== 'CONSOLIDADO' && t.accountType !== activeAccount) {
        return false;
      }

      // Filter by Nature (Receita / Despesa)
      if (selectedNature !== 'ALL' && t.type !== selectedNature) {
        return false;
      }

      // Filter by Payment Method
      if (selectedPaymentMethod !== 'ALL' && t.paymentMethod !== selectedPaymentMethod) {
        return false;
      }

      // Filter by Search text
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchDesc = t.description.toLowerCase().includes(query);
        const matchCat = t.category.toLowerCase().includes(query);
        const matchNotes = t.notes?.toLowerCase().includes(query) || false;
        const matchAmount = t.amount.toString().includes(query);
        return matchDesc || matchCat || matchNotes || matchAmount;
      }

      return true;
    });
  }, [transactions, activeAccount, selectedNature, selectedPaymentMethod, searchTerm]);

  // Group transactions by date
  const groupedTransactions = useMemo<Record<string, Transaction[]>>(() => {
    const sorted = [...filteredTransactions].sort(
      (a, b) =>
        new Date(b.date + 'T' + (b.createdAt?.split('T')[1] || '00:00:00')).getTime() -
        new Date(a.date + 'T' + (a.createdAt?.split('T')[1] || '00:00:00')).getTime()
    );

    const groups: Record<string, Transaction[]> = {};
    sorted.forEach((t) => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });

    return groups;
  }, [filteredTransactions]);

  // Summary of filtered results
  const totalFilteredReceitas = filteredTransactions
    .filter((t) => t.type === 'RECEITA')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredDespesas = filteredTransactions
    .filter((t) => t.type === 'DESPESA')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoFiltrado = totalFilteredReceitas - totalFilteredDespesas;

  const handleDeleteWithConfirm = (e: React.MouseEvent, tx: Transaction) => {
    e.stopPropagation();
    if (confirm(`Deseja realmente apagar o lançamento "${tx.description}" no valor de ${formatCurrency(tx.amount)}?`)) {
      if (onDeleteTransaction) {
        onDeleteTransaction(tx.id);
      }
    }
  };

  return (
    <div className="space-y-3 pb-24">
      {/* Top Filter Bar */}
      <div className="bg-slate-900/90 p-3.5 rounded-3xl border border-slate-800 space-y-2.5 shadow-lg">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição, posto, categoria, valor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Quick Filter Chips & Action */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-1">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedNature('ALL')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedNature === 'ALL'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedNature('RECEITA')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-all ${
                selectedNature === 'RECEITA'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Ganhos</span>
            </button>
            <button
              onClick={() => setSelectedNature('DESPESA')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-all ${
                selectedNature === 'DESPESA'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Gastos</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              title="Exportar Extrato em Planilha (CSV)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Summary Mini Card */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Mostrando <strong className="text-slate-200">{filteredTransactions.length}</strong> lançamentos:
        </span>
        <div className="flex items-center gap-3 font-bold">
          <span className="text-emerald-400">+{formatCurrency(totalFilteredReceitas)}</span>
          <span className="text-rose-400">-{formatCurrency(totalFilteredDespesas)}</span>
          <span
            className={`px-2 py-0.5 rounded-md ${
              saldoFiltrado >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            = {formatCurrency(saldoFiltrado)}
          </span>
        </div>
      </div>

      {/* Instructional Bar */}
      <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
        <span>Toque no item ou use os botões para <strong>Editar</strong> e <strong>Apagar</strong>:</span>
        <button
          onClick={onOpenNewTransaction}
          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Novo Lançamento</span>
        </button>
      </div>

      {/* Transactions List Render */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-300">Nenhum lançamento encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente alterar os filtros ou adicione uma nova transação.
            </p>
          </div>
          <button
            onClick={onOpenNewTransaction}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Agora</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {(Object.entries(groupedTransactions) as [string, Transaction[]][]).map(([dateStr, items]) => {
            const dayReceitas = items
              .filter((i) => i.type === 'RECEITA')
              .reduce((sum, i) => sum + i.amount, 0);
            const dayDespesas = items
              .filter((i) => i.type === 'DESPESA')
              .reduce((sum, i) => sum + i.amount, 0);

            return (
              <div key={dateStr} className="space-y-2">
                {/* Date Header Separator */}
                <div className="flex items-center justify-between px-2 pt-2 text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{getRelativeDateLabel(dateStr)}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({formatDatePtBR(dateStr)})</span>
                  </div>
                  <div className="text-[11px] flex items-center gap-2">
                    {dayReceitas > 0 && (
                      <span className="text-emerald-400">+{formatCurrency(dayReceitas)}</span>
                    )}
                    {dayDespesas > 0 && (
                      <span className="text-rose-400">-{formatCurrency(dayDespesas)}</span>
                    )}
                  </div>
                </div>

                {/* Items in this date */}
                <div className="space-y-2">
                  {items.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => onEditTransaction(tx)}
                      className="bg-slate-900/90 hover:bg-slate-800/90 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer transition-all hover:border-slate-700 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
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

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                            {tx.description}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span
                              className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                                tx.accountType === 'PF'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {tx.accountType}
                            </span>
                            <span>•</span>
                            <span className="text-slate-300 font-medium truncate max-w-[120px]">{tx.category}</span>
                            {tx.odometerKm && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400 font-medium">{tx.odometerKm.toLocaleString('pt-BR')} km</span>
                              </>
                            )}
                          </div>
                          {tx.notes && (
                            <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">
                              "{tx.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right side: Amount and direct Edit / Delete Buttons */}
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

                        {/* Action buttons: Edit & Delete */}
                        <div className="flex items-center gap-1 pl-1 border-l border-slate-800 ml-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTransaction(tx);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Editar lançamento"
                          >
                            <Edit2 className="w-4 h-4 text-emerald-400" />
                          </button>

                          {onDeleteTransaction && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteWithConfirm(e, tx)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              title="Apagar lançamento"
                            >
                              <Trash2 className="w-4 h-4 text-rose-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
