import React, { useState } from 'react';
import {
  X,
  User,
  KeyRound,
  Bike,
  Gauge,
  Target,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  Users,
  Trash2,
  ArrowRightLeft,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  usersList: UserProfile[];
  onSaveProfile: (profile: UserProfile) => void;
  onCreateUser: (newUser: UserProfile) => void;
  onSwitchUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  onResetData: () => void;
  onExportBackupJSON: () => void;
  onImportBackupJSON: (file: File) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  usersList,
  onSaveProfile,
  onCreateUser,
  onSwitchUser,
  onDeleteUser,
  onResetData,
  onExportBackupJSON,
  onImportBackupJSON,
}) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'USERS' | 'DATA'>('PROFILE');

  // Profile Edit State
  const [name, setName] = useState(userProfile.name);
  const [username, setUsername] = useState(userProfile.username);
  const [password, setPassword] = useState(userProfile.password);
  const [showPassword, setShowPassword] = useState(false);
  const [motoModel, setMotoModel] = useState(userProfile.motoModel);
  const [motoPlate, setMotoPlate] = useState(userProfile.motoPlate || '');
  const [currentOdometer, setCurrentOdometer] = useState(userProfile.currentOdometer.toString());
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState(userProfile.monthlyRevenueGoal.toString());
  const [showSavedToast, setShowSavedToast] = useState(false);

  // New User Form inside modal
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserLogin, setNewUserLogin] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserMoto, setNewUserMoto] = useState('Honda CG 160 Fan');
  const [newUserKm, setNewUserKm] = useState('20000');
  const [newUserGoal, setNewUserGoal] = useState('4500');
  const [userErrorMsg, setUserErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSaveCurrentProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('Nome de usuário e senha não podem ficar vazios.');
      return;
    }

    // Check if username is taken by another user
    const usernameConflict = usersList.some(
      (u) =>
        (u.id ? u.id !== userProfile.id : u.username !== userProfile.username) &&
        u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (usernameConflict) {
      alert(`O nome de usuário "${username}" já pertence a outra conta.`);
      return;
    }

    const updated: UserProfile = {
      ...userProfile,
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      motoModel: motoModel.trim(),
      motoPlate: motoPlate.trim().toUpperCase(),
      currentOdometer: parseInt(currentOdometer, 10) || 0,
      monthlyRevenueGoal: parseFloat(monthlyRevenueGoal) || 4500,
    };

    onSaveProfile(updated);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
    }, 1500);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLogin = newUserLogin.trim().toLowerCase();
    const cleanPass = newUserPassword.trim();
    const cleanName = newUserName.trim();

    if (!cleanName || !cleanLogin || !cleanPass) {
      setUserErrorMsg('Preencha nome, login e senha para criar o usuário.');
      return;
    }

    if (usersList.some((u) => u.username.toLowerCase() === cleanLogin)) {
      setUserErrorMsg(`O login "${cleanLogin}" já está em uso.`);
      return;
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: cleanName,
      username: cleanLogin,
      password: cleanPass,
      occupation: 'Autônomo / Motoboy',
      motoModel: newUserMoto.trim() || 'Moto Autônomo',
      motoPlate: '',
      currentOdometer: parseInt(newUserKm, 10) || 0,
      monthlyRevenueGoal: parseFloat(newUserGoal) || 4500,
      isDarkMode: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onCreateUser(newUser);
    setIsCreatingNew(false);
    setNewUserName('');
    setNewUserLogin('');
    setNewUserPassword('');
    setUserErrorMsg('');
    alert(`Usuário "${newUser.name}" criado com sucesso!`);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportBackupJSON(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Perfil & Gerenciador de Usuários</h3>
              <p className="text-xs text-slate-400">Usuário ativo: <strong className="text-emerald-400">{userProfile.name}</strong> (@{userProfile.username})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-bold px-3 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'PROFILE'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Meu Perfil & Senha</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('USERS')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'USERS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários ({usersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DATA')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'DATA'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Backup</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {showSavedToast && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dados e credenciais de acesso salvos com sucesso!</span>
            </div>
          )}

          {/* TAB 1: MEU PERFIL & SENHA */}
          {activeTab === 'PROFILE' && (
            <form onSubmit={handleSaveCurrentProfile} className="space-y-4">
              {/* Autenticação e Credenciais */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  1. Alterar Usuário & Senha
                </span>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Nome Completo / Apelido
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Usuário de Login
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Senha de Acesso
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 text-slate-400 hover:text-white absolute right-1.5 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados do Veículo */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bike className="w-4 h-4" />
                  2. Dados da Moto / Veículo (PJ)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Modelo da Moto
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Honda CG 160 Fan"
                      value={motoModel}
                      onChange={(e) => setMotoModel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Placa (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: BRA-3X99"
                      value={motoPlate}
                      onChange={(e) => setMotoPlate(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Hodômetro Atual (KM)
                    </label>
                    <input
                      type="number"
                      value={currentOdometer}
                      onChange={(e) => setCurrentOdometer(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Meta Faturamento Mensal (R$)
                    </label>
                    <input
                      type="number"
                      value={monthlyRevenueGoal}
                      onChange={(e) => setMonthlyRevenueGoal(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Botão Salvar Perfil */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Salvar Alterações de Perfil & Senha</span>
              </button>
            </form>
          )}

          {/* TAB 2: GERENCIADOR DE USUÁRIOS */}
          {activeTab === 'USERS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Usuários Cadastrados</h4>
                  <p className="text-xs text-slate-400">Gerencie contas, crie novos acessos ou troque de perfil</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingNew(!isCreatingNew)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isCreatingNew ? 'Cancelar' : '+ Novo Usuário'}</span>
                </button>
              </div>

              {/* Form to create new user */}
              {isCreatingNew && (
                <form
                  onSubmit={handleCreateNewUser}
                  className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-3 animate-fade-in"
                >
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    Cadastrar Novo Usuário
                  </span>

                  {userErrorMsg && (
                    <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs">
                      {userErrorMsg}
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: William Borges"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
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
                        value={newUserLogin}
                        onChange={(e) => setNewUserLogin(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Senha *
                      </label>
                      <input
                        type="text"
                        placeholder="Senha de acesso"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
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
                        value={newUserMoto}
                        onChange={(e) => setNewUserMoto(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Hodômetro (KM)
                      </label>
                      <input
                        type="number"
                        value={newUserKm}
                        onChange={(e) => setNewUserKm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar e Cadastrar Usuário</span>
                  </button>
                </form>
              )}

              {/* Users List */}
              <div className="space-y-2">
                {usersList.map((user) => {
                  const isCurrent =
                    (user.id && user.id === userProfile.id) ||
                    user.username.toLowerCase() === userProfile.username.toLowerCase();

                  return (
                    <div
                      key={user.id || user.username}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-slate-950 border-emerald-500/60 shadow-sm'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                            isCurrent
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs sm:text-sm font-bold text-white truncate">
                              {user.name}
                            </h5>
                            {isCurrent && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.2 rounded-full border border-emerald-500/30 shrink-0">
                                Ativo Agora
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            Login: <strong className="text-slate-300">@{user.username}</strong> • Moto: {user.motoModel || 'Padrão'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              onSwitchUser(user);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 flex items-center gap-1 transition-colors"
                            title="Trocar para este usuário"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Trocar</span>
                          </button>
                        )}

                        {usersList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja realmente apagar o usuário "${user.name}" (@${user.username})?`)) {
                                onDeleteUser(user.id || user.username);
                              }
                            }}
                            className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/50 transition-colors"
                            title="Apagar Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DATA & BACKUP */}
          {activeTab === 'DATA' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Exportar & Restaurar Backup (JSON)
                </span>
                <p className="text-xs text-slate-400">
                  Salve todos os seus dados com segurança em arquivo JSON para nunca perder nada.
                </p>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onExportBackupJSON}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Salvar Backup</span>
                  </button>

                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Restaurar Backup</span>
                    <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-rose-900/40 space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                  Restaurar Demonstração
                </span>
                <p className="text-xs text-slate-400">
                  Restaura o usuário padrão William e dados iniciais de exemplo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja restaurar todos os dados de demonstração iniciais para o William? Seus lançamentos atuais serão redefinidos.')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-rose-400 hover:bg-rose-950/40 text-xs font-bold border border-rose-900/40 transition-colors mt-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restaurar Dados Iniciais de William</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
