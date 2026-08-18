import React, { useState } from 'react';
import {
  Wrench,
  Droplet,
  Fuel,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Bike,
  Gauge,
  Calendar,
  Sparkles,
  DollarSign,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { MaintenanceItem, Transaction, UserProfile } from '../types';
import {
  calculateMaintenanceStatus,
  formatCurrency,
  formatDatePtBR,
  formatKm
} from '../utils/formatters';

interface MotoMaintenanceProps {
  maintenanceItems: MaintenanceItem[];
  userProfile: UserProfile;
  onUpdateOdometer: (newKm: number) => void;
  onUpdateMaintenanceItem: (item: MaintenanceItem) => void;
  onAddMaintenanceItem: (item: MaintenanceItem) => void;
  onDeleteMaintenanceItem: (id: string) => void;
  onRegisterMaintenanceExpense: (expense: Omit<Transaction, 'id' | 'createdAt'>) => void;
  transactions: Transaction[];
}

export const MotoMaintenance: React.FC<MotoMaintenanceProps> = ({
  maintenanceItems,
  userProfile,
  onUpdateOdometer,
  onUpdateMaintenanceItem,
  onAddMaintenanceItem,
  onDeleteMaintenanceItem,
  onRegisterMaintenanceExpense,
  transactions,
}) => {
  const [isEditingKm, setIsEditingKm] = useState(false);
  const [newKmInput, setNewKmInput] = useState(userProfile.currentOdometer.toString());

  // Modal for editing/creating maintenance item
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick Action Modal for "Realizei a manutenção!"
  const [completingItem, setCompletingItem] = useState<MaintenanceItem | null>(null);
  const [completionCost, setCompletionCost] = useState<string>('');
  const [completionKm, setCompletionKm] = useState<string>(userProfile.currentOdometer.toString());
  const [createTransaction, setCreateTransaction] = useState(true);

  // Calculate Fuel vs PJ Revenue metrics
  const pjTransactions = transactions.filter((t) => t.accountType === 'PJ');
  const pjRevenue = pjTransactions
    .filter((t) => t.type === 'RECEITA')
    .reduce((sum, t) => sum + t.amount, 0);
  const fuelExpenses = pjTransactions
    .filter((t) => t.type === 'DESPESA' && (t.category.toLowerCase().includes('combust') || t.description.toLowerCase().includes('gasolina')))
    .reduce((sum, t) => sum + t.amount, 0);
  const maintenanceExpenses = pjTransactions
    .filter((t) => t.type === 'DESPESA' && (t.category.toLowerCase().includes('manuten') || t.category.toLowerCase().includes('óleo') || t.category.toLowerCase().includes('peça')))
    .reduce((sum, t) => sum + t.amount, 0);

  const fuelRatio = pjRevenue > 0 ? (fuelExpenses / pjRevenue) * 100 : 0;

  const handleSaveOdometer = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(newKmInput, 10);
    if (!isNaN(val) && val >= 0) {
      onUpdateOdometer(val);
      setIsEditingKm(false);
    }
  };

  const handleQuickAddKm = (addVal: number) => {
    const nextKm = userProfile.currentOdometer + addVal;
    onUpdateOdometer(nextKm);
    setNewKmInput(nextKm.toString());
  };

  const handleStartComplete = (item: MaintenanceItem) => {
    setCompletingItem(item);
    setCompletionCost(item.estimatedCost ? item.estimatedCost.toString() : '');
    setCompletionKm(userProfile.currentOdometer.toString());
  };

  const handleFinishComplete = () => {
    if (!completingItem) return;
    const nowStr = new Date().toISOString().split('T')[0];
    const updatedKm = parseInt(completionKm, 10) || userProfile.currentOdometer;
    const cost = parseFloat(completionCost) || 0;

    // 1. Update maintenance item state
    const updatedItem: MaintenanceItem = {
      ...completingItem,
      lastKm: updatedKm,
      lastDate: nowStr,
    };
    onUpdateMaintenanceItem(updatedItem);

    // 2. Update motorcycle odometer if higher
    if (updatedKm > userProfile.currentOdometer) {
      onUpdateOdometer(updatedKm);
    }

    // 3. Register transaction in PJ if checked
    if (createTransaction && cost > 0) {
      onRegisterMaintenanceExpense({
        description: `Manutenção: ${completingItem.title}`,
        amount: cost,
        date: nowStr,
        accountType: 'PJ',
        type: 'DESPESA',
        category: completingItem.category || 'Manutenção / Peças',
        paymentMethod: 'PIX',
        odometerKm: updatedKm,
        notes: `Registrado automaticamente via painel de manutenção da moto`,
      });
    }

    setCompletingItem(null);
  };

  const handleSaveItemModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (maintenanceItems.some((m) => m.id === editingItem.id)) {
      onUpdateMaintenanceItem(editingItem);
    } else {
      onAddMaintenanceItem(editingItem);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Motorcycle Profile & Odometer Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-4 sm:p-5 rounded-3xl border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Bike className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Veículo de Trabalho (PJ)
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                {userProfile.motoModel || 'Minha Moto'}
              </h2>
              <p className="text-xs text-slate-400">
                Placa: <span className="text-slate-200 font-bold">{userProfile.motoPlate || 'BRA-3X99'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setNewKmInput(userProfile.currentOdometer.toString());
              setIsEditingKm(!isEditingKm);
            }}
            className="flex items-center gap-1 text-xs text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 px-2.5 py-1.5 rounded-xl border border-indigo-800/60 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditingKm ? 'Fechar' : 'Ajustar KM'}</span>
          </button>
        </div>

        {/* Current Odometer display */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              Hodômetro Atual
            </span>
            <p className="text-2xl font-black text-white tracking-tight">
              {formatKm(userProfile.currentOdometer)}
            </p>
          </div>

          {/* Quick KM Adder buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-500 font-medium">Somar rodado hoje:</span>
            {[50, 100, 150].map((addKm) => (
              <button
                key={addKm}
                type="button"
                onClick={() => handleQuickAddKm(addKm)}
                className="px-2 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[11px] font-bold border border-indigo-800/50 transition-all active:scale-95"
              >
                +{addKm} km
              </button>
            ))}
          </div>
        </div>

        {/* Edit KM form toggle */}
        {isEditingKm && (
          <form onSubmit={handleSaveOdometer} className="mt-3 p-3 bg-slate-950 rounded-2xl border border-indigo-500/40 space-y-2">
            <label className="text-xs font-bold text-slate-200">
              Digite o valor exato do painel da sua moto (KM):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={newKmInput}
                onChange={(e) => setNewKmInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                Salvar KM
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Fuel vs Revenue & Moto Expenses KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Combustível no Mês</h4>
                <p className="text-[10px] text-slate-400">Gasto vs. Faturamento</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400">{fuelRatio.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-baseline text-sm font-bold text-slate-200">
            <span>{formatCurrency(fuelExpenses)}</span>
            <span className="text-xs text-slate-400">Total Faturado: {formatCurrency(pjRevenue)}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Gastos c/ Manutenção</h4>
                <p className="text-[10px] text-slate-400">Peças, óleo e serviços</p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-400">{formatCurrency(maintenanceExpenses)}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Manter a manutenção preventiva em dia economiza até 40% em reparos pesados.
          </p>
        </div>
      </div>

      {/* Maintenance Items List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Itens de Revisão & Manutenção Preventiva
            </h3>
            <p className="text-[11px] text-slate-400">
              Acompanhamento inteligente baseado no hodômetro da sua moto
            </p>
          </div>

          <button
            onClick={() => {
              setEditingItem({
                id: `maint_${Date.now()}`,
                title: '',
                category: 'Manutenção / Peças',
                type: 'KM',
                lastKm: userProfile.currentOdometer,
                intervalKm: 5000,
                lastDate: new Date().toISOString().split('T')[0],
                intervalDays: 180,
                estimatedCost: 100,
                notes: '',
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Item</span>
          </button>
        </div>

        {/* Maintenance Cards */}
        <div className="space-y-2.5">
          {maintenanceItems.map((item) => {
            const status = calculateMaintenanceStatus(item, userProfile.currentOdometer);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  status.status === 'VENCIDO'
                    ? 'bg-rose-950/40 border-rose-800/80 shadow-lg shadow-rose-950/30'
                    : status.status === 'ATENCAO'
                    ? 'bg-amber-950/30 border-amber-800/70'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        status.status === 'VENCIDO'
                          ? 'bg-rose-500/20 text-rose-400'
                          : status.status === 'ATENCAO'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {item.title.toLowerCase().includes('óleo') ? (
                        <Droplet className="w-5 h-5" />
                      ) : (
                        <Wrench className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.type === 'KM'
                          ? `A cada ${formatKm(item.intervalKm)} • Última: ${formatKm(item.lastKm)}`
                          : item.type === 'DATE'
                          ? `A cada ${item.intervalDays} dias • Última: ${formatDatePtBR(item.lastDate)}`
                          : `A cada ${formatKm(item.intervalKm)} / ${item.intervalDays} dias`}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase ${
                      status.status === 'VENCIDO'
                        ? 'bg-rose-500 text-white'
                        : status.status === 'ATENCAO'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        status.status === 'VENCIDO'
                          ? 'bg-rose-500'
                          : status.status === 'ATENCAO'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(status.percentUsed, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Notes if available */}
                {item.notes && (
                  <p className="text-[11px] text-slate-400 italic mt-2 line-clamp-2">
                    Dica: {item.notes}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir o item de manutenção "${item.title}"?`)) {
                          onDeleteMaintenanceItem(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* "Feito / Troquei Agora" Button */}
                  <button
                    onClick={() => handleStartComplete(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Registrar Troca / Feito</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Modal: "Registrar que a manutenção foi feita" */}
      {completingItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Registrar Manutenção</h3>
                  <p className="text-xs text-slate-400">{completingItem.title}</p>
                </div>
              </div>
              <button
                onClick={() => setCompletingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  KM da Moto na Troca
                </label>
                <input
                  type="number"
                  value={completionKm}
                  onChange={(e) => setCompletionKm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Valor Gasto (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={completionCost}
                  onChange={(e) => setCompletionCost(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold"
                />
              </div>

              {/* Checkbox to create transaction in PJ automatically */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createTransaction}
                  onChange={(e) => setCreateTransaction(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded border-slate-700 focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">Lançar Despesa no Caixa PJ</span>
                  <span className="text-slate-400 text-[11px]">
                    Cadastra automaticamente no extrato com categoria "{completingItem.category}"
                  </span>
                </div>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompletingItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinishComplete}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
              >
                Confirmar Troca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Maintenance Item Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {maintenanceItems.some((m) => m.id === editingItem.id)
                ? 'Editar Item de Revisão'
                : 'Novo Item de Revisão'}
            </h3>

            <form onSubmit={handleSaveItemModal} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Título do Item</label>
                <input
                  type="text"
                  placeholder="Ex: Troca de Vela, Filtro de Ar, Cabo de Embreagem"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Tipo de Alerta</label>
                  <select
                    value={editingItem.type}
                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
                  >
                    <option value="KM">Por KM Rodado</option>
                    <option value="DATE">Por Tempo (Dias)</option>
                    <option value="BOTH">KM e Tempo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Intervalo (KM)</label>
                  <input
                    type="number"
                    value={editingItem.intervalKm}
                    onChange={(e) => setEditingItem({ ...editingItem, intervalKm: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Última Troca (KM)</label>
                  <input
                    type="number"
                    value={editingItem.lastKm}
                    onChange={(e) => setEditingItem({ ...editingItem, lastKm: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Última Data</label>
                  <input
                    type="date"
                    value={editingItem.lastDate}
                    onChange={(e) => setEditingItem({ ...editingItem, lastDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Dica / Marca recomendada</label>
                <input
                  type="text"
                  placeholder="Ex: Óleo Mobil 10w30, Pastilha Fischer..."
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Salvar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
