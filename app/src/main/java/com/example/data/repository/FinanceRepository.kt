package com.example.data.repository

import com.example.data.local.AppDatabase
import com.example.data.local.entity.CategoryEntity
import com.example.data.local.entity.MaintenanceItemEntity
import com.example.data.local.entity.TransactionEntity
import com.example.data.local.entity.UserAccount
import kotlinx.coroutines.flow.Flow

class FinanceRepository(private val database: AppDatabase) {
    private val userDao = database.userDao()
    private val transactionDao = database.transactionDao()
    private val maintenanceDao = database.maintenanceDao()
    private val categoryDao = database.categoryDao()

    // User Operations
    val userFlow: Flow<UserAccount?> = userDao.getUserFlow()

    suspend fun getUser(): UserAccount? = userDao.getUser()

    suspend fun saveUser(user: UserAccount) = userDao.insertOrUpdate(user)

    suspend fun updateUser(user: UserAccount) = userDao.updateUser(user)

    suspend fun updateCurrentKm(newKm: Int) = userDao.updateCurrentKm(newKm)

    suspend fun updateLastOilChangeKm(km: Int) = userDao.updateLastOilChangeKm(km)

    suspend fun updateThemeMode(isDark: Boolean) = userDao.updateThemeMode(isDark)

    suspend fun setLoggedIn(isLoggedIn: Boolean) = userDao.updateLoginState(isLoggedIn)

    // Transaction Operations
    val allTransactionsFlow: Flow<List<TransactionEntity>> = transactionDao.getAllTransactionsFlow()

    fun getTransactionsByScopeFlow(scope: String): Flow<List<TransactionEntity>> =
        transactionDao.getTransactionsByScopeFlow(scope)

    suspend fun getAllTransactions(): List<TransactionEntity> = transactionDao.getAllTransactions()

    suspend fun insertTransaction(transaction: TransactionEntity): Long {
        val id = transactionDao.insertTransaction(transaction)
        // If vehicle KM is provided and greater than current KM, update user's current KM
        transaction.vehicleKm?.let { km ->
            val user = userDao.getUser()
            if (user != null && km > user.currentKm) {
                userDao.updateCurrentKm(km)
            }
            if (transaction.category.contains("Óleo", ignoreCase = true)) {
                userDao.updateLastOilChangeKm(km)
            }
        }
        return id
    }

    suspend fun updateTransaction(transaction: TransactionEntity) =
        transactionDao.updateTransaction(transaction)

    suspend fun deleteTransaction(transaction: TransactionEntity) =
        transactionDao.deleteTransaction(transaction)

    suspend fun deleteTransactionById(id: Long) = transactionDao.deleteById(id)

    // Maintenance Operations
    val allMaintenanceFlow: Flow<List<MaintenanceItemEntity>> = maintenanceDao.getAllMaintenanceItemsFlow()

    suspend fun insertMaintenanceItem(item: MaintenanceItemEntity) =
        maintenanceDao.insertItem(item)

    suspend fun updateMaintenanceItem(item: MaintenanceItemEntity) =
        maintenanceDao.updateItem(item)

    suspend fun deleteMaintenanceItem(item: MaintenanceItemEntity) =
        maintenanceDao.deleteItem(item)

    suspend fun recordMaintenancePerformed(item: MaintenanceItemEntity, currentKm: Int, cost: Double, notes: String) {
        val updated = item.copy(
            lastPerformedKm = currentKm,
            lastPerformedDate = System.currentTimeMillis(),
            cost = cost,
            notes = notes
        )
        maintenanceDao.updateItem(updated)

        // Also add a corresponding PJ Expense transaction
        transactionDao.insertTransaction(
            TransactionEntity(
                title = "Manutenção: ${item.title}",
                amount = cost,
                type = "EXPENSE",
                scope = "PJ",
                category = if (item.title.contains("Óleo", ignoreCase = true)) "Troca de Óleo" else "Manutenção/Peças",
                date = System.currentTimeMillis(),
                paymentMethod = "PIX",
                notes = "Registrado via painel de manutenção ($notes)",
                vehicleKm = currentKm
            )
        )

        if (item.title.contains("Óleo", ignoreCase = true)) {
            userDao.updateLastOilChangeKm(currentKm)
        }
    }

    // Category Operations
    val allCategoriesFlow: Flow<List<CategoryEntity>> = categoryDao.getAllCategoriesFlow()

    fun getCategoriesByScopeFlow(scope: String): Flow<List<CategoryEntity>> =
        categoryDao.getCategoriesByScopeFlow(scope)

    suspend fun insertCategory(category: CategoryEntity) = categoryDao.insertCategory(category)

    suspend fun updateCategory(category: CategoryEntity) = categoryDao.updateCategory(category)

    suspend fun deleteCategory(category: CategoryEntity) = categoryDao.deleteCategory(category)

    suspend fun resetData() {
        transactionDao.deleteAll()
        AppDatabase.prePopulateDatabase(database)
    }
}
