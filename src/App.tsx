import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  DollarSign, 
  Fuel, 
  ShieldCheck, 
  Bell, 
  User, 
  CheckCircle, 
  Map, 
  CreditCard, 
  FileSpreadsheet, 
  AlertTriangle, 
  Check, 
  X, 
  Volume2, 
  Sparkles,
  Bike,
  RefreshCw,
  LogOut
} from 'lucide-react';

// Sub-components
import Dashboard from './components/Dashboard.tsx';
import LogDeliveries from './components/LogDeliveries.tsx';
import LogExpenses from './components/LogExpenses.tsx';
import MapRoutes from './components/MapRoutes.tsx';
import GatewayPayment from './components/GatewayPayment.tsx';
import ReportGenerator from './components/ReportGenerator.tsx';

// Firebase Client Auth & API
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, googleAuthProvider } from './lib/firebase.ts';
import * as api from './lib/api.ts';

// Mock Data & Types
import { 
  initialVehicle, 
  initialFuelExpenses, 
  initialMaintenanceRecords, 
  initialOtherExpenses, 
  initialDeliveries, 
  initialTransactions 
} from './mockData.ts';
import { 
  Vehicle, 
  FuelExpense, 
  MaintenanceRecord, 
  OtherExpense, 
  DeliveryLog, 
  PaymentTransaction, 
  NotificationItem, 
  SyncLog 
} from './types.ts';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deliveries' | 'expenses' | 'map' | 'gateway' | 'reports'>('dashboard');

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Custom credentials Auth State
  const [customUser, setCustomUser] = useState<{
    id?: number;
    uid: string;
    email: string;
    username: string;
    model?: string;
    plate?: string;
    averageConsumption?: number;
    fuelType?: string;
    currentKm?: number;
    dailyGoal?: number;
    password?: string;
  } | null>(() => {
    const saved = localStorage.getItem('custom_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Login Form States
  const [loginUsername, setLoginUsername] = useState<string>('admin');
  const [loginPassword, setLoginPassword] = useState<string>('admin');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Core App States (Prepopulated with mock data until logged in)
  const [vehicle, setVehicle] = useState<Vehicle>(initialVehicle);
  const [deliveries, setDeliveries] = useState<DeliveryLog[]>(initialDeliveries);
  const [fuelExpenses, setFuelExpenses] = useState<FuelExpense[]>(initialFuelExpenses);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(initialMaintenanceRecords);
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>(initialOtherExpenses);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(initialTransactions);
  const [dailyGoal, setDailyGoal] = useState<number>(180);
  
  // Offline Sync States
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    { id: "s-1", action: "Sincronização Completa", timestamp: "Hoje às 20:30", status: "Sucesso" },
    { id: "s-2", action: "Envio de Notas fiscais", timestamp: "Ontem às 18:15", status: "Sucesso" }
  ]);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // In-app Notification / Push Alerts
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-1",
      type: "maintenance",
      title: "Alerta de Manutenção",
      message: "Seu óleo lubrificante precisa ser trocado em 50 KM!",
      timestamp: "Há 10 min",
      read: false
    },
    {
      id: "n-2",
      type: "system",
      title: "Parabéns!",
      message: "Você bateu sua meta de faturamento ontem!",
      timestamp: "Ontem",
      read: true
    }
  ]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);

  // Simulated Push Dispatcher (New orders incoming popups)
  const [incomingOrder, setIncomingOrder] = useState<{
    id: string;
    app: string;
    value: number;
    distance: number;
    from: string;
    to: string;
  } | null>(null);

  // Audio simulation feedback (beep sound or browser audio synthesized)
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 880; // beautiful clean beep pitch
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 150);
    } catch (e) {
      console.log("Audio not allowed by gesture yet.");
    }
  };

  // Dispatcher Simulator Interval
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate random dispatching order every 45 seconds to keep dashboard lively
      if (incomingOrder) return; // don't override active alert

      // Random app choices
      const apps = ['iFood', 'Rappi', 'Uber Flash', 'Loggi'];
      const chosenApp = apps[Math.floor(Math.random() * apps.length)];
      
      // Random value and coordinates
      const val = parseFloat((Math.random() * 15 + 10).toFixed(2));
      const dist = parseFloat((Math.random() * 6 + 1.5).toFixed(1));
      
      const addresses = [
        { from: "Shopping Cidade São Paulo", to: "Alameda Santos, 2200" },
        { from: "Av. Rebouças, 1500", to: "Alameda Lorena, 800" },
        { from: "McDonald's Paraíso", to: "Rua Vergueiro, 1500" },
        { from: "Largo da Batata, Pinheiros", to: "Vila Madalena, 500" }
      ];
      const addr = addresses[Math.floor(Math.random() * addresses.length)];

      setIncomingOrder({
        id: "dispatch-" + Math.floor(Math.random() * 10000),
        app: chosenApp,
        value: val,
        distance: dist,
        from: addr.from,
        to: addr.to
      });

      // Sound trigger
      playAlertSound();

      // Push alert into notification ledger
      const newNotify: NotificationItem = {
        id: "n-dispatch-" + Date.now(),
        type: "delivery",
        title: `Novo pedido ${chosenApp}`,
        message: `Corrida disponível por R$ ${val.toFixed(2)} - Coleta em ${addr.from}`,
        timestamp: "Agora mesmo",
        read: false
      };
      setNotifications(prev => [newNotify, ...prev]);

    }, 45000);

    return () => clearInterval(timer);
  }, [incomingOrder]);

  // Helper function to fetch and load all PostgreSQL user data
  const loadUserData = async (displayName: string) => {
    try {
      // Load Profile details from PostgreSQL DB
      const prof = await api.fetchProfile();
      setVehicle({
        model: prof.model || 'Honda CG 160 Fan',
        plate: prof.plate || 'MBO-4A26',
        averageConsumption: prof.averageConsumption || 38.0,
        fuelType: prof.fuelType as any || 'Gasolina',
        currentKm: prof.currentKm || 42150.0
      });
      setDailyGoal(prof.dailyGoal || 180.0);

      // Fetch deliveries
      const dels = await api.fetchDeliveries();
      setDeliveries(dels);

      // Fetch expenses
      const exps = await api.fetchExpenses();
      setFuelExpenses(exps.fuelExpenses || []);
      setMaintenanceRecords(exps.maintenanceRecords || []);
      setOtherExpenses(exps.otherExpenses || []);

      // Fetch Transactions
      const txs = await api.fetchTransactions();
      setTransactions(txs);

      // Update pending queue status
      const pending = JSON.parse(localStorage.getItem('pending_sync') || '{}');
      const count = 
        (pending.deliveries?.length || 0) +
        (pending.fuelExpenses?.length || 0) +
        (pending.maintenanceRecords?.length || 0) +
        (pending.otherExpenses?.length || 0) +
        (pending.transactions?.length || 0);
      setPendingSyncCount(count);

      const loginNotify: NotificationItem = {
        id: "n-login-" + Date.now(),
        type: "system",
        title: "PostgreSQL Conectado",
        message: `Olá ${displayName}, dados sincronizados com o banco de dados online!`,
        timestamp: "Agora mesmo",
        read: false
      };
      setNotifications(prev => [loginNotify, ...prev]);

    } catch (err) {
      console.error("Erro ao puxar dados do PostgreSQL:", err);
    }
  };

  // Auth synchronization listener
  useEffect(() => {
    // 1. Check custom credentials in localStorage first
    const savedCustomUser = localStorage.getItem('custom_user');
    const customToken = localStorage.getItem('custom_auth_token');
    
    if (savedCustomUser && customToken) {
      try {
        const parsed = JSON.parse(savedCustomUser);
        setCustomUser(parsed);
        setAuthLoading(false);
        loadUserData(parsed.username || 'admin');
        return;
      } catch (err) {
        console.error("Failed to load saved custom user:", err);
      }
    }

    // 2. Fallback to Firebase Google Login check
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      
      if (user) {
        await loadUserData(user.displayName || user.email || 'Usuário');
      } else {
        // Reset to initial mock defaults when logged out and no custom user either
        if (!customUser) {
          setVehicle(initialVehicle);
          setDeliveries(initialDeliveries);
          setFuelExpenses(initialFuelExpenses);
          setMaintenanceRecords(initialMaintenanceRecords);
          setOtherExpenses(initialOtherExpenses);
          setTransactions(initialTransactions);
          setDailyGoal(180);
          setPendingSyncCount(0);
        }
      }
    });

    return () => unsubscribe();
  }, [customUser]);

  // Helper for offline storage
  const savePendingSync = (type: 'deliveries' | 'fuelExpenses' | 'maintenanceRecords' | 'otherExpenses' | 'transactions', item: any) => {
    const pending = JSON.parse(localStorage.getItem('pending_sync') || '{}');
    if (!pending[type]) pending[type] = [];
    pending[type].push(item);
    localStorage.setItem('pending_sync', JSON.stringify(pending));
    setPendingSyncCount(prev => prev + 1);
  };

  // Google Login popup
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  // Sign out supporting both Google and custom authentication
  const handleSignOut = async () => {
    if (customUser) {
      localStorage.removeItem('custom_user');
      localStorage.removeItem('custom_auth_token');
      setCustomUser(null);
    } else {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Sign-out error:", error);
      }
    }
  };

  // Custom User Login with username and password
  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const data = await api.loginCustom(loginUsername, loginPassword);
      localStorage.setItem('custom_auth_token', data.token);
      localStorage.setItem('custom_user', JSON.stringify(data.user));
      setCustomUser(data.user);
    } catch (err: any) {
      console.error("Login failed:", err);
      setLoginError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Update Custom User Profile credentials
  const handleUpdateCredentials = async (usernameInput: string, passwordInput: string) => {
    try {
      const updated = await api.updateProfile({ username: usernameInput, password: passwordInput });
      if (customUser) {
        const newUser = { ...customUser, username: updated.username, password: updated.password };
        setCustomUser(newUser);
        localStorage.setItem('custom_user', JSON.stringify(newUser));
      }
    } catch (err: any) {
      console.error("Failed to update credentials online:", err);
      throw err;
    }
  };

  // Action: Accept incoming order
  const handleAcceptOrder = async () => {
    if (!incomingOrder) return;

    const newLog: Omit<DeliveryLog, 'id'> = {
      app: incomingOrder.app as any,
      earnings: incomingOrder.value - 2,
      distanceKm: incomingOrder.distance,
      tip: 2.00,
      waitTimeMin: Math.floor(Math.random() * 10) + 5,
      date: new Date().toISOString().split('T')[0],
      kmStart: vehicle.currentKm,
      kmEnd: vehicle.currentKm + incomingOrder.distance,
      fromAddress: incomingOrder.from,
      toAddress: incomingOrder.to,
      status: "Concluído"
    };

    if (currentUser && isOnline) {
      try {
        const added = await api.addDelivery(newLog);
        setDeliveries(prev => [...prev, added]);
        const prof = await api.fetchProfile();
        setVehicle({
          model: prof.model || 'Honda CG 160 Fan',
          plate: prof.plate || 'MBO-4A26',
          averageConsumption: prof.averageConsumption || 38,
          fuelType: prof.fuelType as any || 'Gasolina',
          currentKm: prof.currentKm || 42150.0
        });
      } catch (err) {
        console.error("Failed to add delivery online:", err);
        const log: DeliveryLog = { ...newLog, id: "d-" + Date.now() };
        setDeliveries(prev => [...prev, log]);
        savePendingSync('deliveries', log);
      }
    } else {
      const log: DeliveryLog = { ...newLog, id: "d-" + Date.now() };
      setDeliveries(prev => [...prev, log]);
      setVehicle(prev => ({
        ...prev,
        currentKm: prev.currentKm + incomingOrder.distance
      }));
      savePendingSync('deliveries', log);
    }

    setIncomingOrder(null);
  };

  // Action: Toggle network offline/online
  const handleToggleOnline = () => {
    const nextOnline = !isOnline;
    setIsOnline(nextOnline);
    if (nextOnline && pendingSyncCount > 0) {
      // Simulate automatic synchronization on reconnecting
      setTimeout(() => {
        handleTriggerSync();
      }, 1000);
    }
  };

  // Action: Trigger synchronization
  const handleTriggerSync = async () => {
    if (!isOnline) return;
    
    if (currentUser || customUser) {
      try {
        const pending = JSON.parse(localStorage.getItem('pending_sync') || '{}');
        const count = 
          (pending.deliveries?.length || 0) +
          (pending.fuelExpenses?.length || 0) +
          (pending.maintenanceRecords?.length || 0) +
          (pending.otherExpenses?.length || 0) +
          (pending.transactions?.length || 0);

        if (count > 0) {
          await api.bulkSync(pending);
          localStorage.removeItem('pending_sync');
          setPendingSyncCount(0);

          // Refetch fresh synchronized data
          const prof = await api.fetchProfile();
          setVehicle({
            model: prof.model || 'Honda CG 160 Fan',
            plate: prof.plate || 'MBO-4A26',
            averageConsumption: prof.averageConsumption || 38,
            fuelType: prof.fuelType as any || 'Gasolina',
            currentKm: prof.currentKm || 42150.0
          });
          setDailyGoal(prof.dailyGoal || 180.0);

          const dels = await api.fetchDeliveries();
          setDeliveries(dels);

          const exps = await api.fetchExpenses();
          setFuelExpenses(exps.fuelExpenses || []);
          setMaintenanceRecords(exps.maintenanceRecords || []);
          setOtherExpenses(exps.otherExpenses || []);

          const txs = await api.fetchTransactions();
          setTransactions(txs);
        }

        const newLog: SyncLog = {
          id: "s-" + Date.now(),
          action: "Sincronização Completa",
          timestamp: "Agora mesmo",
          status: "Sucesso"
        };
        setSyncLogs(prev => [newLog, ...prev]);

        const syncNotify: NotificationItem = {
          id: "n-sync-" + Date.now(),
          type: "sync",
          title: "Sincronia Concluída",
          message: "Todas as corridas e despesas foram salvas no PostgreSQL de forma segura.",
          timestamp: "Agora mesmo",
          read: false
        };
        setNotifications(prev => [syncNotify, ...prev]);

      } catch (err) {
        console.error("Sync failed:", err);
      }
    } else {
      // Simulate offline synchronizing if guest
      const newLog: SyncLog = {
        id: "s-" + Date.now(),
        action: "Sincronização Simulada",
        timestamp: "Agora mesmo",
        status: "Sucesso"
      };
      setSyncLogs(prev => [newLog, ...prev]);
      setPendingSyncCount(0);
    }
  };

  // State Updates from Subcomponents
  const handleAddDelivery = async (newDel: Omit<DeliveryLog, 'id'>) => {
    if ((currentUser || customUser) && isOnline) {
      try {
        const added = await api.addDelivery(newDel);
        setDeliveries(prev => [...prev, added]);
        const prof = await api.fetchProfile();
        setVehicle({
          model: prof.model || 'Honda CG 160 Fan',
          plate: prof.plate || 'MBO-4A26',
          averageConsumption: prof.averageConsumption || 38,
          fuelType: prof.fuelType as any || 'Gasolina',
          currentKm: prof.currentKm || 42150.0
        });
      } catch (err) {
        console.error("Failed to add delivery online:", err);
        const log: DeliveryLog = { ...newDel, id: "d-" + Date.now() };
        setDeliveries(prev => [...prev, log]);
        savePendingSync('deliveries', log);
      }
    } else {
      const log: DeliveryLog = { ...newDel, id: "d-" + Date.now() };
      setDeliveries(prev => [...prev, log]);
      setVehicle(prev => ({
        ...prev,
        currentKm: newDel.kmEnd || prev.currentKm
      }));
      savePendingSync('deliveries', log);
    }
  };

  const handleUpdateKm = async (newKm: number) => {
    setVehicle(prev => ({
      ...prev,
      currentKm: newKm
    }));

    if ((currentUser || customUser) && isOnline) {
      try {
        await api.updateProfile({ currentKm: newKm });
      } catch (err) {
        console.error("Failed to update KM online:", err);
      }
    }
  };

  const handleUpdateVehicle = async (fields: Partial<Vehicle>) => {
    setVehicle(prev => ({
      ...prev,
      ...fields
    }));

    if ((currentUser || customUser) && isOnline) {
      try {
        await api.updateProfile(fields);
      } catch (err) {
        console.error("Failed to update vehicle online:", err);
      }
    }
  };

  const handleSetDailyGoal = async (val: number) => {
    setDailyGoal(val);
    if ((currentUser || customUser) && isOnline) {
      try {
        await api.updateProfile({ dailyGoal: val });
      } catch (err) {
        console.error("Failed to update daily goal online:", err);
      }
    }
  };

  const handleAddFuelExpense = async (newFuel: Omit<FuelExpense, 'id'>) => {
    if ((currentUser || customUser) && isOnline) {
      try {
        const added = await api.addFuelExpense(newFuel);
        setFuelExpenses(prev => [...prev, added]);
        const prof = await api.fetchProfile();
        setVehicle({
          model: prof.model || 'Honda CG 160 Fan',
          plate: prof.plate || 'MBO-4A26',
          averageConsumption: prof.averageConsumption || 38,
          fuelType: prof.fuelType as any || 'Gasolina',
          currentKm: prof.currentKm || 42150.0
        });
      } catch (err) {
        console.error("Failed to add fuel online:", err);
        const exp: FuelExpense = { ...newFuel, id: "f-" + Date.now() };
        setFuelExpenses(prev => [...prev, exp]);
        savePendingSync('fuelExpenses', exp);
      }
    } else {
      const exp: FuelExpense = { ...newFuel, id: "f-" + Date.now() };
      setFuelExpenses(prev => [...prev, exp]);
      setVehicle(prev => ({
        ...prev,
        currentKm: Math.max(prev.currentKm, newFuel.kmAtFuel)
      }));
      savePendingSync('fuelExpenses', exp);
    }
  };

  const handleAddMaintenanceRecord = async (newMain: Omit<MaintenanceRecord, 'id'>) => {
    if ((currentUser || customUser) && isOnline) {
      try {
        const added = await api.addMaintenanceRecord(newMain);
        setMaintenanceRecords(prev => [...prev, added]);
        const prof = await api.fetchProfile();
        setVehicle({
          model: prof.model || 'Honda CG 160 Fan',
          plate: prof.plate || 'MBO-4A26',
          averageConsumption: prof.averageConsumption || 38,
          fuelType: prof.fuelType as any || 'Gasolina',
          currentKm: prof.currentKm || 42150.0
        });
      } catch (err) {
        console.error("Failed to add maintenance online:", err);
        const rec: MaintenanceRecord = { ...newMain, id: "m-" + Date.now() };
        setMaintenanceRecords(prev => [...prev, rec]);
        savePendingSync('maintenanceRecords', rec);
      }
    } else {
      const rec: MaintenanceRecord = { ...newMain, id: "m-" + Date.now() };
      setMaintenanceRecords(prev => [...prev, rec]);
      setVehicle(prev => ({
        ...prev,
        currentKm: Math.max(prev.currentKm, newMain.kmAtMaintenance)
      }));
      savePendingSync('maintenanceRecords', rec);
    }
  };

  const handleAddOtherExpense = async (newOther: Omit<OtherExpense, 'id'>) => {
    if ((currentUser || customUser) && isOnline) {
      try {
        const added = await api.addOtherExpense(newOther);
        setOtherExpenses(prev => [...prev, added]);
      } catch (err) {
        console.error("Failed to add other expense online:", err);
        const exp: OtherExpense = { ...newOther, id: "o-" + Date.now() };
        setOtherExpenses(prev => [...prev, exp]);
        savePendingSync('otherExpenses', exp);
      }
    } else {
      const exp: OtherExpense = { ...newOther, id: "o-" + Date.now() };
      setOtherExpenses(prev => [...prev, exp]);
      savePendingSync('otherExpenses', exp);
    }
  };

  const handleAddTransaction = async (newTx: Omit<PaymentTransaction, 'id' | 'date'>) => {
    const txData = {
      ...newTx,
      date: new Date().toISOString()
    };
    if ((currentUser || customUser) && isOnline) {
      try {
        const added = await api.addTransaction(txData);
        setTransactions(prev => [added, ...prev]);
      } catch (err) {
        console.error("Failed to add transaction online:", err);
        const tx: PaymentTransaction = { ...txData, id: "tx-" + Math.floor(Math.random() * 100000), date: txData.date };
        setTransactions(prev => [tx, ...prev]);
        savePendingSync('transactions', tx);
      }
    } else {
      const tx: PaymentTransaction = { ...txData, id: "tx-" + Math.floor(Math.random() * 100000), date: txData.date };
      setTransactions(prev => [tx, ...prev]);
      savePendingSync('transactions', tx);
    }
  };

  const handleAddLogMessage = (title: string, message: string, type: 'delivery' | 'system') => {
    const newNotify: NotificationItem = {
      id: "n-custom-" + Date.now(),
      type: type === 'delivery' ? 'delivery' : 'system',
      title,
      message,
      timestamp: "Agora mesmo",
      read: false
    };
    setNotifications(prev => [newNotify, ...prev]);
    playAlertSound();
  };

  // Helper simulated GPS delivery completed handler
  const handleLogDeliverySimulated = async (earnings: number, km: number, appName: string) => {
    const newSimDel: Omit<DeliveryLog, 'id'> = {
      app: appName as any,
      earnings: earnings - 2,
      distanceKm: km,
      tip: 2.00,
      waitTimeMin: 8,
      date: new Date().toISOString().split('T')[0],
      kmStart: vehicle.currentKm,
      kmEnd: vehicle.currentKm + km,
      fromAddress: "Origem Simulação GPS",
      toAddress: "Destino Simulação GPS",
      status: "Concluído"
    };

    if (currentUser && isOnline) {
      try {
        const added = await api.addDelivery(newSimDel);
        setDeliveries(prev => [...prev, added]);
        const prof = await api.fetchProfile();
        setVehicle({
          model: prof.model || 'Honda CG 160 Fan',
          plate: prof.plate || 'MBO-4A26',
          averageConsumption: prof.averageConsumption || 38,
          fuelType: prof.fuelType as any || 'Gasolina',
          currentKm: prof.currentKm || 42150.0
        });
      } catch (err) {
        console.error("Failed to add simulated delivery online:", err);
        const log: DeliveryLog = { ...newSimDel, id: "d-" + Date.now() };
        setDeliveries(prev => [...prev, log]);
        savePendingSync('deliveries', log);
      }
    } else {
      const log: DeliveryLog = { ...newSimDel, id: "d-" + Date.now() };
      setDeliveries(prev => [...prev, log]);
      setVehicle(prev => ({
        ...prev,
        currentKm: parseFloat((prev.currentKm + km).toFixed(1))
      }));
      savePendingSync('deliveries', log);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  if (!currentUser && !customUser) {
    return (
      <div id="login-container" className="min-h-screen flex flex-col justify-center items-center bg-[#0c0d0e] font-sans text-gray-200 p-6 select-none">
        <div className="w-full max-w-md bg-[#111214] border border-[#212327] rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-semibold shadow-lg shadow-yellow-400/20">
              <Bike className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">Motoboy Pro</h1>
            <p className="text-xs text-yellow-400 font-extrabold uppercase tracking-widest">Controle Financeiro Integrado</p>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xxs text-gray-400 font-bold uppercase">Nome de Usuário</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-[#18191c] border border-[#2d2e33] text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="Ex: admin"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs text-gray-400 font-bold uppercase">Senha</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#18191c] border border-[#2d2e33] text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="Ex: admin"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-semibold">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black text-sm font-bold rounded-xl shadow-lg shadow-yellow-400/10 transition-colors focus:outline-none cursor-pointer"
            >
              {loginLoading ? 'Carregando...' : 'Entrar na Conta'}
            </button>
          </form>

          <div className="text-center text-xxs text-gray-500 bg-[#18191c] border border-[#212327] rounded-xl p-3">
            💡 <strong className="text-gray-300">Dica de Acesso:</strong> Use o usuário <span className="text-yellow-400 font-bold">admin</span> e a senha <span className="text-yellow-400 font-bold">admin</span> para acessar.
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#212327]"></div>
            <span className="flex-shrink mx-4 text-3xs text-gray-500 uppercase font-bold">ou</span>
            <div className="flex-grow border-t border-[#212327]"></div>
          </div>

          <button
            onClick={handleSignIn}
            className="w-full py-2.5 bg-[#1a1b1e] hover:bg-[#25262b] border border-[#2d2e33] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors focus:outline-none cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Entrar com Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root-container" className="min-h-screen flex flex-col bg-[#0c0d0e] font-sans text-gray-200">
      
      {/* 1. Header Toolbar */}
      <header className="sticky top-0 z-40 bg-[#111214] border-b border-[#212327] px-6 py-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-semibold shadow-lg shadow-yellow-400/10">
            <Bike className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white tracking-tight leading-none text-base">Motoboy Pro</h1>
            <p className="text-3xs text-yellow-400 uppercase tracking-widest font-extrabold mt-1">Controle Financeiro Integrado</p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          
          {/* Offline indicator Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xxs font-bold ${
            isOnline 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            {isOnline ? 'SINC. EM NUVEM' : `${pendingSyncCount} SALVOS LOCAL`}
          </div>

          {/* Alert Notifications Hub */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="relative p-2 rounded-lg bg-[#1a1b1e] border border-[#2d2e33] text-gray-400 hover:text-white transition-all focus:outline-none"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-xxs text-white font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Card */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2.5 w-80 bg-[#111214] border border-[#2d2e33] rounded-xl shadow-2xl p-4 space-y-3 z-50">
                <div className="flex justify-between items-center pb-2 border-b border-[#212327]">
                  <span className="text-xs font-bold text-white">Centro de Notificações</span>
                  <button
                    id="btn-clear-notifications"
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      setShowNotificationsDropdown(false);
                    }}
                    className="text-3xs text-yellow-400 hover:text-yellow-500 font-bold"
                  >
                    Marcar todas lidas
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {notifications.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
                      }}
                      className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                        item.read 
                          ? 'bg-transparent border-[#1d1f22] opacity-60' 
                          : 'bg-[#18191c] border-[#2d2e33]'
                      }`}
                    >
                      <div className="flex justify-between text-xxs font-semibold">
                        <span className={`font-bold ${item.type === 'maintenance' ? 'text-red-400' : 'text-yellow-400'}`}>{item.title}</span>
                        <span className="text-gray-500 font-mono text-3xs">{item.timestamp}</span>
                      </div>
                      <p className="text-3xs text-gray-300 mt-1">{item.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Firebase Profile / Login Button */}
          <div className="flex items-center gap-2 border-l border-[#212327] pl-4">
            {authLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
            ) : (currentUser || customUser) ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold text-white leading-tight">
                    {customUser ? customUser.username : (currentUser?.displayName || currentUser?.email?.split('@')[0])}
                  </p>
                  <p className="text-3xs text-yellow-400 font-mono uppercase">{vehicle.plate}</p>
                </div>
                <button
                  id="btn-google-signout"
                  onClick={handleSignOut}
                  title="Sair da Conta"
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-google-signin"
                onClick={handleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold rounded-lg shadow-lg shadow-yellow-400/5 transition-all focus:outline-none cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Entrar (Google)</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. Dispatch Order Push Simulated Popup (Slices from top) */}
      {incomingOrder && (
        <div className="bg-[#18191c] border-b border-yellow-400/40 py-3.5 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in z-30 select-none">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center text-lg animate-bounce">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Novo Pedido Disponível!</span>
                <span className="text-3xs font-semibold bg-[#2a2c31] text-gray-300 px-1.5 py-0.5 rounded">{incomingOrder.app}</span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">Faturamento: R$ {incomingOrder.value.toFixed(2)} <span className="text-xs text-gray-400">({incomingOrder.distance} KM)</span></p>
              <p className="text-xxs text-gray-400 mt-1 flex items-center gap-1">
                📍 <strong className="text-gray-200">De:</strong> {incomingOrder.from} • <strong className="text-gray-200">Para:</strong> {incomingOrder.to}
              </p>
            </div>
          </div>
          <div className="flex gap-2 self-end md:self-center">
            <button
              id="btn-accept-order"
              onClick={handleAcceptOrder}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg text-xs font-bold shadow-lg shadow-yellow-400/5 transition-colors"
            >
              Aceitar Corrida
            </button>
            <button
              id="btn-decline-order"
              onClick={() => setIncomingOrder(null)}
              className="px-3 py-2 bg-[#2d2e33] hover:bg-[#3d3e44] text-gray-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Recusar
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Navigation tabs */}
      <nav className="bg-[#111214] border-b border-[#212327] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex">
          {[
            { id: 'dashboard', label: 'Painel Geral', icon: Compass },
            { id: 'deliveries', label: 'Corridas & KM', icon: Bike },
            { id: 'expenses', label: 'Custos & Oficina', icon: Fuel },
            { id: 'map', label: 'Roteador GPS', icon: Map },
            { id: 'gateway', label: 'Cobrança PIX', icon: CreditCard },
            { id: 'reports', label: 'Declarar MEI', icon: FileSpreadsheet }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-4 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-400 bg-yellow-400/5'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. Active Area Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            deliveries={deliveries}
            fuelExpenses={fuelExpenses}
            maintenanceRecords={maintenanceRecords}
            otherExpenses={otherExpenses}
            dailyGoal={dailyGoal}
            onSetDailyGoal={handleSetDailyGoal}
            isOnline={isOnline}
            onToggleOnline={handleToggleOnline}
            syncLogs={syncLogs}
            onTriggerSync={handleTriggerSync}
            vehicle={vehicle}
            onUpdateVehicle={handleUpdateVehicle}
            currentUser={currentUser || customUser}
            customUsername={customUser?.username}
            customPassword={customUser?.password}
            onUpdateCredentials={handleUpdateCredentials}
          />
        )}

        {activeTab === 'deliveries' && (
          <LogDeliveries 
            deliveries={deliveries}
            onAddDelivery={handleAddDelivery}
            currentKm={vehicle.currentKm}
            onUpdateKm={handleUpdateKm}
            onOpenGpsSim={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'expenses' && (
          <LogExpenses 
            fuelExpenses={fuelExpenses}
            maintenanceRecords={maintenanceRecords}
            otherExpenses={otherExpenses}
            currentKm={vehicle.currentKm}
            onAddFuelExpense={handleAddFuelExpense}
            onAddMaintenanceRecord={handleAddMaintenanceRecord}
            onAddOtherExpense={handleAddOtherExpense}
          />
        )}

        {activeTab === 'map' && (
          <MapRoutes 
            currentKm={vehicle.currentKm}
            onAddLogMessage={handleAddLogMessage}
            onLogDeliverySimulated={handleLogDeliverySimulated}
          />
        )}

        {activeTab === 'gateway' && (
          <GatewayPayment 
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onAddLogMessage={handleAddLogMessage}
          />
        )}

        {activeTab === 'reports' && (
          <ReportGenerator 
            deliveries={deliveries}
            fuelExpenses={fuelExpenses}
            maintenanceRecords={maintenanceRecords}
            otherExpenses={otherExpenses}
          />
        )}

      </main>

      {/* 5. Sleek Footer */}
      <footer className="bg-[#111214] border-t border-[#212327] py-4 text-center select-none text-xxs text-gray-500">
        <p>© 2026 Motoboy Pro - Todos os direitos reservados. Roteamento inteligente de baixo carbono.</p>
      </footer>

    </div>
  );
}
