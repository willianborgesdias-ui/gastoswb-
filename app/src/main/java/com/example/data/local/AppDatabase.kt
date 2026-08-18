package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.local.dao.CategoryDao
import com.example.data.local.dao.MaintenanceDao
import com.example.data.local.dao.TransactionDao
import com.example.data.local.dao.UserDao
import com.example.data.local.entity.CategoryEntity
import com.example.data.local.entity.MaintenanceItemEntity
import com.example.data.local.entity.TransactionEntity
import com.example.data.local.entity.UserAccount
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        UserAccount::class,
        TransactionEntity::class,
        MaintenanceItemEntity::class,
        CategoryEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun transactionDao(): TransactionDao
    abstract fun maintenanceDao(): MaintenanceDao
    abstract fun categoryDao(): CategoryDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "financas_autonomo.db"
                ).addCallback(object : Callback() {
                    override fun onCreate(db: SupportSQLiteDatabase) {
                        super.onCreate(db)
                        // Pre-populate with default categories, user, and maintenance reminders
                        CoroutineScope(Dispatchers.IO).launch {
                            val database = getDatabase(context)
                            prePopulateDatabase(database)
                        }
                    }
                }).build()
                INSTANCE = instance
                instance
            }
        }

        suspend fun prePopulateDatabase(db: AppDatabase) {
            // Default User
            db.userDao().insertOrUpdate(
                UserAccount(
                    id = 1,
                    username = "admin",
                    passwordHash = "admin",
                    fullName = "Carlos da Silva (Motoboy)",
                    vehicleModel = "Honda CG 160 Fan 2023",
                    vehiclePlate = "BRA-2E19",
                    currentKm = 24850,
                    oilChangeIntervalKm = 1000,
                    lastOilChangeKm = 24000,
                    isDarkMode = true,
                    isLoggedIn = false
                )
            )

            // Default Categories
            val defaultCategories = listOf(
                // PJ Expenses
                CategoryEntity(name = "Combustível", scope = "PJ", type = "EXPENSE", iconName = "local_gas_station", colorHex = "#EF4444", isDefault = true),
                CategoryEntity(name = "Troca de Óleo", scope = "PJ", type = "EXPENSE", iconName = "oil_barrel", colorHex = "#F59E0B", isDefault = true),
                CategoryEntity(name = "Manutenção/Peças", scope = "PJ", type = "EXPENSE", iconName = "build", colorHex = "#EC4899", isDefault = true),
                CategoryEntity(name = "Alimentação em Serviço", scope = "PJ", type = "EXPENSE", iconName = "restaurant", colorHex = "#8B5CF6", isDefault = true),
                CategoryEntity(name = "MEI / DAS / Impostos", scope = "PJ", type = "EXPENSE", iconName = "receipt_long", colorHex = "#6366F1", isDefault = true),
                CategoryEntity(name = "Equipamentos / Acessórios", scope = "PJ", type = "EXPENSE", iconName = "sports_motorsports", colorHex = "#14B8A6", isDefault = true),
                CategoryEntity(name = "IPVA / Licenciamento", scope = "PJ", type = "EXPENSE", iconName = "directions_bike", colorHex = "#F97316", isDefault = true),
                CategoryEntity(name = "Plano Celular / Internet", scope = "PJ", type = "EXPENSE", iconName = "smartphone", colorHex = "#06B6D4", isDefault = true),
                CategoryEntity(name = "Outros PJ", scope = "PJ", type = "EXPENSE", iconName = "more_horiz", colorHex = "#64748B", isDefault = true),

                // PJ Incomes
                CategoryEntity(name = "Faturamento / Corridas (Apps)", scope = "PJ", type = "INCOME", iconName = "two_wheeler", colorHex = "#10B981", isDefault = true),
                CategoryEntity(name = "Entregas Particulares / Fixas", scope = "PJ", type = "INCOME", iconName = "local_shipping", colorHex = "#059669", isDefault = true),
                CategoryEntity(name = "Gorjetas / Extras", scope = "PJ", type = "INCOME", iconName = "monetization_on", colorHex = "#34D399", isDefault = true),
                CategoryEntity(name = "Outras Receitas PJ", scope = "PJ", type = "INCOME", iconName = "attach_money", colorHex = "#10B981", isDefault = true),

                // PF Expenses
                CategoryEntity(name = "Alimentação Casa (Supermercado)", scope = "PF", type = "EXPENSE", iconName = "shopping_cart", colorHex = "#F59E0B", isDefault = true),
                CategoryEntity(name = "Moradia (Aluguel / Condomínio)", scope = "PF", type = "EXPENSE", iconName = "home", colorHex = "#3B82F6", isDefault = true),
                CategoryEntity(name = "Contas da Casa (Luz / Água / Net)", scope = "PF", type = "EXPENSE", iconName = "bolt", colorHex = "#EAB308", isDefault = true),
                CategoryEntity(name = "Saúde / Farmácia", scope = "PF", type = "EXPENSE", iconName = "local_pharmacy", colorHex = "#EC4899", isDefault = true),
                CategoryEntity(name = "Lazer / Família", scope = "PF", type = "EXPENSE", iconName = "celebration", colorHex = "#A855F7", isDefault = true),
                CategoryEntity(name = "Cartão de Crédito PF", scope = "PF", type = "EXPENSE", iconName = "credit_card", colorHex = "#EF4444", isDefault = true),
                CategoryEntity(name = "Educação / Cursos", scope = "PF", type = "EXPENSE", iconName = "school", colorHex = "#0284C7", isDefault = true),
                CategoryEntity(name = "Vestuário / Pessoal", scope = "PF", type = "EXPENSE", iconName = "checkroom", colorHex = "#64748B", isDefault = true),
                CategoryEntity(name = "Outros PF", scope = "PF", type = "EXPENSE", iconName = "more_horiz", colorHex = "#94A3B8", isDefault = true),

                // PF Incomes
                CategoryEntity(name = "Pró-Labore / Retirada PJ", scope = "PF", type = "INCOME", iconName = "account_balance_wallet", colorHex = "#10B981", isDefault = true),
                CategoryEntity(name = "Renda Extra / Bico", scope = "PF", type = "INCOME", iconName = "paid", colorHex = "#059669", isDefault = true),
                CategoryEntity(name = "Outras Receitas PF", scope = "PF", type = "INCOME", iconName = "savings", colorHex = "#34D399", isDefault = true)
            )
            db.categoryDao().insertAll(defaultCategories)

            // Default Maintenance Items for motorcycle
            val defaultMaintenance = listOf(
                MaintenanceItemEntity(
                    title = "Troca de Óleo do Motor (10W30 / 20W50)",
                    intervalKm = 1000,
                    lastPerformedKm = 24000,
                    lastPerformedDate = System.currentTimeMillis() - (12L * 24 * 60 * 60 * 1000),
                    cost = 45.0,
                    notes = "Mobil Super Moto ou Motul 3000"
                ),
                MaintenanceItemEntity(
                    title = "Kit Relação (Coroa, Pinhão e Corrente)",
                    intervalKm = 15000,
                    lastPerformedKm = 15000,
                    lastPerformedDate = System.currentTimeMillis() - (90L * 24 * 60 * 60 * 1000),
                    cost = 180.0,
                    notes = "Verificar folga e lubrificar semanalmente"
                ),
                MaintenanceItemEntity(
                    title = "Pneu Traseiro",
                    intervalKm = 12000,
                    lastPerformedKm = 18000,
                    lastPerformedDate = System.currentTimeMillis() - (60L * 24 * 60 * 60 * 1000),
                    cost = 220.0,
                    notes = "Pirelli Super City ou Levorin Matrix"
                ),
                MaintenanceItemEntity(
                    title = "Pneu Dianteiro",
                    intervalKm = 20000,
                    lastPerformedKm = 10000,
                    lastPerformedDate = System.currentTimeMillis() - (120L * 24 * 60 * 60 * 1000),
                    cost = 170.0,
                    notes = "Verificar calibragem a cada 7 dias"
                ),
                MaintenanceItemEntity(
                    title = "Pastilhas e Lonas de Freio",
                    intervalKm = 5000,
                    lastPerformedKm = 21000,
                    lastPerformedDate = System.currentTimeMillis() - (35L * 24 * 60 * 60 * 1000),
                    cost = 65.0,
                    notes = "Cobreq ou Fischer"
                ),
                MaintenanceItemEntity(
                    title = "Vela de Ignição e Filtro de Ar",
                    intervalKm = 10000,
                    lastPerformedKm = 20000,
                    lastPerformedDate = System.currentTimeMillis() - (50L * 24 * 60 * 60 * 1000),
                    cost = 55.0,
                    notes = "Vela NGK Iridium / Filtro original"
                )
            )
            db.maintenanceDao().insertAll(defaultMaintenance)

            // Seed realistic initial transactions for the current month so the dashboard looks vibrant right away
            val now = System.currentTimeMillis()
            val dayMs = 24L * 60 * 60 * 1000
            val sampleTransactions = listOf(
                // Incomes PJ
                TransactionEntity(title = "Faturamento iFood / Zé Delivery", amount = 850.0, type = "INCOME", scope = "PJ", category = "Faturamento / Corridas (Apps)", date = now - (1L * dayMs), paymentMethod = "PIX", notes = "Semana corrida com bônus de chuva"),
                TransactionEntity(title = "Entregas Loggi / Lalamove", amount = 420.0, type = "INCOME", scope = "PJ", category = "Faturamento / Corridas (Apps)", date = now - (3L * dayMs), paymentMethod = "PIX", notes = "Corridas corporativas centro"),
                TransactionEntity(title = "Entrega Fixa Hamburgueria Artesanal", amount = 300.0, type = "INCOME", scope = "PJ", category = "Entregas Particulares / Fixas", date = now - (5L * dayMs), paymentMethod = "PIX", notes = "Diária sábado + taxa por entrega"),
                TransactionEntity(title = "Gorjetas de Clientes em Dinheiro", amount = 45.0, type = "INCOME", scope = "PJ", category = "Gorjetas / Extras", date = now - (2L * dayMs), paymentMethod = "DINHEIRO", notes = "Gorjetas semana"),

                // Expenses PJ
                TransactionEntity(title = "Abastecimento Posto Ipiranga", amount = 65.0, type = "EXPENSE", scope = "PJ", category = "Combustível", date = now - (1L * dayMs), paymentMethod = "CARTAO_DEBITO", notes = "11.2 Litros - Gasolina Comum", vehicleKm = 24850, fuelLiters = 11.2),
                TransactionEntity(title = "Abastecimento Posto Shell", amount = 60.0, type = "EXPENSE", scope = "PJ", category = "Combustível", date = now - (4L * dayMs), paymentMethod = "PIX", notes = "10.5 Litros", vehicleKm = 24500, fuelLiters = 10.5),
                TransactionEntity(title = "Troca de Óleo Mobil 10W30", amount = 45.0, type = "EXPENSE", scope = "PJ", category = "Troca de Óleo", date = now - (12L * dayMs), paymentMethod = "PIX", notes = "Oficina do Beto Moto Peças", vehicleKm = 24000),
                TransactionEntity(title = "Almoço Prato Feito na Rota", amount = 28.0, type = "EXPENSE", scope = "PJ", category = "Alimentação em Serviço", date = now - (2L * dayMs), paymentMethod = "CARTAO_DEBITO", notes = "Restaurante popular Centro"),
                TransactionEntity(title = "Guia DAS MEI (Fev/2026)", amount = 75.60, type = "EXPENSE", scope = "PJ", category = "MEI / DAS / Impostos", date = now - (7L * dayMs), paymentMethod = "PIX", notes = "DAS Transportador Autônomo"),
                TransactionEntity(title = "Suporte de Celular Antivibração", amount = 85.0, type = "EXPENSE", scope = "PJ", category = "Equipamentos / Acessórios", date = now - (10L * dayMs), paymentMethod = "CARTAO_CREDITO", notes = "Garra com amortecedor para guidão"),

                // Incomes PF
                TransactionEntity(title = "Retirada Pró-Labore para Casa", amount = 700.0, type = "INCOME", scope = "PF", category = "Pró-Labore / Retirada PJ", date = now - (6L * dayMs), paymentMethod = "PIX", notes = "Transferência da conta PJ para PF"),

                // Expenses PF
                TransactionEntity(title = "Compras Supermercado Atacadão", amount = 380.0, type = "EXPENSE", scope = "PF", category = "Alimentação Casa (Supermercado)", date = now - (5L * dayMs), paymentMethod = "CARTAO_DEBITO", notes = "Rancho quinzenal da família"),
                TransactionEntity(title = "Conta de Energia Elétrica (Enel)", amount = 145.0, type = "EXPENSE", scope = "PF", category = "Contas da Casa (Luz / Água / Net)", date = now - (8L * dayMs), paymentMethod = "PIX", notes = "Vencimento 10"),
                TransactionEntity(title = "Farmácia - Remédios e Vitaminas", amount = 58.0, type = "EXPENSE", scope = "PF", category = "Saúde / Farmácia", date = now - (4L * dayMs), paymentMethod = "CARTAO_CREDITO", notes = "Dorflex e polivitamínico"),
                TransactionEntity(title = "Pizza Domingo com a Família", amount = 75.0, type = "EXPENSE", scope = "PF", category = "Lazer / Família", date = now - (2L * dayMs), paymentMethod = "PIX", notes = "Lazer fim de semana")
            )
            db.transactionDao().insertAll(sampleTransactions)
        }
    }
}
