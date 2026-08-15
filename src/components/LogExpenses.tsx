import React, { useState } from 'react';
import { Fuel, Wrench, UtensilsCrossed, Check, AlertTriangle, AlertCircle, Plus, Calendar } from 'lucide-react';
import { FuelExpense, MaintenanceRecord, OtherExpense } from '../types';

interface LogExpensesProps {
  fuelExpenses: FuelExpense[];
  maintenanceRecords: MaintenanceRecord[];
  otherExpenses: OtherExpense[];
  currentKm: number;
  onAddFuelExpense: (expense: Omit<FuelExpense, 'id'>) => void;
  onAddMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  onAddOtherExpense: (expense: Omit<OtherExpense, 'id'>) => void;
}

export default function LogExpenses({
  fuelExpenses,
  maintenanceRecords,
  otherExpenses,
  currentKm,
  onAddFuelExpense,
  onAddMaintenanceRecord,
  onAddOtherExpense
}: LogExpensesProps) {
  const [activeTab, setActiveTab] = useState<'fuel' | 'maintenance' | 'food'>('fuel');

  // Fuel states
  const [liters, setLiters] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>('');
  const [kmAtFuel, setKmAtFuel] = useState<string>(currentKm.toString());

  // Maintenance states
  const [maintenanceType, setMaintenanceType] = useState<'Troca de Óleo' | 'Pastilhas de Freio' | 'Pneus' | 'Relação (Corrente/Pinhão)' | 'Outros'>('Troca de Óleo');
  const [maintenanceCost, setMaintenanceCost] = useState<string>('');
  const [kmAtMaintenance, setKmAtMaintenance] = useState<string>(currentKm.toString());
  const [nextDueKm, setNextDueKm] = useState<string>((currentKm + 1000).toString());
  const [nextDueDate, setNextDueDate] = useState<string>('');
  const [maintenanceDesc, setMaintenanceDesc] = useState<string>('');

  // Other expenses state
  const [otherType, setOtherType] = useState<'Alimentação' | 'Estacionamento' | 'Pedágio' | 'Internet/Celular' | 'Equipamento' | 'Outros'>('Alimentação');
  const [otherCost, setOtherCost] = useState<string>('');
  const [otherDesc, setOtherDesc] = useState<string>('');

  // Success Toast
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(liters);
    const p = parseFloat(pricePerLiter);
    const k = parseInt(kmAtFuel);

    if (isNaN(l) || isNaN(p) || isNaN(k)) {
      alert("Por favor preencha todos os campos obrigatórios.");
      return;
    }

    onAddFuelExpense({
      date: new Date().toISOString().split('T')[0],
      liters: l,
      pricePerLiter: p,
      totalCost: parseFloat((l * p).toFixed(2)),
      kmAtFuel: k
    });

    setLiters('');
    setPricePerLiter('');
    setToastMessage("Abastecimento registrado com sucesso!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseFloat(maintenanceCost);
    const k = parseInt(kmAtMaintenance);
    const ndk = parseInt(nextDueKm);

    if (isNaN(c) || isNaN(k) || isNaN(ndk)) {
      alert("Preencha todos os campos numéricos.");
      return;
    }

    onAddMaintenanceRecord({
      type: maintenanceType,
      cost: c,
      date: new Date().toISOString().split('T')[0],
      kmAtMaintenance: k,
      nextDueKm: ndk,
      nextDueDate: nextDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: maintenanceDesc
    });

    setMaintenanceCost('');
    setMaintenanceDesc('');
    setToastMessage("Manutenção registrada com sucesso!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleOtherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseFloat(otherCost);

    if (isNaN(c)) {
      alert("Informe o custo.");
      return;
    }

    onAddOtherExpense({
      type: otherType,
      cost: c,
      date: new Date().toISOString().split('T')[0],
      description: otherDesc
    });

    setOtherCost('');
    setOtherDesc('');
    setToastMessage("Gasto registrado com sucesso!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Warning calculations for maintenance alerts
  const lastOilChange = maintenanceRecords.find(m => m.type === 'Troca de Óleo');
  const kmSinceOil = lastOilChange ? (currentKm - lastOilChange.kmAtMaintenance) : 950; // default simulation
  const oilLifePercent = Math.max(0, Math.min(100, Math.round(((1000 - kmSinceOil) / 1000) * 100)));

  const lastBrakeChange = maintenanceRecords.find(m => m.type === 'Pastilhas de Freio');
  const kmSinceBrakes = lastBrakeChange ? (currentKm - lastBrakeChange.kmAtMaintenance) : 3200;
  const brakesLifePercent = Math.max(0, Math.min(100, Math.round(((5000 - kmSinceBrakes) / 5000) * 100)));

  const lastChainChange = maintenanceRecords.find(m => m.type === 'Relação (Corrente/Pinhão)');
  const kmSinceChain = lastChainChange ? (currentKm - lastChainChange.kmAtMaintenance) : 1200;
  const chainLifePercent = Math.max(0, Math.min(100, Math.round(((10000 - kmSinceChain) / 10000) * 100)));

  return (
    <div id="log-expenses-section" class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Toast Feedback */}
      {showToast && (
        <div class="fixed bottom-6 right-6 bg-yellow-400 text-black px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 font-semibold text-sm transition-all animate-bounce">
          <Check class="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Main Expense Form */}
      <div class="bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
        <div>
          {/* Tabs for form types */}
          <div class="flex border-b border-[#212327] mb-6">
            <button
              id="tab-fuel"
              onClick={() => setActiveTab('fuel')}
              class={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-colors ${
                activeTab === 'fuel' 
                  ? 'border-yellow-400 text-yellow-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              ⛽ Abastecer
            </button>
            <button
              id="tab-maintenance"
              onClick={() => setActiveTab('maintenance')}
              class={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-colors ${
                activeTab === 'maintenance' 
                  ? 'border-yellow-400 text-yellow-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              🔧 Manutenção
            </button>
            <button
              id="tab-food"
              onClick={() => setActiveTab('food')}
              class={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-colors ${
                activeTab === 'food' 
                  ? 'border-yellow-400 text-yellow-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              🍽️ Refeição/Outros
            </button>
          </div>

          {/* Tab 1: Fuel Form */}
          {activeTab === 'fuel' && (
            <form onSubmit={handleFuelSubmit} class="space-y-4">
              <div class="flex items-center gap-2 mb-2 text-yellow-400">
                <Fuel class="w-4 h-4" />
                <span class="text-xs font-bold uppercase tracking-wider">Novo Abastecimento</span>
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-400 mb-1">Litros de Combustível *</label>
                  <input
                    id="fuel-liters"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-400 mb-1">Preço por Litro (R$) *</label>
                  <input
                    id="fuel-price"
                    type="number"
                    step="0.01"
                    required
                    placeholder="5.85"
                    value={pricePerLiter}
                    onChange={(e) => setPricePerLiter(e.target.value)}
                    class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 mb-1">Odômetro ao Abastecer *</label>
                <input
                  id="fuel-km"
                  type="number"
                  required
                  value={kmAtFuel}
                  onChange={(e) => setKmAtFuel(e.target.value)}
                  class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              {liters && pricePerLiter && (
                <div class="bg-[#18191c] border border-[#2d2e33] p-3 rounded-lg text-center">
                  <span class="text-xxs text-gray-400 font-bold uppercase">Custo Total Previsto:</span>
                  <p class="text-lg font-mono font-bold text-yellow-400 mt-0.5">
                    R$ {(parseFloat(liters) * parseFloat(pricePerLiter)).toFixed(2)}
                  </p>
                </div>
              )}

              <button
                id="btn-save-fuel"
                type="submit"
                class="w-full py-3 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow-lg shadow-yellow-400/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus class="w-4 h-4" />
                Registrar Abastecimento
              </button>
            </form>
          )}

          {/* Tab 2: Maintenance Form */}
          {activeTab === 'maintenance' && (
            <form onSubmit={handleMaintenanceSubmit} class="space-y-4">
              <div class="flex items-center gap-2 mb-2 text-yellow-400">
                <Wrench class="w-4 h-4" />
                <span class="text-xs font-bold uppercase tracking-wider">Registrar Oficina / Peças</span>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 mb-1">Tipo de Manutenção *</label>
                <select
                  id="maintenance-type"
                  value={maintenanceType}
                  onChange={(e: any) => {
                    setMaintenanceType(e.target.value);
                    // auto calculate next KM
                    const step = e.target.value === 'Troca de Óleo' ? 1000 : e.target.value === 'Pastilhas de Freio' ? 5000 : 10000;
                    setNextDueKm((currentKm + step).toString());
                  }}
                  class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="Troca de Óleo">Troca de Óleo</option>
                  <option value="Pastilhas de Freio">Pastilhas de Freio</option>
                  <option value="Pneus">Troca de Pneus</option>
                  <option value="Relação (Corrente/Pinhão)">Kit Relação (Corrente/Pinhão)</option>
                  <option value="Outros">Outras Peças / Regulagens</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-400 mb-1">Valor Gasto (R$) *</label>
                  <input
                    id="maintenance-cost"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={maintenanceCost}
                    onChange={(e) => setMaintenanceCost(e.target.value)}
                    class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-400 mb-1">KM da Manutenção *</label>
                  <input
                    id="maintenance-km"
                    type="number"
                    required
                    value={kmAtMaintenance}
                    onChange={(e) => setKmAtMaintenance(e.target.value)}
                    class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-400 mb-1">Vence no KM (Alerta) *</label>
                  <input
                    id="maintenance-next-km"
                    type="number"
                    required
                    value={nextDueKm}
                    onChange={(e) => setNextDueKm(e.target.value)}
                    class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-400 mb-1">Vencimento Data</label>
                  <input
                    id="maintenance-next-date"
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 mb-1">Descrição / Notas</label>
                <input
                  id="maintenance-desc"
                  type="text"
                  placeholder="Ex: Marca do óleo ou oficina parceira"
                  value={maintenanceDesc}
                  onChange={(e) => setMaintenanceDesc(e.target.value)}
                  class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <button
                id="btn-save-maintenance"
                type="submit"
                class="w-full py-3 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow-lg shadow-yellow-400/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus class="w-4 h-4" />
                Registrar Manutenção
              </button>
            </form>
          )}

          {/* Tab 3: Food / Other Expenses Form */}
          {activeTab === 'food' && (
            <form onSubmit={handleOtherSubmit} class="space-y-4">
              <div class="flex items-center gap-2 mb-2 text-yellow-400">
                <UtensilsCrossed class="w-4 h-4" />
                <span class="text-xs font-bold uppercase tracking-wider">Novo Gasto Operacional</span>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 mb-1">Categoria de Custo *</label>
                <select
                  id="other-type"
                  value={otherType}
                  onChange={(e: any) => setOtherType(e.target.value)}
                  class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="Alimentação">Alimentação (Refeição/Café)</option>
                  <option value="Internet/Celular">Plano de Celular/GPS</option>
                  <option value="Estacionamento">Estacionamento / Zona Azul</option>
                  <option value="Pedágio">Pedágios</option>
                  <option value="Equipamento">Acessórios (Capa de Chuva, Baú)</option>
                  <option value="Outros">Outros Gastos</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 mb-1">Valor do Gasto (R$) *</label>
                <input
                  id="other-cost"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={otherCost}
                  onChange={(e) => setOtherCost(e.target.value)}
                  class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-400 mb-1">Detalhes (Opcional)</label>
                <input
                  id="other-desc"
                  type="text"
                  placeholder="Ex: Almoço no PF Central"
                  value={otherDesc}
                  onChange={(e) => setOtherDesc(e.target.value)}
                  class="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <button
                id="btn-save-other"
                type="submit"
                class="w-full py-3 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow-lg shadow-yellow-400/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus class="w-4 h-4" />
                Registrar Gasto
              </button>
            </form>
          )}
        </div>

        {/* Maintenance Lifespans HUD */}
        <div class="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-4 mt-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <AlertCircle class="w-5 h-5 text-red-400 animate-pulse" />
            <div>
              <p class="text-xs font-bold text-white">Alerta de Filtro / Óleo</p>
              <p class="text-xxs text-gray-400 mt-0.5">Sua moto está próxima do limite ideal de troca de óleo!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wear & Tear Progress & Alerts HUD */}
      <div class="bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-6">
            <AlertTriangle class="w-5 h-5 text-yellow-400" />
            <div>
              <h3 class="font-display font-semibold text-white">Alertas do Veículo</h3>
              <p class="text-xs text-gray-400">Vida útil das peças essenciais</p>
            </div>
          </div>

          <div class="space-y-6">
            {/* Oil life progress */}
            <div class="space-y-2">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-gray-300">Óleo Lubrificante</span>
                <span class={`font-mono ${oilLifePercent < 15 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                  {1000 - kmSinceOil} KM restantes ({oilLifePercent}%)
                </span>
              </div>
              <div class="w-full h-2.5 bg-[#18191c] rounded-full overflow-hidden">
                <div 
                  class={`h-full rounded-full transition-all duration-500 ${oilLifePercent < 15 ? 'bg-red-500' : oilLifePercent < 40 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                  style={{ width: `${oilLifePercent}%` }}
                ></div>
              </div>
              <p class="text-xxs text-gray-400">Troca recomendada a cada 1.000 KM para preservar o motor da CG 160.</p>
            </div>

            {/* Brakes progress */}
            <div class="space-y-2">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-gray-300">Pastilhas de Freio</span>
                <span class="font-mono text-gray-400">
                  {5000 - kmSinceBrakes} KM restantes ({brakesLifePercent}%)
                </span>
              </div>
              <div class="w-full h-2.5 bg-[#18191c] rounded-full overflow-hidden">
                <div 
                  class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${brakesLifePercent}%` }}
                ></div>
              </div>
              <p class="text-xxs text-gray-400">Revisão preventiva recomendada a cada 5.000 KM para segurança.</p>
            </div>

            {/* Kit Relação progress */}
            <div class="space-y-2">
              <div class="flex justify-between text-xs font-semibold">
                <span class="text-gray-300">Kit Relação (Corrente/Coroa)</span>
                <span class="font-mono text-gray-400">
                  {10000 - kmSinceChain} KM restantes ({chainLifePercent}%)
                </span>
              </div>
              <div class="w-full h-2.5 bg-[#18191c] rounded-full overflow-hidden">
                <div 
                  class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${chainLifePercent}%` }}
                ></div>
              </div>
              <p class="text-xxs text-gray-400">Durabilidade média de 10.000 KM. Mantenha lubrificado contra chuva.</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div class="border-t border-[#212327] pt-4 mt-6 text-center">
          <p class="text-xxs text-gray-400 italic">Mantenha os registros em dia para evitar multas e quebras no meio da entrega!</p>
        </div>
      </div>

      {/* History log list of fuel and maintenance */}
      <div class="bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-display font-semibold text-white">Extrato de Despesas</h3>
              <p class="text-xs text-gray-400">Histórico detalhado de custos</p>
            </div>
            <Calendar class="w-4 h-4 text-gray-400" />
          </div>

          <div class="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {/* Compile fuel and maintenance lists together for unified chronological view */}
            {[
              ...fuelExpenses.map(f => ({ ...f, category: 'fuel' as const })),
              ...maintenanceRecords.map(m => ({ ...m, category: 'maintenance' as const })),
              ...otherExpenses.map(o => ({ ...o, category: 'other' as const }))
            ]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((item, idx) => {
                const isFuel = item.category === 'fuel';
                const isMaintenance = item.category === 'maintenance';
                return (
                  <div key={idx} class="bg-[#18191c] border border-[#222428] rounded-lg p-3 flex justify-between items-center hover:border-gray-700 transition-colors">
                    <div class="flex items-center gap-2.5">
                      <div class={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                        isFuel ? 'bg-amber-500/10 text-amber-400' : isMaintenance ? 'bg-red-500/10 text-red-400' : 'bg-sky-500/10 text-sky-400'
                      }`}>
                        {isFuel ? '⛽' : isMaintenance ? '🔧' : '🍽️'}
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-white">
                          {isFuel 
                            ? 'Abastecimento' 
                            : isMaintenance 
                              ? (item as any).type 
                              : (item as any).type}
                        </p>
                        <p class="text-3xs text-gray-400">
                          {item.date} {isFuel && `• ${(item as any).liters}L`}
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-xs font-mono font-bold text-gray-200">
                        R$ {isFuel ? (item as any).totalCost.toFixed(2) : (item as any).cost.toFixed(2)}
                      </p>
                      <p class="text-3xs text-gray-500 font-mono">
                        {(item as any).kmAtFuel || (item as any).kmAtMaintenance ? `${(item as any).kmAtFuel || (item as any).kmAtMaintenance} KM` : 'Despesa fixa'}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Summary Footer of expenses */}
        <div class="border-t border-[#212327] pt-3 mt-4 text-center">
          <span class="text-xxs text-gray-400 font-bold uppercase tracking-wide">
            Combustível Médio: R$ {(fuelExpenses.reduce((sum, f) => sum + f.pricePerLiter, 0) / Math.max(fuelExpenses.length, 1)).toFixed(2)}/L
          </span>
        </div>
      </div>

    </div>
  );
}
