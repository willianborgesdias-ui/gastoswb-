import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  Wrench,
  BarChart3,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'transactions' | 'maintenance' | 'reports';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  maintenanceAlertCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  maintenanceAlertCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Tab: Dashboard */}
        <button
          id="nav-dashboard-btn"
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Painel</span>
        </button>

        {/* Tab: Transactions */}
        <button
          id="nav-transactions-btn"
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'transactions'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ReceiptText className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Extrato</span>
        </button>

        {/* Center Floating Action Button (New Transaction) */}
        <div className="flex-1 flex justify-center items-center">
          <button
            id="quick-add-transaction-btn"
            onClick={onOpenNewTransaction}
            className="w-13 h-13 -mt-6 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Adicionar Nova Transação"
            title="Novo Lançamento"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab: Moto Maintenance */}
        <button
          id="nav-maintenance-btn"
          onClick={() => setActiveTab('maintenance')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'maintenance'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Wrench className="w-5 h-5 mb-1" />
            {maintenanceAlertCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {maintenanceAlertCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Moto</span>
        </button>

        {/* Tab: Reports */}
        <button
          id="nav-reports-btn"
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'reports'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Relatórios</span>
        </button>
      </div>
    </nav>
  );
};
