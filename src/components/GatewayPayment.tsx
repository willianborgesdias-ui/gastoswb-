import React, { useState } from 'react';
import { CreditCard, QrCode, ShieldCheck, CheckCircle2, RefreshCw, Smartphone, AlertCircle, Sparkles, Copy, Check } from 'lucide-react';
import { PaymentTransaction } from '../types';

interface GatewayPaymentProps {
  transactions: PaymentTransaction[];
  onAddTransaction: (tx: Omit<PaymentTransaction, 'id' | 'date'>) => void;
  onAddLogMessage: (title: string, message: string, type: 'system' | 'delivery') => void;
}

export default function GatewayPayment({
  transactions,
  onAddTransaction,
  onAddLogMessage
}: GatewayPaymentProps) {
  const [activePaymentType, setActivePaymentType] = useState<'pix' | 'card'>('pix');

  // PIX State
  const [pixAmount, setPixAmount] = useState<string>('25.00');
  const [pixClientName, setPixClientName] = useState<string>('Carlos Eduardo');
  const [pixStatus, setPixStatus] = useState<'idle' | 'generating' | 'waiting' | 'paid'>('idle');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Card Reader State
  const [cardAmount, setCardAmount] = useState<string>('45.00');
  const [cardClientName, setCardClientName] = useState<string>('Fernanda Souza');
  const [cardMethod, setCardMethod] = useState<'Débito' | 'Crédito'>('Débito');
  const [cardStatus, setCardStatus] = useState<'idle' | 'connecting' | 'waiting_card' | 'processing' | 'approved' | 'failed'>('idle');

  const handleGeneratePix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixAmount || parseFloat(pixAmount) <= 0) return;
    setPixStatus('generating');
    
    setTimeout(() => {
      setPixStatus('waiting');
    }, 1000);
  };

  const simulatePixPayment = () => {
    setPixStatus('paid');
    onAddTransaction({
      clientName: pixClientName || "Cliente PIX",
      amount: parseFloat(pixAmount),
      method: 'PIX',
      status: 'Sucesso'
    });
    onAddLogMessage(
      "PIX Recebido",
      `R$ ${parseFloat(pixAmount).toFixed(2)} recebido de ${pixClientName || 'Cliente PIX'}.`,
      'system'
    );
  };

  const handleCopyPixCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleStartCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardAmount || parseFloat(cardAmount) <= 0) return;
    setCardStatus('connecting');

    // Simulate maquininha step 1: Connecting to terminal via Bluetooth
    setTimeout(() => {
      setCardStatus('waiting_card');
      
      // Simulate step 2: User inserts card or taps NFC
      setTimeout(() => {
        setCardStatus('processing');
        
        // Simulate step 3: Secure gateway transaction authentication
        setTimeout(() => {
          setCardStatus('approved');
          onAddTransaction({
            clientName: cardClientName || "Cliente Cartão",
            amount: parseFloat(cardAmount),
            method: 'Cartão',
            status: 'Sucesso'
          });
          onAddLogMessage(
            "Pagamento Aprovado",
            `Transação de R$ ${parseFloat(cardAmount).toFixed(2)} aprovada na maquininha.`,
            'system'
          );
        }, 1500);
      }, 2000);
    }, 1200);
  };

  const resetCardPayment = () => {
    setCardStatus('idle');
    setCardAmount('45.00');
    setCardClientName('Fernanda Souza');
  };

  return (
    <div id="payment-gateway-section" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Control Panel: PIX or CARD */}
      <div className="bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex border-b border-[#212327] mb-6">
            <button
              id="payment-tab-pix"
              onClick={() => {
                setActivePaymentType('pix');
                resetCardPayment();
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-colors ${
                activePaymentType === 'pix' 
                  ? 'border-yellow-400 text-yellow-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              ⚡ Cobrar com PIX
            </button>
            <button
              id="payment-tab-card"
              onClick={() => {
                setActivePaymentType('card');
                setPixStatus('idle');
              }}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-colors ${
                activePaymentType === 'card' 
                  ? 'border-yellow-400 text-yellow-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              💳 Maquininha Cartão
            </button>
          </div>

          {/* Sub Tab PIX */}
          {activePaymentType === 'pix' && (
            <div className="space-y-4">
              {pixStatus === 'idle' && (
                <form onSubmit={handleGeneratePix} className="space-y-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <QrCode className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Gerador de PIX QR</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Nome do Cliente</label>
                    <input
                      id="pix-client"
                      type="text"
                      placeholder="Ex: Carlos Eduardo"
                      value={pixClientName}
                      onChange={(e) => setPixClientName(e.target.value)}
                      className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Valor a Cobrar (R$) *</label>
                    <input
                      id="pix-amount"
                      type="number"
                      step="0.01"
                      required
                      value={pixAmount}
                      onChange={(e) => setPixAmount(e.target.value)}
                      className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <button
                    id="btn-generate-pix"
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow-lg shadow-yellow-400/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    Gerar Código QR PIX
                  </button>
                </form>
              )}

              {pixStatus === 'generating' && (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin" />
                  <p className="text-sm text-gray-300">Criando chave transacional criptografada...</p>
                </div>
              )}

              {pixStatus === 'waiting' && (
                <div className="space-y-4 text-center">
                  <div className="bg-[#18191c] border border-[#2d2e33] rounded-xl p-4 flex flex-col items-center">
                    {/* Simulated High Fidelity Vector PIX QR Code */}
                    <div className="w-40 h-40 bg-white p-2.5 rounded-lg shadow-lg relative flex items-center justify-center">
                      <svg className="w-full h-full text-black" viewBox="0 0 100 100">
                        {/* QR Grid Patterns representation */}
                        <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                        <rect x="9" y="9" width="12" height="12" fill="white" />
                        <rect x="11" y="11" width="8" height="8" fill="currentColor" />
                        
                        <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                        <rect x="79" y="9" width="12" height="12" fill="white" />
                        <rect x="81" y="11" width="8" height="8" fill="currentColor" />

                        <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                        <rect x="9" y="79" width="12" height="12" fill="white" />
                        <rect x="11" y="81" width="8" height="8" fill="currentColor" />

                        {/* Noise simulation dots */}
                        <rect x="30" y="5" width="4" height="4" fill="currentColor" />
                        <rect x="45" y="12" width="6" height="4" fill="currentColor" />
                        <rect x="55" y="8" width="10" height="6" fill="currentColor" />
                        <rect x="35" y="25" width="8" height="8" fill="currentColor" />
                        <rect x="55" y="30" width="12" height="6" fill="currentColor" />
                        <rect x="75" y="35" width="6" height="12" fill="currentColor" />
                        <rect x="15" y="35" width="14" height="4" fill="currentColor" />
                        
                        <rect x="30" y="45" width="20" height="10" fill="currentColor" />
                        <rect x="60" y="45" width="10" height="15" fill="currentColor" />
                        <rect x="10" y="60" width="8" height="8" fill="currentColor" />
                        <rect x="40" y="70" width="15" height="15" fill="currentColor" />
                        <rect x="70" y="70" width="20" height="10" fill="currentColor" />

                        {/* Central tiny PIX logo representation */}
                        <rect x="42" y="42" width="16" height="16" fill="white" rx="2" />
                        <path d="M50 45 L55 50 L50 55 L45 50 Z" fill="#02c3b3" />
                      </svg>
                    </div>

                    <p className="text-xs font-bold text-gray-200 mt-3">Valor Cobrado: R$ {parseFloat(pixAmount).toFixed(2)}</p>
                    <p className="text-3xs text-gray-400 mt-1">Cliente: {pixClientName}</p>
                  </div>

                  {/* Pix Copy and Paste */}
                  <div className="bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 flex items-center justify-between text-left">
                    <div className="truncate mr-3">
                      <p className="text-3xs text-gray-400 font-bold uppercase">Copia e Cola PIX</p>
                      <p className="text-xxs text-gray-300 font-mono truncate">00020101021226830014br.gov.bcb.pix0136motoboyprokey74920582030</p>
                    </div>
                    <button
                      id="btn-copy-pix-code"
                      onClick={handleCopyPixCode}
                      className="p-2 bg-[#2a2c31] text-white hover:text-yellow-400 rounded-lg"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-simulate-pix-pay"
                      onClick={simulatePixPayment}
                      className="py-2.5 bg-emerald-500 text-black rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                    >
                      Simular Pagamento
                    </button>
                    <button
                      id="btn-cancel-pix"
                      onClick={() => setPixStatus('idle')}
                      className="py-2.5 bg-[#212327] text-gray-300 rounded-lg text-xs font-semibold hover:border-gray-500 transition-colors"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}

              {pixStatus === 'paid' && (
                <div className="py-8 text-center space-y-4 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white">PIX Confirmado!</h4>
                    <p className="text-xs text-gray-400 mt-1">O saldo de R$ {parseFloat(pixAmount).toFixed(2)} foi adicionado ao seu faturamento.</p>
                  </div>
                  <button
                    id="btn-new-pix-billing"
                    onClick={() => {
                      setPixStatus('idle');
                      setPixAmount('25.00');
                    }}
                    className="px-4 py-2 bg-[#1c1d20] border border-[#2d2e33] hover:border-yellow-400 text-gray-300 rounded-lg text-xs font-bold"
                  >
                    Nova Cobrança
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sub Tab CARD READER */}
          {activePaymentType === 'card' && (
            <div className="space-y-4">
              {cardStatus === 'idle' && (
                <form onSubmit={handleStartCardPayment} className="space-y-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Maquininha Bluetooth</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Nome do Comprador</label>
                    <input
                      id="card-client"
                      type="text"
                      placeholder="Ex: Fernanda Souza"
                      value={cardClientName}
                      onChange={(e) => setCardClientName(e.target.value)}
                      className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Método</label>
                      <select
                        id="card-method"
                        value={cardMethod}
                        onChange={(e: any) => setCardMethod(e.target.value)}
                        className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
                      >
                        <option value="Débito">Débito</option>
                        <option value="Crédito">Crédito</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Valor (R$) *</label>
                      <input
                        id="card-amount"
                        type="number"
                        step="0.01"
                        required
                        value={cardAmount}
                        onChange={(e) => setCardAmount(e.target.value)}
                        className="w-full bg-[#18191c] border border-[#2d2e33] rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-trigger-card-billing"
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm shadow-lg shadow-yellow-400/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    Enviar p/ Maquininha
                  </button>
                </form>
              )}

              {cardStatus === 'connecting' && (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin" />
                  <p className="text-sm text-gray-300">Conectando à maquininha Bluetooth...</p>
                  <p className="text-xxs text-gray-500">Buscando pareamento seguro local...</p>
                </div>
              )}

              {cardStatus === 'waiting_card' && (
                <div className="py-10 text-center flex flex-col items-center justify-center space-y-4">
                  <Smartphone className="w-12 h-12 text-yellow-400 animate-pulse" />
                  <div>
                    <p className="text-sm font-bold text-white">Insira ou Aproxime o Cartão</p>
                    <p className="text-xs text-yellow-400 font-bold mt-1">R$ {parseFloat(cardAmount).toFixed(2)} ({cardMethod})</p>
                    <p className="text-xxs text-gray-400 mt-2">Suporta pagamentos por aproximação (NFC), Google Pay e Apple Pay.</p>
                  </div>
                  <div className="w-full bg-yellow-400/5 p-2 rounded border border-yellow-400/10">
                    <p className="text-3xs text-yellow-400 font-semibold animate-pulse">LENDO CHIP NFC ...</p>
                  </div>
                </div>
              )}

              {cardStatus === 'processing' && (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-sm text-gray-300">Autenticando transação segura com o banco...</p>
                  <p className="text-xxs text-gray-500">Criptografia RSA de 2048 bits ativa.</p>
                </div>
              )}

              {cardStatus === 'approved' && (
                <div className="py-8 text-center space-y-4 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-white">Transação Autorizada!</h4>
                    <p className="text-xs text-gray-400 mt-1">Comprovante impresso e enviado por SMS.</p>
                  </div>
                  <button
                    id="btn-card-reset"
                    onClick={resetCardPayment}
                    className="px-4 py-2 bg-[#1c1d20] border border-[#2d2e33] hover:border-yellow-400 text-gray-300 rounded-lg text-xs font-bold"
                  >
                    Pronto / Nova Venda
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Security Shield Label */}
        <div className="border-t border-[#212327] pt-4 mt-6">
          <div className="bg-[#18191c] border border-[#2d2e33] rounded-lg p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xxs font-bold text-white uppercase tracking-wider">Gateway Integrado Seguro</p>
              <p className="text-3xs text-gray-400 mt-1">Conformidade total com regulamentações PCI-DSS. Suas vendas são repassadas no mesmo dia diretamente para sua conta bancária sem intermediários abusivos.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Gateway Ledger - Transactions history list */}
      <div className="xl:col-span-2 bg-[#111214] border border-[#212327] rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-white">Histórico de Recebimentos</h3>
              <p className="text-xs text-gray-400">Extrato de vendas e transações financeiras</p>
            </div>
            <Smartphone className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {transactions.map((tx) => {
              const isPix = tx.method === 'PIX';
              const isCompleted = tx.status === 'Sucesso';
              const isPending = tx.status === 'Pendente';
              
              return (
                <div
                  key={tx.id}
                  className="bg-[#18191c] border border-[#222428] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      isPix ? 'bg-[#02c3b3]/10 text-[#02c3b3]' : 'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {isPix ? '⚡' : '💳'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-white text-sm">{tx.clientName}</span>
                        <span className="text-xxs text-gray-400 font-mono">ID: {tx.id}</span>
                      </div>
                      <p className="text-xxs text-gray-400 mt-0.5">
                        Cobrado via <span className="text-white font-semibold">{tx.method}</span> • {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t border-[#222428] sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white font-mono">
                        R$ {tx.amount.toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-1">
                      <span className={`text-3xs font-bold px-2 py-0.5 rounded ${
                        isCompleted 
                          ? 'bg-emerald-500/15 text-emerald-400' 
                          : isPending 
                            ? 'bg-yellow-400/15 text-yellow-400' 
                            : 'bg-red-500/15 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Ledger overview card */}
        <div className="border-t border-[#212327] pt-4 mt-6 flex justify-between items-center text-xxs text-gray-400">
          <span>Vendas totais hoje: <strong className="text-white font-mono">R$ {transactions.filter(t => t.status === 'Sucesso').reduce((s,t) => s + t.amount, 0).toFixed(2)}</strong></span>
          <span>Sucesso de aprovação: <strong className="text-emerald-400">100%</strong></span>
        </div>

      </div>

    </div>
  );
}
