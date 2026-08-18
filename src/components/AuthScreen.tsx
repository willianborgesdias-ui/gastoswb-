import React, { useState } from 'react';
import {
  Bike,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  Users,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  usersList: UserProfile[];
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
  onCreateUser: (newUser: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  usersList,
  currentUser,
  onLoginSuccess,
  onCreateUser,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [username, setUsername] = useState(currentUser.username || 'william');
  const [password, setPassword] = useState(currentUser.password || '123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMotoModel, setRegMotoModel] = useState('Honda CG 160 Fan');
  const [regMotoPlate, setRegMotoPlate] = useState('');
  const [regCurrentKm, setRegCurrentKm] = useState('25000');
  const [regMonthlyGoal, setRegMonthlyGoal] = useState('4500');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const found = usersList.find(
      (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
    );

    if (found) {
      setErrorMsg('');
      onLoginSuccess(found);
    } else {
      setErrorMsg('Usuário ou senha incorretos. Verifique suas credenciais.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = regUsername.trim().toLowerCase();
    const cleanPass = regPassword.trim();
    const cleanName = regName.trim();

    if (!cleanName || !cleanUser || !cleanPass) {
      setErrorMsg('Por favor, preencha nome, usuário e senha.');
      return;
    }

    if (usersList.some((u) => u.username.toLowerCase() === cleanUser)) {
      setErrorMsg(`O usuário "${cleanUser}" já está cadastrado. Escolha outro.`);
      return;
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: cleanName,
      username: cleanUser,
      password: cleanPass,
      occupation: 'Autônomo / Entregador',
      motoModel: regMotoModel.trim() || 'Moto Autônomo',
      motoPlate: regMotoPlate.trim().toUpperCase() || '',
      currentOdometer: parseInt(regCurrentKm, 10) || 0,
      monthlyRevenueGoal: parseFloat(regMonthlyGoal) || 4500,
      isDarkMode: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onCreateUser(newUser);
    setRegSuccessMsg(`Usuário ${newUser.name} criado com sucesso! Entrando...`);
    setErrorMsg('');

    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 600);
  };

  const handleSelectQuickUser = (user: UserProfile) => {
    setUsername(user.username);
    setPassword(user.password);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-3.5 sm:px-6 py-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md space-y-5 relative z-10">
        {/* Brand & Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/25 text-slate-950 font-black mb-3">
            <Bike className="w-9 h-9 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Finan<span className="text-emerald-400">Autônomo</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Gestão financeira para Autônomos & Motoboys • Separação PF / PJ
          </p>
        </div>

        {/* Tab Switcher: Entrar vs Criar Novo Usuário */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mode === 'LOGIN'
                ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Entrar na Conta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg('');
            }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mode === 'REGISTER'
                ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Criar Usuário</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {regSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{regSuccessMsg}</span>
            </div>
          )}

          {mode === 'LOGIN' ? (
            /* ================= LOGIN MODE ================= */
            <div className="space-y-4">
              {/* Quick User Selection Chips */}
              {usersList.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      Usuários Cadastrados
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Toque para selecionar</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {usersList.map((u) => {
                      const isSelected = username.toLowerCase() === u.username.toLowerCase();
                      return (
                        <button
                          key={u.id || u.username}
                          type="button"
                          onClick={() => handleSelectQuickUser(u)}
                          className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                              isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">@{u.username}</p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5 pt-1">
                {/* Username Input */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Nome de Usuário (Login)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ex: william"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-400 block">
                      Senha de Acesso
                    </label>
                    <span className="text-[10px] text-slate-500">Padrão William: 123</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-slate-500 hover:text-slate-300 absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 mt-2"
                >
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>
            </div>
          ) : (
            /* ================= REGISTER MODE ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Crie uma nova conta com suas próprias credenciais e moto.</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Nome Completo / Como quer ser chamado *
                </label>
                <input
                  type="text"
                  placeholder="Ex: William Borges"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Usuário (Login) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: will"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    placeholder="Sua senha"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Modelo da Moto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CG 160 / Fazer"
                    value={regMotoModel}
                    onChange={(e) => setRegMotoModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Placa (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: BRA3X99"
                    value={regMotoPlate}
                    onChange={(e) => setRegMotoPlate(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Hodômetro Atual (KM)
                  </label>
                  <input
                    type="number"
                    value={regCurrentKm}
                    onChange={(e) => setRegCurrentKm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Meta Mensal (R$)
                  </label>
                  <input
                    type="number"
                    value={regMonthlyGoal}
                    onChange={(e) => setRegMonthlyGoal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 mt-3"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Criar Conta e Entrar</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer Features Info */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 pt-1">
          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <span className="text-slate-300 font-bold block">PF vs PJ</span>
            Separação Clara
          </div>
          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <span className="text-slate-300 font-bold block">Editar & Apagar</span>
            Controle Total
          </div>
          <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <span className="text-slate-300 font-bold block">Multi-Usuários</span>
            Perfis Próprios
          </div>
        </div>
      </div>
    </div>
  );
};
