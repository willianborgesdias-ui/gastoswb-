import React, { useState, useEffect, useMemo } from 'react';
import {
  AccountType,
  Category,
  DateFilter,
  MaintenanceItem,
  Transaction,
  UserProfile,
} from './types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MAINTENANCE_ITEMS,
  DEFAULT_USER_PROFILE,
  DEFAULT_USERS_LIST,
  INITIAL_TRANSACTIONS,
} from './data/defaultData';
import { Header } from './components/Header';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { TransactionsList } from './components/TransactionsList';
import { MotoMaintenance } from './components/MotoMaintenance';
import { Reports } from './components/Reports';
import { TransactionModal } from './components/TransactionModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthScreen } from './components/AuthScreen';
import {
  calculateMaintenanceStatus,
  filterTransactionsByPeriod,
} from './utils/formatters';
import { exportTransactionsToCSV } from './utils/exportUtils';

export default function App() {
  // 1. Persistent Users List State
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('finan_users_list');
      return saved ? JSON.parse(saved) : DEFAULT_USERS_LIST;
    } catch {
      return DEFAULT_USERS_LIST;
    }
  });

  // 2. Active User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('finan_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
      return DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  // 3. Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('finan_is_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  // 4. Persistent Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('finan_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // 5. Persistent Categories State
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('finan_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // 6. Persistent Maintenance Items State
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(() => {
    try {
      const saved = localStorage.getItem('finan_maintenance');
      return saved ? JSON.parse(saved) : DEFAULT_MAINTENANCE_ITEMS;
    } catch {
      return DEFAULT_MAINTENANCE_ITEMS;
    }
  });

  // Active top account view: PF, PJ or CONSOLIDADO
  const [activeAccount, setActiveAccount] = useState<AccountType>('PJ');

  // Active bottom navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Active global period filter (Mês atual by default)
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    type: 'CURRENT_MONTH',
  });

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalInitialDefaults, setModalInitialDefaults] = useState<Partial<Transaction> | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync usersList and userProfile to localStorage
  useEffect(() => {
    localStorage.setItem('finan_users_list', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('finan_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('finan_is_logged_in', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('finan_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finan_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('finan_maintenance', JSON.stringify(maintenanceItems));
  }, [maintenanceItems]);

  // Dark Mode setup
  useEffect(() => {
    if (userProfile.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userProfile.isDarkMode]);

  // Calculations for dynamic header tab balances (filtered by active period)
  const periodFilteredTransactions = useMemo(() => {
    return filterTransactionsByPeriod(transactions, dateFilter);
  }, [transactions, dateFilter]);

  const balances = useMemo(() => {
    const pfTx = periodFilteredTransactions.filter((t) => t.accountType === 'PF');
    const pfReceitas = pfTx.filter((t) => t.type === 'RECEITA').reduce((s, t) => s + t.amount, 0);
    const pfDespesas = pfTx.filter((t) => t.type === 'DESPESA').reduce((s, t) => s + t.amount, 0);
    const pfBalance = pfReceitas - pfDespesas;

    const pjTx = periodFilteredTransactions.filter((t) => t.accountType === 'PJ');
    const pjReceitas = pjTx.filter((t) => t.type === 'RECEITA').reduce((s, t) => s + t.amount, 0);
    const pjDespesas = pjTx.filter((t) => t.type === 'DESPESA').reduce((s, t) => s + t.amount, 0);
    const pjBalance = pjReceitas - pjDespesas;

    return {
      pf: pfBalance,
      pj: pjBalance,
      consolidado: pfBalance + pjBalance,
    };
  }, [periodFilteredTransactions]);

  // Maintenance alert count
  const maintenanceAlertCount = useMemo(() => {
    return maintenanceItems.filter((item) => {
      const status = calculateMaintenanceStatus(item, userProfile.currentOdometer);
      return status.status === 'VENCIDO' || status.status === 'ATENCAO';
    }).length;
  }, [maintenanceItems, userProfile.currentOdometer]);

  // User Management Handlers
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setUsersList((prev) =>
      prev.map((u) =>
        (u.id && u.id === updatedProfile.id) || u.username === updatedProfile.username
          ? updatedProfile
          : u
      )
    );
  };

  const handleCreateNewUser = (newUser: UserProfile) => {
    setUsersList((prev) => [...prev, newUser]);
  };

  const handleSwitchUser = (selectedUser: UserProfile) => {
    setUserProfile(selectedUser);
  };

  const handleDeleteUser = (userIdOrUsername: string) => {
    setUsersList((prev) =>
      prev.filter((u) => u.id !== userIdOrUsername && u.username !== userIdOrUsername)
    );
    // If deleted the current user, switch to the remaining first user
    const remaining = usersList.filter(
      (u) => u.id !== userIdOrUsername && u.username !== userIdOrUsername
    );
    if (
      userProfile.id === userIdOrUsername ||
      userProfile.username === userIdOrUsername
    ) {
      if (remaining.length > 0) {
        setUserProfile(remaining[0]);
      }
    }
  };

  // Transaction Handlers
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Update existing
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === existingId
            ? { ...item, ...txData }
            : item
        )
      );
    } else {
      // Create new
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);

      // If user supplied a higher odometer in the transaction, update motorcycle odometer
      if (txData.odometerKm && txData.odometerKm > userProfile.currentOdometer) {
        const updatedProfile = {
          ...userProfile,
          currentOdometer: txData.odometerKm,
        };
        handleSaveProfile(updatedProfile);
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenNewTransaction = (defaults?: Partial<Transaction>) => {
    setEditingTransaction(null);
    setModalInitialDefaults(
      defaults || {
        accountType: activeAccount === 'PF' ? 'PF' : 'PJ',
        type: 'DESPESA',
      }
    );
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalInitialDefaults(null);
    setIsTransactionModalOpen(true);
  };

  // Maintenance Handlers
  const handleUpdateOdometer = (newKm: number) => {
    const updated = {
      ...userProfile,
      currentOdometer: newKm,
    };
    handleSaveProfile(updated);
  };

  const handleUpdateMaintenanceItem = (updated: MaintenanceItem) => {
    setMaintenanceItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleAddMaintenanceItem = (newItem: MaintenanceItem) => {
    setMaintenanceItems((prev) => [...prev, newItem]);
  };

  const handleDeleteMaintenanceItem = (id: string) => {
    setMaintenanceItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRegisterMaintenanceExpense = (expense: Omit<Transaction, 'id' | 'createdAt'>) => {
    handleSaveTransaction(expense);
  };

  // Category Handlers
  const handleAddCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  // Profile & Theme Handlers
  const handleToggleDarkMode = () => {
    const updated = {
      ...userProfile,
      isDarkMode: !userProfile.isDarkMode,
    };
    handleSaveProfile(updated);
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente sair da sua conta?')) {
      setIsAuthenticated(false);
    }
  };

  const handleResetData = () => {
    setUserProfile(DEFAULT_USER_PROFILE);
    setUsersList(DEFAULT_USERS_LIST);
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    setMaintenanceItems(DEFAULT_MAINTENANCE_ITEMS);
    localStorage.removeItem('finan_transactions');
    localStorage.removeItem('finan_categories');
    localStorage.removeItem('finan_maintenance');
    localStorage.removeItem('finan_user_profile');
    localStorage.removeItem('finan_users_list');
    alert('Dados de demonstração restaurados para William!');
  };

  const handleExportBackupJSON = () => {
    const backupData = {
      usersList,
      profile: userProfile,
      transactions,
      categories,
      maintenanceItems,
      exportDate: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-finanautonomo-william-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportBackupJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.transactions && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
          if (data.usersList) setUsersList(data.usersList);
          if (data.profile) setUserProfile(data.profile);
          if (data.categories) setCategories(data.categories);
          if (data.maintenanceItems) setMaintenanceItems(data.maintenanceItems);
          alert('Backup restaurado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch {
        alert('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  // If user is not logged in, render the Auth/Login Screen
  if (!isAuthenticated) {
    return (
      <AuthScreen
        usersList={usersList}
        currentUser={userProfile}
        onLoginSuccess={(loggedUser) => {
          setUserProfile(loggedUser);
          setIsAuthenticated(true);
        }}
        onCreateUser={handleCreateNewUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Sticky Header with PF / PJ / Consolidado selector */}
      <Header
        activeAccount={activeAccount}
        setActiveAccount={setActiveAccount}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        onToggleDarkMode={handleToggleDarkMode}
        balances={balances}
      />

      {/* Main Container */}
      <main className="max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto px-3.5 sm:px-6 pt-3 pb-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            activeAccount={activeAccount}
            transactions={periodFilteredTransactions}
            maintenanceItems={maintenanceItems}
            userProfile={userProfile}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onOpenNewTransactionWithDefaults={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onNavigateToMaintenance={() => setActiveTab('maintenance')}
            onNavigateToReports={() => setActiveTab('reports')}
            onNavigateToTransactions={() => setActiveTab('transactions')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsList
            transactions={periodFilteredTransactions}
            activeAccount={activeAccount}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenNewTransaction={() => handleOpenNewTransaction()}
            onExportCSV={() =>
              exportTransactionsToCSV(
                periodFilteredTransactions,
                `extrato-${userProfile.name.toLowerCase().replace(/\s+/g, '-')}.csv`
              )
            }
          />
        )}

        {activeTab === 'maintenance' && (
          <MotoMaintenance
            maintenanceItems={maintenanceItems}
            userProfile={userProfile}
            onUpdateOdometer={handleUpdateOdometer}
            onUpdateMaintenanceItem={handleUpdateMaintenanceItem}
            onAddMaintenanceItem={handleAddMaintenanceItem}
            onDeleteMaintenanceItem={handleDeleteMaintenanceItem}
            onRegisterMaintenanceExpense={handleRegisterMaintenanceExpense}
            transactions={periodFilteredTransactions}
          />
        )}

        {activeTab === 'reports' && (
          <Reports
            transactions={transactions}
            userProfile={userProfile}
            maintenanceItems={maintenanceItems}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
        )}
      </main>

      {/* Bottom Sticky Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => handleOpenNewTransaction()}
        maintenanceAlertCount={maintenanceAlertCount}
      />

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
          setModalInitialDefaults(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        editingTransaction={editingTransaction}
        categories={categories}
        onAddCategory={handleAddCategory}
        initialDefaults={modalInitialDefaults}
        currentOdometer={userProfile.currentOdometer}
      />

      {/* User Profile & Security Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        usersList={usersList}
        onSaveProfile={handleSaveProfile}
        onCreateUser={handleCreateNewUser}
        onSwitchUser={handleSwitchUser}
        onDeleteUser={handleDeleteUser}
        onResetData={handleResetData}
        onExportBackupJSON={handleExportBackupJSON}
        onImportBackupJSON={handleImportBackupJSON}
      />
    </div>
  );
}
