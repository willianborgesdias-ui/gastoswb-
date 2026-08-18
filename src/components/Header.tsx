import React from 'react';
import {
  Bike,
  Building2,
  Layers,
  LogOut,
  Moon,
  Sun,
  User,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { AccountType, UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  activeAccount: AccountType;
  setActiveAccount: (account: AccountType) => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onLogout: () => void;
  onToggleDarkMode: () => void;
  balances: {
    pf: number;
    pj: number;
    consolidado: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  activeAccount,
  setActiveAccount,
  userProfile,
  onOpenProfile,
  onLogout,
  onToggleDarkMode,
  balances,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-colors duration-200">
      {/* Top bar with Branding, Profile, Theme Toggle */}
      <div className="max-w-5xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
            <Bike className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                Finan<span className="text-emerald-400">Autônomo</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[180px] sm:max-w-[260px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {userProfile.motoModel ? `${userProfile.motoModel} • ${userProfile.currentOdometer.toLocaleString('pt-BR')} km` : userProfile.name}
            </p>
          </div>
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Dark Mode toggle */}
          <button
            onClick={onToggleDarkMode}
            id="theme-toggle-btn"
            title={userProfile.isDarkMode ? "Modo Claro" : "Modo Escuro"}
            aria-label="Alternar tema"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {userProfile.isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-300" />
            )}
          </button>

          {/* User Profile Button */}
          <button
            onClick={onOpenProfile}
            id="user-profile-btn"
            title="Meu Perfil e Configurações"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 text-xs font-medium transition-all"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline truncate max-w-[90px]">{userProfile.name.split(' ')[0]}</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            id="logout-btn"
            title="Sair do App"
            className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Account Type Switcher (PF / PJ / Consolidado) */}
      <div className="max-w-5xl mx-auto px-3 pb-2.5">
        <div className="bg-slate-950/70 p-1 rounded-2xl border border-slate-800/80 grid grid-cols-3 gap-1">
          {/* PF Tab */}
          <button
            id="tab-pf"
            onClick={() => setActiveAccount('PF')}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl font-medium text-xs transition-all duration-200 ${
              activeAccount === 'PF'
                ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Pessoa Física</span>
            </div>
            <span className={`text-[11px] mt-0.5 ${activeAccount === 'PF' ? 'text-blue-100' : 'text-slate-500'}`}>
              {formatCurrency(balances.pf)}
            </span>
          </button>

          {/* PJ Tab */}
          <button
            id="tab-pj"
            onClick={() => setActiveAccount('PJ')}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl font-medium text-xs transition-all duration-200 ${
              activeAccount === 'PJ'
                ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>PJ (Trabalho/Moto)</span>
            </div>
            <span className={`text-[11px] mt-0.5 ${activeAccount === 'PJ' ? 'text-emerald-100' : 'text-slate-500'}`}>
              {formatCurrency(balances.pj)}
            </span>
          </button>

          {/* Consolidado Tab */}
          <button
            id="tab-consolidado"
            onClick={() => setActiveAccount('CONSOLIDADO')}
            className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl font-medium text-xs transition-all duration-200 ${
              activeAccount === 'CONSOLIDADO'
                ? 'bg-gradient-to-b from-purple-600 to-purple-700 text-white shadow-md shadow-purple-900/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Consolidado</span>
            </div>
            <span className={`text-[11px] mt-0.5 ${activeAccount === 'CONSOLIDADO' ? 'text-purple-100' : 'text-slate-500'}`}>
              {formatCurrency(balances.consolidado)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
