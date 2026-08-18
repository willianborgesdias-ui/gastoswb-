import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Trash2,
  Calendar,
  CreditCard,
  Building2,
  UserCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Fuel,
  Wrench,
  Bike,
  Sparkles
} from 'lucide-react';
import { Category, PaymentMethod, Transaction, TransactionNature } from '../types';
import confetti from 'canvas-confetti';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, id?: string) => void;
  onDelete?: (id: string) => void;
  editingTransaction?: Transaction | null;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  initialDefaults?: Partial<Transaction> | null;
  currentOdometer?: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingTransaction,
  categories,
  onAddCategory,
  initialDefaults,
  currentOdometer,
}) => {
  const [type, setType] = useState<TransactionNature>('DESPESA');
  const [accountType, setAccountType] = useState<'PF' | 'PJ'>('PJ');
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [notes, setNotes] = useState<string>('');
  const [odometerKm, setOdometerKm] = useState<string>('');
  
  // Custom Category State
  const [isAddingNewCategory, setIsAddingNewCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  // Synchronize initial state when modal opens or editing item changes
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAccountType(editingTransaction.accountType);
      setAmountStr(editingTransaction.amount ? editingTransaction.amount.toString() : '');
      setDescription(editingTransaction.description || '');
      setCategory(editingTransaction.category || '');
      setDate(editingTransaction.date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(editingTransaction.paymentMethod || 'PIX');
      setNotes(editingTransaction.notes || '');
      setOdometerKm(editingTransaction.odometerKm ? editingTransaction.odometerKm.toString() : '');
    } else {
      // New transaction with optional defaults
      setType(initialDefaults?.type || 'DESPESA');
      setAccountType(initialDefaults?.accountType || 'PJ');
      setAmountStr(initialDefaults?.amount ? initialDefaults.amount.toString() : '');
      setDescription(initialDefaults?.description || '');
      setCategory(initialDefaults?.category || '');
      setDate(initialDefaults?.date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(initialDefaults?.paymentMethod || 'PIX');
      setNotes(initialDefaults?.notes || '');
      setOdometerKm(currentOdometer ? currentOdometer.toString() : '');
    }
  }, [editingTransaction, initialDefaults, isOpen, currentOdometer]);

  if (!isOpen) return null;

  // Filter available categories based on selected account type (PF or PJ)
  const availableCategories = categories.filter((c) => c.accountType === accountType);

  // Quick Amount Addition pills (+10, +20, +50, +100)
  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + val).toFixed(2));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, digite um valor válido maior que zero.');
      return;
    }

    if (!description.trim()) {
      alert('Por favor, informe uma descrição para o lançamento.');
      return;
    }

    const selectedCategory = category || (availableCategories[0] ? availableCategories[0].name : 'Outros');

    onSave(
      {
        description: description.trim(),
        amount: parsedAmount,
        date,
        accountType,
        type,
        category: selectedCategory,
        paymentMethod,
        notes: notes.trim(),
        odometerKm: odometerKm ? parseInt(odometerKm, 10) : undefined,
      },
      editingTransaction?.id
    );

    // If it's a new income, let's pop a brief confetti!
    if (type === 'RECEITA' && !editingTransaction) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (err) {
        // Ignore if confetti not available
      }
    }

    onClose();
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: newCategoryName.trim(),
      accountType,
      icon: 'Tag',
      color: accountType === 'PJ' ? '#10b981' : '#3b82f6',
    };
    onAddCategory(newCat);
    setCategory(newCat.name);
    setNewCategoryName('');
    setIsAddingNewCategory(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                type === 'RECEITA'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {type === 'RECEITA' ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold">
                {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h3>
              <p className="text-xs text-slate-400">
                {type === 'RECEITA' ? 'Entrada de Dinheiro' : 'Saída / Despesa'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Natureza Switch: Entrada (Receita) vs Saída (Despesa) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('RECEITA')}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                type === 'RECEITA'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Receita (Ganho)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('DESPESA')}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                type === 'DESPESA'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Despesa (Gasto)</span>
            </button>
          </div>

          {/* Account Type Selector: PF vs PJ */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Tipo de Conta / Destino
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAccountType('PJ');
                  setCategory('');
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                  accountType === 'PJ'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold block">Pessoa Jurídica (PJ)</span>
                  <span className="text-[10px] text-slate-400">Trabalho / Moto / MEI</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountType('PF');
                  setCategory('');
                }}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                  accountType === 'PF'
                    ? 'bg-blue-950/60 border-blue-500 text-blue-300 shadow-md ring-1 ring-blue-500'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-5 h-5 text-blue-400" />
                <div>
                  <span className="text-xs font-bold block">Pessoa Física (PF)</span>
                  <span className="text-[10px] text-slate-400">Casa / Família / Pessoal</span>
                </div>
              </button>
            </div>
          </div>

          {/* Amount (Valor R$) Big Input & Quick Add Chips */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Valor (R$) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-500">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                autoFocus={!editingTransaction}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Quick value chips (+10, +20, +50, +100) */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">Somar:</span>
              {[10, 20, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAddQuickAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700/80 transition-all active:scale-95"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Categoria <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>Nova categoria</span>
              </button>
            </div>

            {/* Add Custom Category input */}
            {isAddingNewCategory && (
              <div className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="text"
                  placeholder="Nome da categoria..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                >
                  Criar
                </button>
              </div>
            )}

            {/* Category selection chips */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              {availableCategories.map((cat) => {
                const isSelected = category === cat.name || (!category && cat === availableCategories[0]);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Descrição / Observação <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Combustível Posto Shell, Corrida iFood, Aluguel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Data
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="PIX">⚡ Pix</option>
                <option value="CARTAO_DEBITO">💳 Cartão de Débito</option>
                <option value="CARTAO_CREDITO">💳 Cartão de Crédito</option>
                <option value="DINHEIRO">💵 Dinheiro em Espécie</option>
                <option value="TRANSFERENCIA">🏦 Transferência Bancária</option>
              </select>
            </div>
          </div>

          {/* Optional KM (For Motoboy Fuel / Maintenance log) */}
          {accountType === 'PJ' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Hodômetro da Moto (KM Atual - Opcional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Ex: 28450"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  KM
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Ao registrar, o hodômetro da sua moto será atualizado automaticamente no painel.
              </p>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Notas Adicionais (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Troca de óleo efetuada na oficina São Jorge, 11 litros..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit and Delete Actions */}
          <div className="pt-2 flex items-center gap-2">
            {editingTransaction && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente excluir este lançamento?')) {
                    onDelete(editingTransaction.id);
                    onClose();
                  }
                }}
                className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                title="Excluir Lançamento"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>{editingTransaction ? 'Atualizar Lançamento' : 'Salvar Lançamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
