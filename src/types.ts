export interface Vehicle {
  model: string;
  plate: string;
  averageConsumption: number; // km per liter
  fuelType: 'Gasolina' | 'Etanol' | 'Diesel' | 'Elétrico';
  currentKm: number;
}

export interface FuelExpense {
  id: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  kmAtFuel: number;
}

export interface MaintenanceRecord {
  id: string;
  type: 'Troca de Óleo' | 'Pastilhas de Freio' | 'Pneus' | 'Relação (Corrente/Pinhão)' | 'Outros';
  cost: number;
  date: string;
  kmAtMaintenance: number;
  nextDueKm: number;
  nextDueDate: string;
  description?: string;
}

export interface OtherExpense {
  id: string;
  type: 'Alimentação' | 'Estacionamento' | 'Pedágio' | 'Internet/Celular' | 'Equipamento' | 'Outros';
  cost: number;
  date: string;
  description?: string;
}

export interface DeliveryLog {
  id: string;
  app: 'iFood' | 'Rappi' | 'Uber Flash' | 'Loggi' | 'Particular' | 'Outro';
  earnings: number; // Ganho bruto
  distanceKm: number;
  tip: number;
  waitTimeMin: number;
  date: string;
  kmStart: number;
  kmEnd: number;
  fromAddress: string;
  toAddress: string;
  status: 'Concluído' | 'Pendente';
}

export interface DailyGoal {
  date: string;
  targetValue: number;
}

export interface NotificationItem {
  id: string;
  type: 'maintenance' | 'delivery' | 'system' | 'sync';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface PaymentTransaction {
  id: string;
  clientName: string;
  amount: number;
  method: 'PIX' | 'Cartão' | 'Dinheiro';
  status: 'Sucesso' | 'Pendente' | 'Falhou';
  date: string;
  deliveryId?: string;
}

export interface SyncLog {
  id: string;
  action: string;
  timestamp: string;
  status: 'Sucesso' | 'Pendente';
}
