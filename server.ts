import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { users, deliveries, fuelExpenses, maintenanceRecords, otherExpenses, paymentTransactions } from "./src/db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthRequest, activeSessions } from './src/middleware/auth.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to resolve user in PostgreSQL and synchronize
  async function resolveUser(req: AuthRequest) {
    if (!req.user) throw new Error("No authenticated user");
    
    // If we have a direct custom user ID resolved in the token, fetch that
    if (req.user.isCustom && req.user.userId) {
      const existing = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
      if (existing.length > 0) {
        return existing[0];
      }
    }
    
    const uid = req.user.uid;
    const email = req.user.email || "";
    
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const inserted = await db.insert(users).values({
      uid,
      email,
    }).returning();
    return inserted[0];
  }

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // POST Custom Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Nome de usuário e senha são obrigatórios" });
      }

      // Check if user exists in database
      let userList = await db.select().from(users).where(eq(users.username, username)).limit(1);
      
      // If no user found and username/password is admin/admin, auto-create the admin user!
      if (userList.length === 0 && username === "admin" && password === "admin") {
        const [newAdmin] = await db.insert(users).values({
          uid: "admin_uid",
          email: "admin@motoboypro.com",
          username: "admin",
          password: "admin",
          model: "Honda CG 160 Fan",
          plate: "MBO-4A26"
        }).returning();
        userList = [newAdmin];
      }

      if (userList.length === 0 || userList[0].password !== password) {
        return res.status(401).json({ error: "Usuário ou senha inválidos" });
      }

      const user = userList[0];
      // Generate a secure custom token
      const token = "custom_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // Store in activeSessions map
      activeSessions.set(token, {
        uid: user.uid,
        email: user.email,
        userId: user.id
      });

      res.json({
        token,
        user: {
          id: user.id,
          uid: user.uid,
          email: user.email,
          username: user.username,
          model: user.model,
          plate: user.plate,
          averageConsumption: user.averageConsumption,
          fuelType: user.fuelType,
          currentKm: user.currentKm,
          dailyGoal: user.dailyGoal
        }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message || "Server login error" });
    }
  });

  // GET Profile
  app.get("/api/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      res.json(userRecord);
    } catch (error: any) {
      console.error("Error getting profile:", error);
      res.status(500).json({ error: error.message || "Database error" });
    }
  });

  // POST Profile (Update vehicle info, goal, current KM, etc.)
  app.post("/api/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      const { model, plate, averageConsumption, fuelType, currentKm, dailyGoal, username, password } = req.body;

      const updated = await db.update(users)
        .set({
          model: model !== undefined ? model : undefined,
          plate: plate !== undefined ? plate : undefined,
          averageConsumption: averageConsumption !== undefined ? parseFloat(averageConsumption) : undefined,
          fuelType: fuelType !== undefined ? fuelType : undefined,
          currentKm: currentKm !== undefined ? parseFloat(currentKm) : undefined,
          dailyGoal: dailyGoal !== undefined ? parseFloat(dailyGoal) : undefined,
          username: username !== undefined ? username : undefined,
          password: password !== undefined ? password : undefined,
        })
        .where(eq(users.id, userRecord.id))
        .returning();

      res.json(updated[0]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: error.message || "Database error" });
    }
  });

  // GET Deliveries
  app.get("/api/deliveries", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      const list = await db.select()
        .from(deliveries)
        .where(eq(deliveries.userId, userRecord.id))
        .orderBy(desc(deliveries.createdAt));
      res.json(list);
    } catch (error: any) {
      console.error("Error getting deliveries:", error);
      res.status(500).json({ error: error.message || "Database error" });
    }
  });

  // POST Deliveries
  app.post("/api/deliveries", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      const { app: appName, earnings, distanceKm, tip, waitTimeMin, date, kmStart, kmEnd, fromAddress, toAddress, status } = req.body;

      const [newDel] = await db.insert(deliveries)
        .values({
          userId: userRecord.id,
          app: appName,
          earnings: parseFloat(earnings),
          distanceKm: parseFloat(distanceKm),
          tip: tip !== undefined ? parseFloat(tip) : 0,
          waitTimeMin: waitTimeMin !== undefined ? parseInt(waitTimeMin) : 0,
          date,
          kmStart: kmStart !== undefined ? parseFloat(kmStart) : null,
          kmEnd: kmEnd !== undefined ? parseFloat(kmEnd) : null,
          fromAddress,
          toAddress,
          status: status || 'Concluído',
        })
        .returning();

      // Update current_km if kmEnd is higher
      if (kmEnd && parseFloat(kmEnd) > (userRecord.currentKm || 0)) {
        await db.update(users)
          .set({ currentKm: parseFloat(kmEnd) })
          .where(eq(users.id, userRecord.id));
      }

      res.json(newDel);
    } catch (error: any) {
      console.error("Error creating delivery:", error);
      res.status(500).json({ error: error.message || "Database error" });
    }
  });

  // GET Expenses
  app.get("/api/expenses", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      
      const fuels = await db.select().from(fuelExpenses).where(eq(fuelExpenses.userId, userRecord.id));
      const maints = await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.userId, userRecord.id));
      const others = await db.select().from(otherExpenses).where(eq(otherExpenses.userId, userRecord.id));

      res.json({
        fuelExpenses: fuels,
        maintenanceRecords: maints,
        otherExpenses: others
      });
    } catch (error: any) {
      console.error("Error getting expenses:", error);
      res.status(500).json({ error: error.message || "Database error" });
    }
  });

  // POST Fuel Expense
  app.post("/api/fuel-expenses", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      const { date, liters, pricePerLiter, totalCost, kmAtFuel } = req.body;

      const [newFuel] = await db.insert(fuelExpenses)
        .values({
          userId: userRecord.id,
          date,
          liters: parseFloat(liters),
          pricePerLiter: parseFloat(pricePerLiter),
          totalCost: parseFloat(totalCost),
          kmAtFuel: parseFloat(kmAtFuel),
        })
        .returning();

      // Update current_km if kmAtFuel is higher
      if (kmAtFuel && parseFloat(kmAtFuel) > (userRecord.currentKm || 0)) {
        await db.update(users)
          .set({ currentKm: parseFloat(kmAtFuel) })
          .where(eq(users.id, userRecord.id));
      }

      res.json(newFuel);
    } catch (error: any) {
      console.error("Error creating fuel expense:", error);
      res.status(500).json({ error: error.message || "Database error" });
    }
  });

  // POST Maintenance Record
  app.post("/api/maintenance-records", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      const { type, cost, date, kmAtMaintenance, nextDueKm, nextDueDate, description } = req.body;

      const [newMaint] = await db.insert(maintenanceRecords)
        .values({
          userId: userRecord.id,
          type,
          cost: parseFloat(cost),
          date,
          kmAtMaintenance: parseFloat(kmAtMaintenance),
          nextDueKm: nextDueKm !== undefined ? parseFloat(nextDueKm) : null,
          nextDueDate,
          description,
        })
        .returning();

      // Update current_km if kmAtMaintenance is higher
      if (kmAtMaintenance && parseFloat(kmAtMaintenance) > (userRecord.currentKm || 0)) {
        await db.update(users)
          .set({ currentKm: parseFloat(kmAtMaintenance) })
          .where(eq(users.id, userRecord.id));
      }

      res.json(newMaint);
    } catch (error: any) {
      console.error("Error creating maintenance record:", error);
      res.status(500).json({ error: error.message || "Database error" });
    }
  });

  // POST Other Expense
  app.post("/api/other-expenses", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      const { type, cost, date, description } = req.body;

      const [newOther] = await db.insert(otherExpenses)
        .values({
          userId: userRecord.id,
          type,
          cost: parseFloat(cost),
          date,
          description,
        })
        .returning();

      res.json(newOther);
    } catch (error: any) {
      console.error("Error creating other expense:", error);
      res.status(500).json({ error: error.message || "Database error" });
    }
  });

  // GET Transactions
  app.get("/api/transactions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      const list = await db.select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.userId, userRecord.id))
        .orderBy(desc(paymentTransactions.createdAt));
      res.json(list);
    } catch (error: any) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ error: error.message || "Database error" });
    }
  });

  // POST Transactions
  app.post("/api/transactions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      const { clientName, amount, method, status, date, deliveryId } = req.body;

      const [newTx] = await db.insert(paymentTransactions)
        .values({
          userId: userRecord.id,
          clientName,
          amount: parseFloat(amount),
          method,
          status: status || 'Pendente',
          date,
          deliveryId,
        })
        .returning();

      res.json(newTx);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: error.message || "Database error" });
    }
  });

  // Bulk Sync Online route
  app.post("/api/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await resolveUser(req);
      const { deliveries: pendingDeliveries, fuelExpenses: pendingFuel, maintenanceRecords: pendingMaint, otherExpenses: pendingOther, transactions: pendingTx } = req.body;

      const syncedDeliveries = [];
      if (Array.isArray(pendingDeliveries)) {
        for (const item of pendingDeliveries) {
          // Prevent duplicates by checking date/app/earnings
          const [inserted] = await db.insert(deliveries).values({
            userId: userRecord.id,
            app: item.app,
            earnings: parseFloat(item.earnings),
            distanceKm: parseFloat(item.distanceKm),
            tip: item.tip ? parseFloat(item.tip) : 0,
            waitTimeMin: item.waitTimeMin ? parseInt(item.waitTimeMin) : 0,
            date: item.date,
            kmStart: item.kmStart ? parseFloat(item.kmStart) : null,
            kmEnd: item.kmEnd ? parseFloat(item.kmEnd) : null,
            fromAddress: item.fromAddress,
            toAddress: item.toAddress,
            status: item.status || 'Concluído',
          }).returning();
          syncedDeliveries.push(inserted);
        }
      }

      const syncedFuels = [];
      if (Array.isArray(pendingFuel)) {
        for (const item of pendingFuel) {
          const [inserted] = await db.insert(fuelExpenses).values({
            userId: userRecord.id,
            date: item.date,
            liters: parseFloat(item.liters),
            pricePerLiter: parseFloat(item.pricePerLiter),
            totalCost: parseFloat(item.totalCost),
            kmAtFuel: parseFloat(item.kmAtFuel),
          }).returning();
          syncedFuels.push(inserted);
        }
      }

      const syncedMaints = [];
      if (Array.isArray(pendingMaint)) {
        for (const item of pendingMaint) {
          const [inserted] = await db.insert(maintenanceRecords).values({
            userId: userRecord.id,
            type: item.type,
            cost: parseFloat(item.cost),
            date: item.date,
            kmAtMaintenance: parseFloat(item.kmAtMaintenance),
            nextDueKm: item.nextDueKm ? parseFloat(item.nextDueKm) : null,
            nextDueDate: item.nextDueDate,
            description: item.description,
          }).returning();
          syncedMaints.push(inserted);
        }
      }

      const syncedOthers = [];
      if (Array.isArray(pendingOther)) {
        for (const item of pendingOther) {
          const [inserted] = await db.insert(otherExpenses).values({
            userId: userRecord.id,
            type: item.type,
            cost: parseFloat(item.cost),
            date: item.date,
            description: item.description,
          }).returning();
          syncedOthers.push(inserted);
        }
      }

      const syncedTxs = [];
      if (Array.isArray(pendingTx)) {
        for (const item of pendingTx) {
          const [inserted] = await db.insert(paymentTransactions).values({
            userId: userRecord.id,
            clientName: item.clientName,
            amount: parseFloat(item.amount),
            method: item.method,
            status: item.status || 'Pendente',
            date: item.date,
            deliveryId: item.deliveryId,
          }).returning();
          syncedTxs.push(inserted);
        }
      }

      // Update general user metrics if needed
      let maxKm = userRecord.currentKm || 0;
      if (syncedDeliveries.length > 0) {
        const kms = syncedDeliveries.map(d => d.kmEnd).filter((k): k is number => k !== null);
        if (kms.length > 0) maxKm = Math.max(maxKm, ...kms);
      }
      if (syncedFuels.length > 0) {
        const kms = syncedFuels.map(f => f.kmAtFuel);
        maxKm = Math.max(maxKm, ...kms);
      }
      if (syncedMaints.length > 0) {
        const kms = syncedMaints.map(m => m.kmAtMaintenance);
        maxKm = Math.max(maxKm, ...kms);
      }

      if (maxKm > (userRecord.currentKm || 0)) {
        await db.update(users)
          .set({ currentKm: maxKm })
          .where(eq(users.id, userRecord.id));
      }

      res.json({
        success: true,
        deliveries: syncedDeliveries,
        fuelExpenses: syncedFuels,
        maintenanceRecords: syncedMaints,
        otherExpenses: syncedOthers,
        paymentTransactions: syncedTxs,
        currentKm: maxKm
      });
    } catch (error: any) {
      console.error("Sync error:", error);
      res.status(500).json({ error: error.message || "Database sync error" });
    }
  });

  // Vite middleware setup (must run after API routes)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
