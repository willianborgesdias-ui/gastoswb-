package com.example.ui.viewmodel

import android.app.Application
import android.content.Context
import android.widget.Toast
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.export.ReportExporter
import com.example.data.local.AppDatabase
import com.example.data.local.entity.CategoryEntity
import com.example.data.local.entity.MaintenanceItemEntity
import com.example.data.local.entity.TransactionEntity
import com.example.data.local.entity.UserAccount
import com.example.data.repository.FinanceRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Calendar

enum class AccountScopeFilter(val label: String) {
    CONSOLIDATED("Consolidado (PF+PJ)"),
    PF("Pessoa Física (PF)"),
    PJ("Pessoa Jurídica (PJ)")
}

enum class PeriodFilter(val label: String) {
    CURRENT_MONTH("Mês Atual"),
    PREVIOUS_MONTH("Mês Anterior"),
    LAST_7_DAYS("Últimos 7 dias"),
    CUSTOM("Personalizado"),
    ALL("Todo o Período")
}

data class FinancialMetrics(
    val totalIncome: Double = 0.0,
    val totalExpense: Double = 0.0,
    val netBalance: Double = 0.0,
    val incomeCount: Int = 0,
    val expenseCount: Int = 0,

    // Specific to PJ / Delivery
    val pjIncome: Double = 0.0,
    val pjExpense: Double = 0.0,
    val fuelExpense: Double = 0.0,
    val fuelPercentageOfIncome: Double = 0.0,
    val maintenanceExpense: Double = 0.0,

    // Specific to PF
    val pfIncome: Double = 0.0,
    val pfExpense: Double = 0.0,

    // Percentages PF vs PJ
    val pjSharePercent: Float = 0f,
    val pfSharePercent: Float = 0f
)

class FinanceViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: FinanceRepository

    init {
        val db = AppDatabase.getDatabase(application)
        repository = FinanceRepository(db)
    }

    // User flow
    val userState: StateFlow<UserAccount?> = repository.userFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    // All transactions flow
    val allTransactions: StateFlow<List<TransactionEntity>> = repository.allTransactionsFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // All maintenance flow
    val allMaintenanceItems: StateFlow<List<MaintenanceItemEntity>> = repository.allMaintenanceFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // All categories flow
    val allCategories: StateFlow<List<CategoryEntity>> = repository.allCategoriesFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Scope filter (PF, PJ, Consolidado)
    private val _selectedScope = MutableStateFlow(AccountScopeFilter.CONSOLIDATED)
    val selectedScope: StateFlow<AccountScopeFilter> = _selectedScope.asStateFlow()

    // Period filter
    private val _selectedPeriod = MutableStateFlow(PeriodFilter.CURRENT_MONTH)
    val selectedPeriod: StateFlow<PeriodFilter> = _selectedPeriod.asStateFlow()

    // Custom date range
    private val _customStartDate = MutableStateFlow(getStartOfCurrentMonth())
    val customStartDate: StateFlow<Long> = _customStartDate.asStateFlow()

    private val _customEndDate = MutableStateFlow(getEndOfCurrentMonth())
    val customEndDate: StateFlow<Long> = _customEndDate.asStateFlow()

    // Search and category filters
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedCategoryFilter = MutableStateFlow<String?>(null)
    val selectedCategoryFilter: StateFlow<String?> = _selectedCategoryFilter.asStateFlow()

    private val _selectedTypeFilter = MutableStateFlow<String?>(null) // "INCOME", "EXPENSE" or null for all
    val selectedTypeFilter: StateFlow<String?> = _selectedTypeFilter.asStateFlow()

    // Filtered Transactions
    val filteredTransactions: StateFlow<List<TransactionEntity>> = combine(
        allTransactions,
        _selectedScope,
        _selectedPeriod,
        _customStartDate,
        _customEndDate,
        _searchQuery,
        _selectedCategoryFilter,
        _selectedTypeFilter
    ) { params ->
        val list = params[0] as List<TransactionEntity>
        val scope = params[1] as AccountScopeFilter
        val period = params[2] as PeriodFilter
        val startCustom = params[3] as Long
        val endCustom = params[4] as Long
        val query = (params[5] as String).trim()
        val catFilter = params[6] as String?
        val typeFilter = params[7] as String?

        val (startDate, endDate) = getPeriodDateRange(period, startCustom, endCustom)

        list.filter { t ->
            val matchScope = when (scope) {
                AccountScopeFilter.CONSOLIDATED -> true
                AccountScopeFilter.PF -> t.scope == "PF"
                AccountScopeFilter.PJ -> t.scope == "PJ"
            }
            val matchPeriod = t.date in startDate..endDate
            val matchQuery = query.isEmpty() ||
                    t.title.contains(query, ignoreCase = true) ||
                    t.category.contains(query, ignoreCase = true) ||
                    t.notes.contains(query, ignoreCase = true) ||
                    t.paymentMethod.contains(query, ignoreCase = true)
            val matchCat = catFilter == null || t.category == catFilter
            val matchType = typeFilter == null || t.type == typeFilter

            matchScope && matchPeriod && matchQuery && matchCat && matchType
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // Calculated financial metrics for the current view
    val metrics: StateFlow<FinancialMetrics> = combine(
        allTransactions,
        _selectedScope,
        _selectedPeriod,
        _customStartDate,
        _customEndDate
    ) { list, scope, period, startCustom, endCustom ->
        val (startDate, endDate) = getPeriodDateRange(period, startCustom, endCustom)
        val periodTransactions = list.filter { it.date in startDate..endDate }

        val pjIncomes = periodTransactions.filter { it.scope == "PJ" && it.type == "INCOME" }.sumOf { it.amount }
        val pjExpenses = periodTransactions.filter { it.scope == "PJ" && it.type == "EXPENSE" }.sumOf { it.amount }
        val pfIncomes = periodTransactions.filter { it.scope == "PF" && it.type == "INCOME" }.sumOf { it.amount }
        val pfExpenses = periodTransactions.filter { it.scope == "PF" && it.type == "EXPENSE" }.sumOf { it.amount }

        val fuelExpenses = periodTransactions.filter {
            it.scope == "PJ" && it.category.contains("Combustível", ignoreCase = true)
        }.sumOf { it.amount }

        val maintenanceExpenses = periodTransactions.filter {
            it.scope == "PJ" && (
                    it.category.contains("Manutenção", ignoreCase = true) ||
                            it.category.contains("Óleo", ignoreCase = true)
                    )
        }.sumOf { it.amount }

        val fuelPercentage = if (pjIncomes > 0) (fuelExpenses / pjIncomes) * 100.0 else 0.0

        val totalExpensesAll = pjExpenses + pfExpenses
        val pjShare = if (totalExpensesAll > 0) (pjExpenses / totalExpensesAll).toFloat() else 0.5f
        val pfShare = if (totalExpensesAll > 0) (pfExpenses / totalExpensesAll).toFloat() else 0.5f

        val (income, expense, incCount, expCount) = when (scope) {
            AccountScopeFilter.CONSOLIDATED -> {
                val inc = pjIncomes + pfIncomes
                val exp = pjExpenses + pfExpenses
                val iC = periodTransactions.count { it.type == "INCOME" }
                val eC = periodTransactions.count { it.type == "EXPENSE" }
                Quad(inc, exp, iC, eC)
            }
            AccountScopeFilter.PF -> {
                val inc = pfIncomes
                val exp = pfExpenses
                val iC = periodTransactions.count { it.scope == "PF" && it.type == "INCOME" }
                val eC = periodTransactions.count { it.scope == "PF" && it.type == "EXPENSE" }
                Quad(inc, exp, iC, eC)
            }
            AccountScopeFilter.PJ -> {
                val inc = pjIncomes
                val exp = pjExpenses
                val iC = periodTransactions.count { it.scope == "PJ" && it.type == "INCOME" }
                val eC = periodTransactions.count { it.scope == "PJ" && it.type == "EXPENSE" }
                Quad(inc, exp, iC, eC)
            }
        }

        FinancialMetrics(
            totalIncome = income,
            totalExpense = expense,
            netBalance = income - expense,
            incomeCount = incCount,
            expenseCount = expCount,
            pjIncome = pjIncomes,
            pjExpense = pjExpenses,
            fuelExpense = fuelExpenses,
            fuelPercentageOfIncome = fuelPercentage,
            maintenanceExpense = maintenanceExpenses,
            pfIncome = pfIncomes,
            pfExpense = pfExpenses,
            pjSharePercent = pjShare,
            pfSharePercent = pfShare
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = FinancialMetrics()
    )

    // Actions & Setters
    fun setScope(scope: AccountScopeFilter) {
        _selectedScope.value = scope
    }

    fun setPeriod(period: PeriodFilter) {
        _selectedPeriod.value = period
    }

    fun setCustomDateRange(start: Long, end: Long) {
        _customStartDate.value = start
        _customEndDate.value = end
        _selectedPeriod.value = PeriodFilter.CUSTOM
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setCategoryFilter(category: String?) {
        _selectedCategoryFilter.value = category
    }

    fun setTypeFilter(type: String?) {
        _selectedTypeFilter.value = type
    }

    // CRUD Transactions
    fun saveTransaction(transaction: TransactionEntity, onComplete: () -> Unit = {}) {
        viewModelScope.launch {
            if (transaction.id == 0L) {
                repository.insertTransaction(transaction)
            } else {
                repository.updateTransaction(transaction)
            }
            onComplete()
        }
    }

    fun deleteTransaction(transaction: TransactionEntity) {
        viewModelScope.launch {
            repository.deleteTransaction(transaction)
        }
    }

    // Motorcycle Maintenance & KM Actions
    fun updateVehicleKm(newKm: Int) {
        viewModelScope.launch {
            repository.updateCurrentKm(newKm)
        }
    }

    fun recordMaintenance(item: MaintenanceItemEntity, currentKm: Int, cost: Double, notes: String) {
        viewModelScope.launch {
            repository.recordMaintenancePerformed(item, currentKm, cost, notes)
            repository.updateCurrentKm(currentKm)
        }
    }

    fun saveMaintenanceItem(item: MaintenanceItemEntity) {
        viewModelScope.launch {
            if (item.id == 0L) {
                repository.insertMaintenanceItem(item)
            } else {
                repository.updateMaintenanceItem(item)
            }
        }
    }

    fun deleteMaintenanceItem(item: MaintenanceItemEntity) {
        viewModelScope.launch {
            repository.deleteMaintenanceItem(item)
        }
    }

    // Category CRUD
    fun saveCategory(category: CategoryEntity) {
        viewModelScope.launch {
            if (category.id == 0L) {
                repository.insertCategory(category)
            } else {
                repository.updateCategory(category)
            }
        }
    }

    fun deleteCategory(category: CategoryEntity) {
        viewModelScope.launch {
            repository.deleteCategory(category)
        }
    }

    // User & Auth Management
    fun login(username: String, pass: String, onSuccess: () -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            val user = repository.getUser()
            if (user != null) {
                if (user.username.trim() == username.trim() && user.passwordHash == pass) {
                    repository.setLoggedIn(true)
                    onSuccess()
                } else {
                    onError("Usuário ou senha incorretos! (Padrão: admin / admin)")
                }
            } else {
                // Fallback initial
                if (username == "admin" && pass == "admin") {
                    val defaultUser = UserAccount(isLoggedIn = true)
                    repository.saveUser(defaultUser)
                    onSuccess()
                } else {
                    onError("Usuário ou senha incorretos! (Padrão: admin / admin)")
                }
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            repository.setLoggedIn(false)
        }
    }

    fun updateUserProfile(
        username: String,
        password: String,
        fullName: String,
        vehicleModel: String,
        vehiclePlate: String,
        currentKm: Int,
        oilInterval: Int,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            val current = repository.getUser() ?: UserAccount()
            val updated = current.copy(
                username = username.trim().ifEmpty { current.username },
                passwordHash = password.ifEmpty { current.passwordHash },
                fullName = fullName.trim().ifEmpty { current.fullName },
                vehicleModel = vehicleModel.trim().ifEmpty { current.vehicleModel },
                vehiclePlate = vehiclePlate.trim().ifEmpty { current.vehiclePlate },
                currentKm = currentKm,
                oilChangeIntervalKm = oilInterval
            )
            repository.saveUser(updated)
            onSuccess()
        }
    }

    fun toggleDarkMode(isDark: Boolean) {
        viewModelScope.launch {
            repository.updateThemeMode(isDark)
        }
    }

    fun resetAllData(context: Context) {
        viewModelScope.launch {
            repository.resetData()
            Toast.makeText(context, "Dados restaurados com sucesso!", Toast.LENGTH_SHORT).show()
        }
    }

    // Export Reports
    fun exportPdf(context: Context) {
        val user = userState.value
        val list = filteredTransactions.value
        val periodName = _selectedPeriod.value.label

        val pdfFile = ReportExporter.exportToPdf(context, user, list, periodName)
        if (pdfFile != null) {
            ReportExporter.shareFile(context, pdfFile, "application/pdf", "Relatório Financeiro PDF ($periodName)")
        } else {
            Toast.makeText(context, "Erro ao gerar PDF!", Toast.LENGTH_SHORT).show()
        }
    }

    fun exportCsv(context: Context) {
        val user = userState.value
        val list = filteredTransactions.value
        val periodName = _selectedPeriod.value.label

        val csvFile = ReportExporter.exportToCsv(context, user, list, periodName)
        if (csvFile != null) {
            ReportExporter.shareFile(context, csvFile, "text/csv", "Extrato Financeiro CSV ($periodName)")
        } else {
            Toast.makeText(context, "Erro ao gerar CSV!", Toast.LENGTH_SHORT).show()
        }
    }

    // Helper functions
    private fun getPeriodDateRange(period: PeriodFilter, customStart: Long, customEnd: Long): Pair<Long, Long> {
        return when (period) {
            PeriodFilter.CURRENT_MONTH -> Pair(getStartOfCurrentMonth(), getEndOfCurrentMonth())
            PeriodFilter.PREVIOUS_MONTH -> Pair(getStartOfPreviousMonth(), getEndOfPreviousMonth())
            PeriodFilter.LAST_7_DAYS -> Pair(System.currentTimeMillis() - (7L * 24 * 60 * 60 * 1000), System.currentTimeMillis())
            PeriodFilter.CUSTOM -> Pair(customStart, customEnd)
            PeriodFilter.ALL -> Pair(0L, Long.MAX_VALUE)
        }
    }

    private fun getStartOfCurrentMonth(): Long {
        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_MONTH, 1)
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        return cal.timeInMillis
    }

    private fun getEndOfCurrentMonth(): Long {
        val cal = Calendar.getInstance()
        cal.set(Calendar.DAY_OF_MONTH, cal.getActualMaximum(Calendar.DAY_OF_MONTH))
        cal.set(Calendar.HOUR_OF_DAY, 23)
        cal.set(Calendar.MINUTE, 59)
        cal.set(Calendar.SECOND, 59)
        cal.set(Calendar.MILLISECOND, 999)
        return cal.timeInMillis
    }

    private fun getStartOfPreviousMonth(): Long {
        val cal = Calendar.getInstance()
        cal.add(Calendar.MONTH, -1)
        cal.set(Calendar.DAY_OF_MONTH, 1)
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        return cal.timeInMillis
    }

    private fun getEndOfPreviousMonth(): Long {
        val cal = Calendar.getInstance()
        cal.add(Calendar.MONTH, -1)
        cal.set(Calendar.DAY_OF_MONTH, cal.getActualMaximum(Calendar.DAY_OF_MONTH))
        cal.set(Calendar.HOUR_OF_DAY, 23)
        cal.set(Calendar.MINUTE, 59)
        cal.set(Calendar.SECOND, 59)
        cal.set(Calendar.MILLISECOND, 999)
        return cal.timeInMillis
    }
}

data class Quad<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
