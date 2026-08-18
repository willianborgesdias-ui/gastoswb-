import { MaintenanceItem, Transaction } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDatePtBR = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
};

export const getRelativeDateLabel = (dateString: string): string => {
  if (!dateString) return '';
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateString === todayStr) return 'Hoje';
  if (dateString === yesterdayStr) return 'Ontem';

  return formatDatePtBR(dateString);
};

export const formatKm = (km: number): string => {
  return `${new Intl.NumberFormat('pt-BR').format(km)} km`;
};

export interface MaintenanceStatusInfo {
  kmRemaining: number;
  daysRemaining: number;
  status: 'OK' | 'ATENCAO' | 'VENCIDO';
  percentUsed: number;
  label: string;
}

export const calculateMaintenanceStatus = (
  item: MaintenanceItem,
  currentOdometer: number
): MaintenanceStatusInfo => {
  let kmRemaining = 999999;
  let percentUsedKm = 0;

  if (item.type === 'KM' || item.type === 'BOTH') {
    const kmPassed = currentOdometer - item.lastKm;
    kmRemaining = item.intervalKm - kmPassed;
    percentUsedKm = (kmPassed / item.intervalKm) * 100;
  }

  let daysRemaining = 999999;
  let percentUsedDays = 0;

  if (item.type === 'DATE' || item.type === 'BOTH') {
    const lastDate = new Date(item.lastDate);
    const today = new Date();
    const diffTime = today.getTime() - lastDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    daysRemaining = item.intervalDays - daysPassed;
    percentUsedDays = (daysPassed / item.intervalDays) * 100;
  }

  let finalPercent = 0;
  let status: 'OK' | 'ATENCAO' | 'VENCIDO' = 'OK';
  let label = '';

  if (item.type === 'KM') {
    finalPercent = Math.min(Math.max(percentUsedKm, 0), 100);
    if (kmRemaining <= 0) {
      status = 'VENCIDO';
      label = `Vencido há ${Math.abs(kmRemaining)} km`;
    } else if (kmRemaining <= 150) {
      status = 'ATENCAO';
      label = `Faltam apenas ${kmRemaining} km`;
    } else {
      status = 'OK';
      label = `Faltam ${kmRemaining} km`;
    }
  } else if (item.type === 'DATE') {
    finalPercent = Math.min(Math.max(percentUsedDays, 0), 100);
    if (daysRemaining <= 0) {
      status = 'VENCIDO';
      label = `Venceu há ${Math.abs(daysRemaining)} dias`;
    } else if (daysRemaining <= 5) {
      status = 'ATENCAO';
      label = `Vence em ${daysRemaining} dias`;
    } else {
      status = 'OK';
      label = `Vence em ${daysRemaining} dias`;
    }
  } else {
    finalPercent = Math.min(Math.max(Math.max(percentUsedKm, percentUsedDays), 0), 100);
    if (kmRemaining <= 0 || daysRemaining <= 0) {
      status = 'VENCIDO';
      label = 'Vencido!';
    } else if (kmRemaining <= 200 || daysRemaining <= 5) {
      status = 'ATENCAO';
      label = `Atenção: ${kmRemaining} km / ${daysRemaining} dias`;
    } else {
      status = 'OK';
      label = `OK: ${kmRemaining} km restantes`;
    }
  }

  return {
    kmRemaining,
    daysRemaining,
    status,
    percentUsed: Math.min(Math.max(finalPercent, 0), 100),
    label,
  };
};

export const filterTransactionsByPeriod = (
  transactions: Transaction[],
  period: { type: string; startDate?: string; endDate?: string }
): Transaction[] => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  return transactions.filter((tx) => {
    if (!tx.date) return false;
    const txDate = new Date(tx.date + 'T00:00:00');
    const txYear = txDate.getFullYear();
    const txMonth = txDate.getMonth();

    switch (period.type) {
      case 'CURRENT_MONTH':
        return txYear === currentYear && txMonth === currentMonth;

      case 'PREVIOUS_MONTH': {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return txYear === prevYear && txMonth === prevMonth;
      }

      case 'LAST_7_DAYS': {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return txDate >= sevenDaysAgo && txDate <= now;
      }

      case 'CURRENT_YEAR':
        return txYear === currentYear;

      case 'CUSTOM': {
        if (period.startDate && tx.date < period.startDate) return false;
        if (period.endDate && tx.date > period.endDate) return false;
        return true;
      }

      default:
        return true;
    }
  });
};
