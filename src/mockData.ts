import { Vehicle, FuelExpense, MaintenanceRecord, OtherExpense, DeliveryLog, PaymentTransaction } from './types';

export const initialVehicle: Vehicle = {
  model: "Honda CG 160 Titan",
  plate: "MTO-2B50",
  averageConsumption: 38, // 38 km/l is standard for CG 160
  fuelType: "Gasolina",
  currentKm: 12450
};

export const initialFuelExpenses: FuelExpense[] = [
  {
    id: "f-1",
    date: "2026-07-10",
    liters: 12,
    pricePerLiter: 5.85,
    totalCost: 70.20,
    kmAtFuel: 12100
  },
  {
    id: "f-2",
    date: "2026-07-14",
    liters: 10,
    pricePerLiter: 5.90,
    totalCost: 59.00,
    kmAtFuel: 12410
  }
];

export const initialMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "m-1",
    type: "Troca de Óleo",
    cost: 45.00,
    date: "2026-07-01",
    kmAtMaintenance: 11500,
    nextDueKm: 12500, // oil change every 1000km for CG 160
    nextDueDate: "2026-08-01",
    description: "Óleo Mobil Super Moto 10W30"
  },
  {
    id: "m-2",
    type: "Pastilhas de Freio",
    cost: 65.00,
    date: "2026-06-15",
    kmAtMaintenance: 10800,
    nextDueKm: 15800,
    nextDueDate: "2026-12-15",
    description: "Troca da pastilha traseira"
  },
  {
    id: "m-3",
    type: "Relação (Corrente/Pinhão)",
    cost: 120.00,
    date: "2026-05-10",
    kmAtMaintenance: 9200,
    nextDueKm: 19200,
    nextDueDate: "2026-11-10",
    description: "Kit relação DID com retentor"
  }
];

export const initialOtherExpenses: OtherExpense[] = [
  {
    id: "o-1",
    type: "Alimentação",
    cost: 25.50,
    date: "2026-07-15",
    description: "Almoço Prato Feito - Centro"
  },
  {
    id: "o-2",
    type: "Alimentação",
    cost: 12.00,
    date: "2026-07-16",
    description: "Lanche e café da tarde"
  },
  {
    id: "o-3",
    type: "Internet/Celular",
    cost: 49.90,
    date: "2026-07-05",
    description: "Plano Vivo Controle para GPS"
  }
];

// 7 days of delivery records to draw the performance dashboard
export const initialDeliveries: DeliveryLog[] = [
  // 10th July (Friday)
  {
    id: "d-1",
    app: "iFood",
    earnings: 15.50,
    distanceKm: 4.2,
    tip: 2.00,
    waitTimeMin: 12,
    date: "2026-07-10",
    kmStart: 12100,
    kmEnd: 12105,
    fromAddress: "Av. Paulista, 1000",
    toAddress: "Rua Augusta, 450",
    status: "Concluído"
  },
  {
    id: "d-2",
    app: "Rappi",
    earnings: 22.00,
    distanceKm: 8.5,
    tip: 5.00,
    waitTimeMin: 20,
    date: "2026-07-10",
    kmStart: 12105,
    kmEnd: 12115,
    fromAddress: "Rua Oscar Freire, 1200",
    toAddress: "Av. Faria Lima, 3500",
    status: "Concluído"
  },
  // 11th July (Saturday)
  {
    id: "d-3",
    app: "Uber Flash",
    earnings: 31.20,
    distanceKm: 12.0,
    tip: 0,
    waitTimeMin: 8,
    date: "2026-07-11",
    kmStart: 12115,
    kmEnd: 12128,
    fromAddress: "Av. Brigadeiro Luís Antônio, 2300",
    toAddress: "Rua Pamplona, 1200",
    status: "Concluído"
  },
  {
    id: "d-4",
    app: "iFood",
    earnings: 18.00,
    distanceKm: 5.0,
    tip: 3.00,
    waitTimeMin: 15,
    date: "2026-07-11",
    kmStart: 12128,
    kmEnd: 12134,
    fromAddress: "Shopping Pátio Paulista",
    toAddress: "Rua Vergueiro, 1500",
    status: "Concluído"
  },
  // 12th July (Sunday)
  {
    id: "d-5",
    app: "Particular",
    earnings: 45.00,
    distanceKm: 15.0,
    tip: 10.00,
    waitTimeMin: 5,
    date: "2026-07-12",
    kmStart: 12134,
    kmEnd: 12150,
    fromAddress: "Rua Domingos de Morais, 800",
    toAddress: "Av. Jabaquara, 2400",
    status: "Concluído"
  },
  // 13th July (Monday)
  {
    id: "d-6",
    app: "iFood",
    earnings: 14.00,
    distanceKm: 3.8,
    tip: 0,
    waitTimeMin: 25,
    date: "2026-07-13",
    kmStart: 12150,
    kmEnd: 12154,
    fromAddress: "McDonald's Paraíso",
    toAddress: "Rua Cubatão, 320",
    status: "Concluído"
  },
  {
    id: "d-7",
    app: "Loggi",
    earnings: 28.50,
    distanceKm: 9.2,
    tip: 4.00,
    waitTimeMin: 10,
    date: "2026-07-13",
    kmStart: 12154,
    kmEnd: 12165,
    fromAddress: "Av. Faria Lima, 2000",
    toAddress: "Rua Mourato Coelho, 850",
    status: "Concluído"
  },
  // 14th July (Tuesday)
  {
    id: "d-8",
    app: "iFood",
    earnings: 16.00,
    distanceKm: 4.5,
    tip: 2.50,
    waitTimeMin: 18,
    date: "2026-07-14",
    kmStart: 12410,
    kmEnd: 12415,
    fromAddress: "Burguer King Consolação",
    toAddress: "Rua Bela Cintra, 1200",
    status: "Concluído"
  },
  {
    id: "d-9",
    app: "Uber Flash",
    earnings: 35.00,
    distanceKm: 14.8,
    tip: 5.00,
    waitTimeMin: 6,
    date: "2026-07-14",
    kmStart: 12415,
    kmEnd: 12431,
    fromAddress: "Av. Rebouças, 1500",
    toAddress: "Alameda Lorena, 800",
    status: "Concluído"
  },
  // 15th July (Wednesday)
  {
    id: "d-10",
    app: "iFood",
    earnings: 19.50,
    distanceKm: 6.2,
    tip: 3.00,
    waitTimeMin: 14,
    date: "2026-07-15",
    kmStart: 12431,
    kmEnd: 12438,
    fromAddress: "Shopping Cidade São Paulo",
    toAddress: "Alameda Santos, 2200",
    status: "Concluído"
  },
  {
    id: "d-11",
    app: "Rappi",
    earnings: 25.00,
    distanceKm: 7.9,
    tip: 2.00,
    waitTimeMin: 22,
    date: "2026-07-15",
    kmStart: 12438,
    kmEnd: 12447,
    fromAddress: "Rua Pamplona, 1700",
    toAddress: "Av. Nove de Julho, 4800",
    status: "Concluído"
  },
  // 16th July (Thursday - Today)
  {
    id: "d-12",
    app: "iFood",
    earnings: 16.50,
    distanceKm: 4.1,
    tip: 4.00,
    waitTimeMin: 15,
    date: "2026-07-16",
    kmStart: 12447,
    kmEnd: 12452,
    fromAddress: "Av. Paulista, 1500",
    toAddress: "Rua Frei Caneca, 1200",
    status: "Concluído"
  },
  {
    id: "d-13",
    app: "Particular",
    earnings: 50.00,
    distanceKm: 18.0,
    tip: 15.00,
    waitTimeMin: 10,
    date: "2026-07-16",
    kmStart: 12452,
    kmEnd: 12470,
    fromAddress: "Shopping Light - Centro",
    toAddress: "Av. Sumaré, 800",
    status: "Concluído"
  }
];

export const initialTransactions: PaymentTransaction[] = [
  {
    id: "tx-1",
    clientName: "Roberto Faria",
    amount: 18.50,
    method: "PIX",
    status: "Sucesso",
    date: "2026-07-16T18:30:00Z"
  },
  {
    id: "tx-2",
    clientName: "Ana Paula Silva",
    amount: 65.00,
    method: "Cartão",
    status: "Sucesso",
    date: "2026-07-16T19:15:00Z"
  },
  {
    id: "tx-3",
    clientName: "Marcos Lima",
    amount: 32.00,
    method: "PIX",
    status: "Pendente",
    date: "2026-07-16T20:20:00Z"
  }
];

// Beautiful coordinates of São Paulo to use for mapping and GPS simulation
// [Latitude, Longitude]
export const MAP_NODES = {
  paulista: { name: "Av. Paulista (MASP)", coords: [-23.5614, -46.6559] as [number, number] },
  consolacao: { name: "Metrô Consolação", coords: [-23.5587, -46.6603] as [number, number] },
  centro: { name: "Praça da Sé", coords: [-23.5505, -46.6333] as [number, number] },
  pinheiros: { name: "Largo da Batata", coords: [-23.5681, -46.6926] as [number, number] },
  vila_madalena: { name: "Vila Madalena", coords: [-23.5542, -46.6902] as [number, number] },
  farialima: { name: "Faria Lima / Rebouças", coords: [-23.5714, -46.6853] as [number, number] },
  moema: { name: "Moema", coords: [-23.5991, -46.6601] as [number, number] },
  liberdade: { name: "Bairro da Liberdade", coords: [-23.5615, -46.6346] as [number, number] },
};

// Route structures for optimization
export const PRESET_ROUTES = [
  {
    id: "r1",
    name: "Rota Centro-Oeste Expressa (Otimizada)",
    stops: [MAP_NODES.centro, MAP_NODES.liberdade, MAP_NODES.paulista, MAP_NODES.farialima],
    distance: 8.4,
    durationMin: 18,
    savingsFuelPercent: 12
  },
  {
    id: "r2",
    name: "Rota Circular Pinheiros-Paulista (Menor Consumo)",
    stops: [MAP_NODES.pinheiros, MAP_NODES.vila_madalena, MAP_NODES.consolacao, MAP_NODES.paulista],
    distance: 6.2,
    durationMin: 15,
    savingsFuelPercent: 15
  },
  {
    id: "r3",
    name: "Rota Sul Fast Delivery",
    stops: [MAP_NODES.paulista, MAP_NODES.moema, MAP_NODES.farialima],
    distance: 10.5,
    durationMin: 22,
    savingsFuelPercent: 8
  }
];
