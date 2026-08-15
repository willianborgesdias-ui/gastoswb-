import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Fuel, 
  AlertTriangle, 
  Gauge, 
  Clock, 
  CheckCircle, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ArrowUpRight, 
  Coins, 
  UtensilsCrossed, 
  Sparkles,
  Bike
} from 'lucide-react';
import { DeliveryLog, FuelExpense, MaintenanceRecord, OtherExpense, SyncLog, Vehicle } from '../types';

interface DashboardProps {
  deliveries: DeliveryLog[];
  fuelExpenses: FuelExpense[];
  maintenanceRecords: MaintenanceRecord[];
  otherExpenses: OtherExpense[];
  dailyGoal: number;
  onSetDailyGoal: (value: number) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  syncLogs: SyncLog[];
  onTriggerSync: () => void;
  vehicle: Vehicle;
  onUpdateVehicle: (fields: Partial<Vehicle>) => void;
  currentUser: any;
  customUsername?: string;
  customPassword?: string;
  onUpdateCredentials?: (user: string, pass: string) => Promise<void>;
}

export default function Dashboard({
  deliveries,
  fuelExpenses,
  maintenanceRecords,
  otherExpenses,
  dailyGoal,
  onSetDailyGoal,
  isOnline,
  onToggleOnline,
  syncLogs,
  onTriggerSync,
  vehicle,
  onUpdateVehicle,
  currentUser,
  customUsername = 'admin',
  customPassword = 'admin',
  onUpdateCredentials
}: DashboardProps) {
  const [editingGoal, setEditingGoal] = useState<boolean>(false);
  const [newGoalInput, setNewGoalInput] = useState<string>(dailyGoal.toString());
  const [activeTooltip, setActiveTooltip] = useState<{ day: string; value: number } | null>(null);

  const [usernameInput, setUsernameInput] = useState<string>(customUsername);
  const [passwordInput, setPasswordInput] = useState<string>(customPassword);
  const [updatingCreds, setUpdatingCreds] = useState<boolean>(false);
  const [credMessage, setCredMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleUpdateCreds = async () => {
    if (!usernameInput || !passwordInput) {
      setCredMessage({ text: 'Usuário e senha não podem ser vazios.', type: 'error' });
      return;
    }
    setUpdatingCreds(true);
    setCredMessage(null);
    try {
      if (onUpdateCredentials) {
        await onUpdateCredentials(usernameInput, passwordInput);
        setCredMessage({ text: 'Credenciais atualizadas com sucesso!', type: 'success' });
      } else {
        setCredMessage({ text: 'Função de atualização indisponível.', type: 'error' });
      }
    } catch (err: any) {
      setCredMessage({ text: err.message || 'Erro ao atualizar credenciais.', type: 'error' });
    } finally {
      setUpdatingCreds(false);
    }
  };

  // Filter deliveries for today (2026-07-16)
  const todayStr = "2026-07-16";
  const todayDeliveries = deliveries.filter(d => d.date === todayStr);
  const todayGrossEarnings = todayDeliveries.reduce((sum, d) => sum + d.earnings + d.tip, 0);
  const todayGoalPercent = Math.min(Math.round((todayGrossEarnings / dailyGoal) * 100), 100);

  // General Totals
  const totalGrossEarnings = deliveries.reduce((sum, d) => sum + d.earnings + d.tip, 0);
  const totalFuelCost = fuelExpenses.reduce((sum, f) => sum + f.totalCost, 0);
  const totalMaintenanceCost = maintenanceRecords.reduce((sum, m) => sum + m.cost, 0);
  const totalOtherCost = otherExpenses.reduce((sum, o) => sum + o.cost, 0);
  const totalExpenses = totalFuelCost + totalMaintenanceCost + totalOtherCost;
  const totalNetProfit = totalGrossEarnings - totalExpenses;

  // Active hours & wait time tracking
  const totalWaitTime = deliveries.reduce((sum, d) => sum + d.waitTimeMin, 0);
  const avgWaitTime = deliveries.length > 0 ? parseFloat((totalWaitTime / deliveries.length).toFixed(1)) : 0;
  
  const totalDistance = deliveries.reduce((sum, d) => sum + d.distanceKm, 0);

  // Group deliveries by day of the week for the chart
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weekDaysShort = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const dailyEarningsMap: { [key: string]: number } = {};

  // Last 7 days calculations
  // Let's extract last 7 days starting from 2026-07-10 to 2026-07-16
  const dateRange = ["2026-07-10", "2026-07-11", "2026-07-12", "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16"];
  
  dateRange.forEach(date => {
    dailyEarningsMap[date] = deliveries
      .filter(d => d.date === date)
      .reduce((sum, d) => sum + d.earnings + d.tip, 0);
  });

  const chartData = dateRange.map(date => {
    const d = new Date(date + "T00:00:00");
    const dayLabel = daysOfWeek[d.getDay()];
    return {
      date,
      day: dayLabel,
      value: dailyEarningsMap[date] || 0
    };
  });

  const maxChartValue = Math.max(...chartData.map(d => d.value), 100);

  // Projections
  // 7 days total net
  const past7DaysGross = deliveries
    .filter(d => dateRange.includes(d.date))
    .reduce((sum, d) => sum + d.earnings + d.tip, 0);
  
  const dailyAverageNet = (past7DaysGross - (totalExpenses / 14 * 7)) / 7; // rough estimate
  const projectedMonthlyNet = Math.max(dailyAverageNet * 26, 0); // 26 working days in a month

  const handleSaveGoal = () => {
    const val = parseFloat(newGoalInput);
    if (!isNaN(val) && val > 0) {
      onSetDailyGoal(val);
      setEditingGoal(false);
    }
  };

  return (
    <div id="dashboard-section" className="space-y-6">
      
      {/* Network / Sincronização Header Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111214] border border-[#212327] rounded-xl p-4 gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-white">Status de Sincronização</h3>
              <button 
                id="btn-toggle-online"
                onClick={onToggleOnline} 
                className="text-xxs font-bold px-2 py-0.5 rounded bg-[#212327] text-gray-300 hover:bg-yellow-400 hover:text-black transition-colors"
              >
                {isOnline ? 'Simular Offline' : 'Simular Online'}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {isOnline 
                ? 'Modo Online ativo. Seus registros estão sincronizados em tempo real.' 
                : 'Modo Offline ativo. Dados sendo guardados localmente com segurança.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="text-left md:text-right hidden sm:block">
            <p className="text-xxs text-gray-400 uppercase font-semibold">Última Sincronização</p>
            <p className="text-xs text-gray-200 font-mono mt-0.5">
              {syncLogs.length > 0 ? syncLogs[0].timestamp : 'Aguardando sincronia...'}
            </p>
          </div>
          <button
            id="btn-sync-now"
            onClick={onTriggerSync}
            disabled={!isOnline}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1b1e] border border-[#2d2e33] hover:border-[#facc15] hover:text-[#facc15] transition-all text-xs font-semibold text-gray-300 ml-auto md:ml-0 disabled:opacity-40 disabled:hover:border-[#2d2e33] disabled:hover:text-gray-300"
          >
            <RefreshCw className="w-4 h-4" />
            Sincronizar
          </button>
        </div>
      </div>

      {/* Speedometer & Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metas Diárias Speedometer Widget */}
        <div className="bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Meta Diária</h4>
                <p className="text-xxs text-gray-500">Ganhos de hoje (16 de Julho)</p>
              </div>
              <Gauge className="w-5 h-5 text-yellow-400" />
            </div>

            <div className="relative flex items-center justify-center py-6">
              {/* Semi-circle SVG speedometer */}
              <svg className="w-40 h-24" viewBox="0 0 100 60">
                {/* Background Track */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#222428"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Colored Progress */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="url(#speedometer-grad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="125.6"
                  strokeDashoffset={(125.6 - (125.6 * todayGoalPercent) / 100).toFixed(1)}
                  className="transition-all duration-1000 ease-out"
                />
                {/* Definitions */}
                <defs>
                  <linearGradient id="speedometer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="60%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute bottom-1 text-center">
                <p className="text-2xl font-display font-bold text-white leading-tight">
                  R$ {todayGrossEarnings.toFixed(2)}
                </p>
                <p className="text-xxs text-gray-400">
                  {todayGoalPercent}% da meta batida
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#212327] pt-4 mt-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xxs text-gray-400 uppercase font-semibold">Meta de Faturamento</p>
                {editingGoal ? (
                  <div className="flex gap-1.5 mt-1">
                    <input
                      id="input-new-goal"
                      type="number"
                      value={newGoalInput}
                      onChange={(e) => setNewGoalInput(e.target.value)}
                      className="w-20 bg-[#1a1b1e] border border-yellow-400 text-white px-2 py-0.5 rounded text-xs focus:outline-none"
                    />
                    <button 
                      id="btn-save-goal"
                      onClick={handleSaveGoal} 
                      className="bg-yellow-400 text-black px-2 py-0.5 rounded text-xxs font-bold hover:bg-yellow-500 transition-colors"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-300 font-semibold mt-0.5">
                    R$ {dailyGoal.toFixed(2)} / dia
                  </p>
                )}
              </div>
              {!editingGoal && (
                <button
                  id="btn-edit-goal"
                  onClick={() => setEditingGoal(true)}
                  className="text-xxs font-bold text-yellow-400 hover:text-yellow-500 transition-colors"
                >
                  Alterar Meta
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Financial Scorecards */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-[#111214] border border-[#212327] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <p className="text-xxs text-gray-400 font-semibold uppercase tracking-wider">Faturamento Total</p>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-white mt-2">
                R$ {totalGrossEarnings.toFixed(2)}
              </p>
            </div>
            <div className="text-xxs text-gray-400 flex items-center gap-1 mt-4">
              <span className="text-emerald-400 font-bold">R$ {(totalGrossEarnings / Math.max(deliveries.length, 1)).toFixed(2)}</span> por corrida
            </div>
          </div>

          <div className="bg-[#111214] border border-[#212327] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <p className="text-xxs text-gray-400 font-semibold uppercase tracking-wider">Despesas Totais</p>
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <Fuel className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-white mt-2">
                R$ {totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="text-xxs text-gray-400 flex flex-wrap justify-between mt-4">
              <span>⛽ Combustível: R$ {totalFuelCost.toFixed(0)}</span>
              <span>🔧 Oficinas: R$ {totalMaintenanceCost.toFixed(0)}</span>
            </div>
          </div>

          <div className="bg-[#111214] border border-[#212327] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <p className="text-xxs text-gray-400 font-semibold uppercase tracking-wider">Lucro Líquido Real</p>
                <div className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-yellow-400 mt-2">
                R$ {totalNetProfit.toFixed(2)}
              </p>
            </div>
            <div className="text-xxs text-gray-400 flex items-center gap-1 mt-4">
              Margem de <span className="text-yellow-400 font-bold">{totalGrossEarnings > 0 ? Math.round((totalNetProfit / totalGrossEarnings) * 100) : 0}%</span> faturado
            </div>
          </div>

          <div className="bg-[#111214] border border-[#212327] rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <p className="text-xxs text-gray-400 font-semibold uppercase tracking-wider">Tempo de Espera Ativo</p>
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-white mt-2">
                {avgWaitTime} <span className="text-xs text-gray-400">min</span>
              </p>
            </div>
            <div className="text-xxs text-gray-400 flex items-center gap-1 mt-4">
              <span>Tempo total parado: </span>
              <span className="text-sky-400 font-bold">{totalWaitTime} minutos</span>
            </div>
          </div>
        </div>

      </div>

      {/* Charts & Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Performance Custom SVG Chart */}
        <div className="lg:col-span-2 bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-display font-semibold text-white">Desempenho da Semana</h4>
                <p className="text-xs text-gray-400">Ganhos totais diários nos últimos 7 dias</p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>

            {/* SVG Interactive Chart */}
            <div className="relative h-48 w-full flex items-end justify-between px-2 pt-6 pb-2 select-none">
              {chartData.map((data, index) => {
                const heightPercent = Math.max((data.value / maxChartValue) * 100, 4);
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 group"
                    onMouseEnter={() => setActiveTooltip({ day: data.day, value: data.value })}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    {/* Hover tooltip for mobile/desktop fallback inside bars */}
                    <div className="absolute top-0 text-xxs font-mono font-bold text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#1c1d20] px-1.5 py-0.5 rounded border border-[#2d2e33]">
                      R$ {data.value.toFixed(0)}
                    </div>
                    {/* Bar container */}
                    <div className="w-8 sm:w-10 bg-[#1d1f22] rounded-t-md overflow-hidden h-36 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 rounded-t-md transition-all duration-500 origin-bottom"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                    {/* X Axis labels */}
                    <span className="text-xs font-semibold text-gray-400 mt-2.5 font-display">{data.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#212327] pt-4 flex justify-between text-xxs text-gray-500">
            <span>Período: 10/07 a 16/07</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-yellow-400 block"></span> Ganhos Brutos
            </span>
          </div>
        </div>

        {/* Projeção de Lucros e Dicas Inteligentes */}
        <div className="bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400">
                <Sparkles className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-white text-sm">Projeção Mensal</h4>
                <p className="text-xs text-gray-400">Estimado com base no rendimento</p>
              </div>
            </div>

            <div className="bg-[#18191c] border border-[#222428] rounded-xl p-4 mb-4 text-center">
              <p className="text-xxs text-gray-400 uppercase font-semibold">Previsão Lucro Líquido</p>
              <p className="text-3xl font-display font-bold text-emerald-400 mt-1">
                R$ {projectedMonthlyNet.toFixed(2)}
              </p>
              <p className="text-3xs text-gray-500 mt-1">
                Calculado para 26 dias úteis de trabalho
              </p>
            </div>

            {/* Eco Dicas do Turno */}
            <div className="space-y-3">
              <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Eco-Insights do Motoboy:</p>
              
              <div className="flex items-start gap-2.5 text-xs">
                <Fuel className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <span className="font-bold text-white">Posto Shell Consolação:</span> Gasolina R$ 5.75/L (Você economizaria R$ 0.15 por litro hoje).
                </p>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <Clock className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <span className="font-bold text-white">Espera alta no iFood:</span> Evite o Shopping Cidade SP entre 12h e 13h30 (média de 22 min de atraso).
                </p>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">
                  <span className="font-bold text-white">Relação e Pneus:</span> Rota Ecologicamente Otimizada evitou subidas acentuadas, poupando 5% da vida da corrente.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#212327] pt-4 mt-4">
            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-2.5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <p className="text-xxs text-gray-300">
                Sua próxima <span className="text-yellow-400 font-bold">troca de óleo</span> vence em <span className="font-bold">50 KM</span>!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Vehicle Profile & Settings Panel */}
      <div className="bg-[#111214] border border-[#212327] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4 justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-white">Meu Veículo & Perfil</h4>
              <p className="text-xs text-gray-400">Ajuste os dados do veículo e persistência online</p>
            </div>
          </div>
          {currentUser && (
            <span className="text-3xs font-semibold bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/30">
              CONEXÃO POSTGRES ATIVA
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xxs text-gray-400 font-bold uppercase">Modelo da Moto</label>
            <input
              type="text"
              value={vehicle.model}
              onChange={(e) => onUpdateVehicle({ model: e.target.value })}
              className="bg-[#18191c] border border-[#2d2e33] text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xxs text-gray-400 font-bold uppercase">Placa do Veículo</label>
            <input
              type="text"
              value={vehicle.plate}
              onChange={(e) => onUpdateVehicle({ plate: e.target.value.toUpperCase() })}
              className="bg-[#18191c] border border-[#2d2e33] text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 transition-colors uppercase font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xxs text-gray-400 font-bold uppercase">Consumo Médio (km/L)</label>
            <input
              type="number"
              value={vehicle.averageConsumption}
              onChange={(e) => onUpdateVehicle({ averageConsumption: parseFloat(e.target.value) || 0 })}
              className="bg-[#18191c] border border-[#2d2e33] text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xxs text-gray-400 font-bold uppercase">Tipo de Combustível</label>
            <select
              value={vehicle.fuelType}
              onChange={(e) => onUpdateVehicle({ fuelType: e.target.value as any })}
              className="bg-[#18191c] border border-[#2d2e33] text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 transition-colors"
            >
              <option value="Gasolina">Gasolina</option>
              <option value="Etanol">Etanol</option>
              <option value="Diesel">Diesel</option>
              <option value="Elétrico">Elétrico</option>
            </select>
          </div>
        </div>

        {/* Credentials Settings */}
        <div className="border-t border-[#212327] pt-4 mt-5">
          <h5 className="text-xs font-bold text-white mb-3 uppercase tracking-wider text-yellow-400">Credenciais de Acesso (Login)</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xxs text-gray-400 font-bold uppercase">Nome de Usuário</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="bg-[#18191c] border border-[#2d2e33] text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="Ex: admin"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xxs text-gray-400 font-bold uppercase">Nova Senha</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="bg-[#18191c] border border-[#2d2e33] text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="Sua senha"
              />
            </div>
            <div>
              <button
                id="btn-update-credentials"
                onClick={handleUpdateCreds}
                disabled={updatingCreds}
                className="w-full sm:w-auto px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black text-xs font-bold rounded-lg transition-colors focus:outline-none shadow-lg shadow-yellow-400/5 cursor-pointer"
              >
                {updatingCreds ? 'Salvando...' : 'Atualizar Credenciais'}
              </button>
            </div>
          </div>
          {credMessage && (
            <p className={`text-xxs mt-2 font-semibold ${credMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {credMessage.text}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
