import React, { useState } from 'react';
import { PlusCircle, ListFilter, ClipboardCheck, ArrowUpRight, Clock, Navigation, Check, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { DeliveryLog } from '../types';

interface LogDeliveriesProps {
  deliveries: DeliveryLog[];
  onAddDelivery: (delivery: Omit<DeliveryLog, 'id'>) => void;
  currentKm: number;
  onUpdateKm: (newKm: number) => void;
  onOpenGpsSim: () => void; // callbacks to open GPS map simulation tab
}

export default function LogDeliveries({
  deliveries,
  onAddDelivery,
  currentKm,
  onUpdateKm,
  onOpenGpsSim
}: LogDeliveriesProps) {
  const [app, setApp] = useState<'iFood' | 'Rappi' | 'Uber Flash' | 'Loggi' | 'Particular' | 'Outro'>('iFood');
  const [earnings, setEarnings] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [tip, setTip] = useState<string>('');
  const [waitTimeMin, setWaitTimeMin] = useState<string>('');
  const [kmStart, setKmStart] = useState<string>(currentKm.toString());
  const [kmEnd, setKmEnd] = useState<string>((currentKm + 5).toString());
  const [fromAddress, setFromAddress] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('Todos');

  // Success state feedback
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedEarnings = parseFloat(earnings);
    const parsedDistance = parseFloat(distanceKm);
    const parsedTip = tip ? parseFloat(tip) : 0;
    const parsedWait = waitTimeMin ? parseInt(waitTimeMin) : 0;
    const parsedKmStart = parseFloat(kmStart);
    const parsedKmEnd = parseFloat(kmEnd);

    if (isNaN(parsedEarnings) || isNaN(parsedDistance) || isNaN(parsedKmStart) || isNaN(parsedKmEnd)) {
      alert("Por favor preencha todos os campos obrigatórios corretamente.");
      return;
    }

    if (parsedKmEnd < parsedKmStart) {
      alert("O KM final não pode ser menor que o KM inicial.");
      return;
    }

    onAddDelivery({
      app,
      earnings: parsedEarnings,
      distanceKm: parsedDistance,
      tip: parsedTip,
      waitTimeMin: parsedWait,
      date: new Date().toISOString().split('T')[0], // today's date
      kmStart: parsedKmStart,
      kmEnd: parsedKmEnd,
      fromAddress: fromAddress || "Origem não informada",
      toAddress: toAddress || "Destino não informado",
      status: "Concluído"
    });

    // Update global vehicle current KM
    onUpdateKm(parsedKmEnd);

    // Reset fields
    setEarnings('');
    setDistanceKm('');
    setTip('');
    setWaitTimeMin('');
    setFromAddress('');
    setToAddress('');
    setKmStart(parsedKmEnd.toString());
    setKmEnd((parsedKmEnd + 5).toString());

    // Show toast
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Pre-fill distance based on KM start and KM end
  const handleKmChange = (start: string, end: string) => {
    setKmStart(start);
    setKmEnd(end);
    const s = parseFloat(start);
    const e = parseFloat(end);
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      setDistanceKm((e - s).toFixed(1));
    }
  };

  const filteredDeliveries = selectedFilter === 'Todos'
    ? deliveries
    : deliveries.filter(d => d.app === selectedFilter);

  return (
    <div id="log-deliveries-section" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Toast Feedback */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-black px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 font-semibold text-sm transition-all animate-bounce">
          <Check className="w-5 h-5" />
          Corrida adicionada e KM atualizado com sucesso!
        </div>
      )}

      {/* Manual Logging Form */}
      <div className="bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-display font-semibold text-white">Registrar Corrida</h3>
              <p className="text-xs text-gray-400">Insira os dados da sua entrega</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* App Selection */}
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-400 mb-1">Aplicativo ou Cliente *</label>
                <select
                  id="select-app"
                  value={app}
                  onChange={(e: any) => setApp(e.target.value)}
                  className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="iFood">iFood</option>
                  <option value="Rappi">Rappi</option>
                  <option value="Uber Flash">Uber Flash</option>
                  <option value="Loggi">Loggi</option>
                  <option value="Particular">Particular</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            {/* Odometer Trackers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">KM Inicial *</label>
                <input
                  id="input-km-start"
                  type="number"
                  step="0.1"
                  required
                  value={kmStart}
                  onChange={(e) => handleKmChange(e.target.value, kmEnd)}
                  className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">KM Final *</label>
                <input
                  id="input-km-end"
                  type="number"
                  step="0.1"
                  required
                  value={kmEnd}
                  onChange={(e) => handleKmChange(kmStart, e.target.value)}
                  className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-400 mb-1">Valor da Corrida (R$) *</label>
                <input
                  id="input-earnings"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={earnings}
                  onChange={(e) => setEarnings(e.target.value)}
                  className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Gorjeta (R$)</label>
                <input
                  id="input-tip"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Distance & Wait Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Distância (KM) *</label>
                <input
                  id="input-distance"
                  type="number"
                  step="0.1"
                  required
                  placeholder="Calculado auto"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Tempo Espera (min)</label>
                <input
                  id="input-wait-time"
                  type="number"
                  placeholder="Minutos de espera"
                  value={waitTimeMin}
                  onChange={(e) => setWaitTimeMin(e.target.value)}
                  className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Ponto de Origem (Coleta)</label>
                <input
                  id="input-from"
                  type="text"
                  placeholder="Ex: Shopping Metrô Santa Cruz"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Ponto de Destino (Entrega)</label>
                <input
                  id="input-to"
                  type="text"
                  placeholder="Ex: Rua Domingos de Morais, 250"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <button
              id="btn-submit-delivery"
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow-lg shadow-yellow-400/10 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Salvar Corrida
            </button>
          </form>
        </div>

        {/* GPS Shortcut Banner */}
        <div className="bg-gradient-to-r from-yellow-400/10 to-transparent border border-yellow-400/20 rounded-xl p-4 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-yellow-400 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-white">Prefere rastreamento em tempo real?</p>
              <p className="text-xxs text-gray-400 mt-0.5">Use o GPS integrado para rastrear no mapa!</p>
            </div>
          </div>
          <button
            id="btn-open-gps-tab"
            onClick={onOpenGpsSim}
            className="px-2.5 py-1.5 bg-yellow-400 text-black rounded-lg text-xxs font-bold hover:bg-yellow-500 transition-colors"
          >
            Rastrear no Mapa
          </button>
        </div>
      </div>

      {/* Deliveries History Logs */}
      <div className="xl:col-span-2 bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="font-display font-semibold text-white">Histórico de Corridas</h3>
              <p className="text-xs text-gray-400">Suas coletas e entregas registradas</p>
            </div>

            {/* Filters */}
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              {['Todos', 'iFood', 'Rappi', 'Uber Flash', 'Particular'].map((filt) => (
                <button
                  key={filt}
                  id={`btn-filter-${filt}`}
                  onClick={() => setSelectedFilter(filt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedFilter === filt
                      ? 'bg-yellow-400 text-black'
                      : 'bg-[#18191c] text-gray-400 border border-[#2d2e33] hover:text-white'
                  }`}
                >
                  {filt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredDeliveries.length === 0 ? (
              <div className="text-center py-10 bg-[#18191c] border border-dashed border-[#2d2e33] rounded-xl">
                <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhuma entrega encontrada para este filtro.</p>
              </div>
            ) : (
              [...filteredDeliveries].reverse().map((delivery) => {
                const isIFood = delivery.app === 'iFood';
                const isRappi = delivery.app === 'Rappi';
                const isUber = delivery.app === 'Uber Flash';
                const logoChar = isIFood ? '🍕' : isRappi ? '🥐' : isUber ? '📦' : '🏍️';
                
                return (
                  <div
                    key={delivery.id}
                    className="bg-[#18191c] border border-[#222428] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-400/5 border border-yellow-400/20 flex items-center justify-center text-lg flex-shrink-0">
                        {logoChar}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-white text-sm">{delivery.app}</span>
                          <span className="text-xxs text-gray-400 font-mono">{delivery.date}</span>
                        </div>
                        
                        <div className="text-xs text-gray-400 space-y-0.5">
                          <p className="flex items-center gap-1">
                            <span className="font-bold text-gray-200">De:</span> {delivery.fromAddress}
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="font-bold text-gray-200">Para:</span> {delivery.toAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-between sm:justify-center items-end border-t border-[#222428] sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400 font-mono">
                          R$ {(delivery.earnings + delivery.tip).toFixed(2)}
                        </p>
                        {delivery.tip > 0 && (
                          <p className="text-xxs text-emerald-400 font-semibold italic">
                            + R$ {delivery.tip.toFixed(2)} gorjeta
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2.5 mt-2 text-xxs font-semibold text-gray-400">
                        <span className="flex items-center gap-1 text-yellow-400 font-mono">
                          <Navigation className="w-3 h-3 text-yellow-400" />
                          {delivery.distanceKm} KM
                        </span>
                        {delivery.waitTimeMin > 0 && (
                          <span className="flex items-center gap-1 text-sky-400">
                            <Clock className="w-3 h-3" />
                            {delivery.waitTimeMin} min espera
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Global Odometer Card */}
        <div className="border-t border-[#212327] pt-4 mt-6 flex justify-between items-center bg-[#151619] p-4 rounded-xl">
          <div>
            <p className="text-xxs text-gray-400 uppercase font-semibold">Odômetro Geral do Veículo</p>
            <p className="text-lg font-mono font-bold text-yellow-400 mt-0.5">
              {currentKm.toLocaleString('pt-BR')} <span class="text-xs font-sans text-gray-400">KM rodados</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xxs text-gray-400 font-semibold">Consumo estimado de hoje</p>
            <p className="text-sm text-gray-200 font-mono font-bold">
              {(deliveries.filter(d => d.date === "2026-07-16").reduce((sum, d) => sum + d.distanceKm, 0) / 38).toFixed(2)} Litros
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
