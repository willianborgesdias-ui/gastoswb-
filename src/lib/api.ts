import { auth } from './firebase.ts';

async function getHeaders() {
  const customToken = localStorage.getItem('custom_auth_token');
  if (customToken) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customToken}`
    };
  }

  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function loginCustom(username: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Falha ao autenticar');
  }
  return res.json();
}

export async function fetchProfile() {
  const res = await fetch('/api/profile', {
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfile(data: any) {
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function fetchDeliveries() {
  const res = await fetch('/api/deliveries', {
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch deliveries');
  return res.json();
}

export async function addDelivery(data: any) {
  const res = await fetch('/api/deliveries', {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add delivery');
  return res.json();
}

export async function fetchExpenses() {
  const res = await fetch('/api/expenses', {
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function addFuelExpense(data: any) {
  const res = await fetch('/api/fuel-expenses', {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add fuel expense');
  return res.json();
}

export async function addMaintenanceRecord(data: any) {
  const res = await fetch('/api/maintenance-records', {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add maintenance record');
  return res.json();
}

export async function addOtherExpense(data: any) {
  const res = await fetch('/api/other-expenses', {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add other expense');
  return res.json();
}

export async function fetchTransactions() {
  const res = await fetch('/api/transactions', {
    headers: await getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function addTransaction(data: any) {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add transaction');
  return res.json();
}

export async function bulkSync(data: {
  deliveries?: any[];
  fuelExpenses?: any[];
  maintenanceRecords?: any[];
  otherExpenses?: any[];
  transactions?: any[];
}) {
  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to perform sync');
  return res.json();
}
