package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ReceiptLong
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.DirectionsBike
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.local.entity.TransactionEntity
import com.example.ui.components.KmUpdateDialog
import com.example.ui.screens.AddEditTransactionBottomSheet
import com.example.ui.screens.CategoryManagerDialog
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.LoginScreen
import com.example.ui.screens.MaintenanceScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.ReportsScreen
import com.example.ui.screens.TransactionsScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.PolishDarkBackground
import com.example.ui.theme.PolishDarkBorder
import com.example.ui.theme.PolishDarkSurface
import com.example.ui.theme.PolishDeepPurpleOnPrimary
import com.example.ui.theme.PolishMediumPurpleContainer
import com.example.ui.theme.PolishPurplePrimary
import com.example.ui.theme.PolishTextSecondaryDark
import com.example.ui.viewmodel.AccountScopeFilter
import com.example.ui.viewmodel.FinanceViewModel

enum class AppNavigationTab(val label: String) {
    DASHBOARD("Início"),
    TRANSACTIONS("Extrato"),
    MAINTENANCE("Moto"),
    REPORTS("Relatórios"),
    PROFILE("Perfil")
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val viewModel: FinanceViewModel = viewModel()
            val user by viewModel.userState.collectAsState()
            val isDarkTheme = user?.isDarkMode ?: true

            MyApplicationTheme(darkTheme = isDarkTheme) {
                FinanceApp(viewModel = viewModel)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinanceApp(
    viewModel: FinanceViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    val user by viewModel.userState.collectAsState()
    val isLoggedIn = user?.isLoggedIn ?: false
    val isDarkMode = user?.isDarkMode ?: true

    val metrics by viewModel.metrics.collectAsState()
    val filteredTransactions by viewModel.filteredTransactions.collectAsState()
    val categories by viewModel.allCategories.collectAsState()
    val maintenanceItems by viewModel.allMaintenanceItems.collectAsState()
    val selectedScope by viewModel.selectedScope.collectAsState()
    val selectedPeriod by viewModel.selectedPeriod.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val typeFilter by viewModel.selectedTypeFilter.collectAsState()
    val categoryFilter by viewModel.selectedCategoryFilter.collectAsState()
    val customStartDate by viewModel.customStartDate.collectAsState()
    val customEndDate by viewModel.customEndDate.collectAsState()

    var currentTab by remember { mutableStateOf(AppNavigationTab.DASHBOARD) }

    // Dialog & Sheet States
    var showAddTransactionSheet by remember { mutableStateOf(false) }
    var transactionToEdit by remember { mutableStateOf<TransactionEntity?>(null) }
    var transactionDefaultType by remember { mutableStateOf("EXPENSE") }
    var transactionDefaultScope by remember { mutableStateOf("PJ") }

    var showKmDialog by remember { mutableStateOf(false) }
    var showCategoryManagerDialog by remember { mutableStateOf(false) }

    if (!isLoggedIn) {
        LoginScreen(
            onLoginSubmit = { u, p ->
                var success = false
                viewModel.login(
                    username = u,
                    pass = p,
                    onSuccess = { success = true },
                    onError = { msg ->
                        Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
                    }
                )
                success
            },
            modifier = modifier
        )
        return
    }

    Scaffold(
        bottomBar = {
            // Professional Polish Bottom Navigation Bar: bg-[#211F26] border-t border-[#49454F]
            NavigationBar(
                containerColor = PolishDarkSurface,
                tonalElevation = 4.dp,
                modifier = Modifier
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .border(width = 0.5.dp, color = PolishDarkBorder)
                    .testTag("main_bottom_nav")
            ) {
                NavigationBarItem(
                    selected = currentTab == AppNavigationTab.DASHBOARD,
                    onClick = { currentTab = AppNavigationTab.DASHBOARD },
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = "Início") },
                    label = { Text(AppNavigationTab.DASHBOARD.label, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PolishPurplePrimary,
                        selectedTextColor = PolishPurplePrimary,
                        unselectedIconColor = PolishTextSecondaryDark.copy(alpha = 0.6f),
                        unselectedTextColor = PolishTextSecondaryDark.copy(alpha = 0.6f),
                        indicatorColor = PolishDeepPurpleOnPrimary
                    ),
                    modifier = Modifier.testTag("nav_item_dashboard")
                )

                NavigationBarItem(
                    selected = currentTab == AppNavigationTab.TRANSACTIONS,
                    onClick = { currentTab = AppNavigationTab.TRANSACTIONS },
                    icon = { Icon(Icons.AutoMirrored.Filled.ReceiptLong, contentDescription = "Extrato") },
                    label = { Text(AppNavigationTab.TRANSACTIONS.label, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PolishPurplePrimary,
                        selectedTextColor = PolishPurplePrimary,
                        unselectedIconColor = PolishTextSecondaryDark.copy(alpha = 0.6f),
                        unselectedTextColor = PolishTextSecondaryDark.copy(alpha = 0.6f),
                        indicatorColor = PolishDeepPurpleOnPrimary
                    ),
                    modifier = Modifier.testTag("nav_item_transactions")
                )

                NavigationBarItem(
                    selected = currentTab == AppNavigationTab.MAINTENANCE,
                    onClick = { currentTab = AppNavigationTab.MAINTENANCE },
                    icon = { Icon(Icons.Default.DirectionsBike, contentDescription = "Moto") },
                    label = { Text(AppNavigationTab.MAINTENANCE.label, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PolishPurplePrimary,
                        selectedTextColor = PolishPurplePrimary,
                        unselectedIconColor = PolishTextSecondaryDark.copy(alpha = 0.6f),
                        unselectedTextColor = PolishTextSecondaryDark.copy(alpha = 0.6f),
                        indicatorColor = PolishDeepPurpleOnPrimary
                    ),
                    modifier = Modifier.testTag("nav_item_maintenance")
                )

                NavigationBarItem(
                    selected = currentTab == AppNavigationTab.REPORTS,
                    onClick = { currentTab = AppNavigationTab.REPORTS },
                    icon = { Icon(Icons.Default.BarChart, contentDescription = "Relatórios") },
                    label = { Text(AppNavigationTab.REPORTS.label, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PolishPurplePrimary,
                        selectedTextColor = PolishPurplePrimary,
                        unselectedIconColor = PolishTextSecondaryDark.copy(alpha = 0.6f),
                        unselectedTextColor = PolishTextSecondaryDark.copy(alpha = 0.6f),
                        indicatorColor = PolishDeepPurpleOnPrimary
                    ),
                    modifier = Modifier.testTag("nav_item_reports")
                )

                NavigationBarItem(
                    selected = currentTab == AppNavigationTab.PROFILE,
                    onClick = { currentTab = AppNavigationTab.PROFILE },
                    icon = { Icon(Icons.Default.Person, contentDescription = "Perfil") },
                    label = { Text(AppNavigationTab.PROFILE.label, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = PolishPurplePrimary,
                        selectedTextColor = PolishPurplePrimary,
                        unselectedIconColor = PolishTextSecondaryDark.copy(alpha = 0.6f),
                        unselectedTextColor = PolishTextSecondaryDark.copy(alpha = 0.6f),
                        indicatorColor = PolishDeepPurpleOnPrimary
                    ),
                    modifier = Modifier.testTag("nav_item_profile")
                )
            }
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(PolishDarkBackground)
        ) {
            Crossfade(targetState = currentTab, label = "tab_crossfade") { tab ->
                when (tab) {
                    AppNavigationTab.DASHBOARD -> DashboardScreen(
                        user = user,
                        metrics = metrics,
                        transactions = filteredTransactions,
                        selectedScope = selectedScope,
                        onScopeSelected = { viewModel.setScope(it) },
                        selectedPeriod = selectedPeriod,
                        onPeriodSelected = { viewModel.setPeriod(it) },
                        isDarkMode = isDarkMode,
                        onToggleDarkMode = { viewModel.toggleDarkMode(!isDarkMode) },
                        onOpenProfile = { currentTab = AppNavigationTab.PROFILE },
                        onAddIncomeClick = {
                            transactionToEdit = null
                            transactionDefaultType = "INCOME"
                            transactionDefaultScope = if (selectedScope == AccountScopeFilter.PF) "PF" else "PJ"
                            showAddTransactionSheet = true
                        },
                        onAddExpenseClick = {
                            transactionToEdit = null
                            transactionDefaultType = "EXPENSE"
                            transactionDefaultScope = if (selectedScope == AccountScopeFilter.PF) "PF" else "PJ"
                            showAddTransactionSheet = true
                        },
                        onUpdateKmClick = { showKmDialog = true },
                        onOpenMaintenanceHub = { currentTab = AppNavigationTab.MAINTENANCE },
                        onRecordOilChangeClick = {
                            val oilItem = maintenanceItems.firstOrNull { it.title.contains("Óleo", ignoreCase = true) }
                            if (oilItem != null) {
                                viewModel.recordMaintenance(
                                    item = oilItem,
                                    currentKm = user?.currentKm ?: 24500,
                                    cost = 45.0,
                                    notes = "Troca de Óleo Efetuada"
                                )
                                Toast.makeText(context, "Troca de óleo registrada como despesa PJ!", Toast.LENGTH_SHORT).show()
                            } else {
                                transactionToEdit = null
                                transactionDefaultType = "EXPENSE"
                                transactionDefaultScope = "PJ"
                                showAddTransactionSheet = true
                            }
                        },
                        onViewAllTransactions = { currentTab = AppNavigationTab.TRANSACTIONS },
                        onEditTransaction = {
                            transactionToEdit = it
                            showAddTransactionSheet = true
                        },
                        onDeleteTransaction = { viewModel.deleteTransaction(it) }
                    )

                    AppNavigationTab.TRANSACTIONS -> TransactionsScreen(
                        transactions = filteredTransactions,
                        categories = categories,
                        searchQuery = searchQuery,
                        onSearchQueryChange = { viewModel.setSearchQuery(it) },
                        selectedTypeFilter = typeFilter,
                        onTypeFilterSelected = { viewModel.setTypeFilter(it) },
                        selectedCategoryFilter = categoryFilter,
                        onCategoryFilterSelected = { viewModel.setCategoryFilter(it) },
                        onAddTransactionClick = {
                            transactionToEdit = null
                            transactionDefaultType = "EXPENSE"
                            transactionDefaultScope = if (selectedScope == AccountScopeFilter.PF) "PF" else "PJ"
                            showAddTransactionSheet = true
                        },
                        onEditTransaction = {
                            transactionToEdit = it
                            showAddTransactionSheet = true
                        },
                        onDeleteTransaction = { viewModel.deleteTransaction(it) }
                    )

                    AppNavigationTab.MAINTENANCE -> MaintenanceScreen(
                        user = user,
                        maintenanceItems = maintenanceItems,
                        onUpdateKmClick = { showKmDialog = true },
                        onRecordMaintenance = { item, km, cost, notes ->
                            viewModel.recordMaintenance(item, km, cost, notes)
                            Toast.makeText(context, "Manutenção registrada e lançada nas despesas!", Toast.LENGTH_SHORT).show()
                        },
                        onSaveMaintenanceItem = { viewModel.saveMaintenanceItem(it) },
                        onDeleteMaintenanceItem = { viewModel.deleteMaintenanceItem(it) }
                    )

                    AppNavigationTab.REPORTS -> ReportsScreen(
                        user = user,
                        metrics = metrics,
                        transactions = filteredTransactions,
                        selectedPeriod = selectedPeriod,
                        onPeriodSelected = { viewModel.setPeriod(it) },
                        customStartDate = customStartDate,
                        customEndDate = customEndDate,
                        onCustomRangeSelected = { start, end -> viewModel.setCustomDateRange(start, end) },
                        onExportPdf = { viewModel.exportPdf(context) },
                        onExportCsv = { viewModel.exportCsv(context) }
                    )

                    AppNavigationTab.PROFILE -> ProfileScreen(
                        user = user,
                        isDarkMode = isDarkMode,
                        onToggleDarkMode = { viewModel.toggleDarkMode(it) },
                        onUpdateProfile = { username, pass, name, vehicle, plate, km, interval ->
                            viewModel.updateUserProfile(
                                username = username,
                                password = pass,
                                fullName = name,
                                vehicleModel = vehicle,
                                vehiclePlate = plate,
                                currentKm = km,
                                oilInterval = interval,
                                onSuccess = {
                                    Toast.makeText(context, "Perfil atualizado!", Toast.LENGTH_SHORT).show()
                                }
                            )
                        },
                        onManageCategories = { showCategoryManagerDialog = true },
                        onResetData = { viewModel.resetAllData(context) },
                        onLogout = { viewModel.logout() }
                    )
                }
            }
        }
    }

    // Modal Bottom Sheet: Add / Edit Transaction
    if (showAddTransactionSheet) {
        AddEditTransactionBottomSheet(
            initialTransaction = transactionToEdit,
            defaultType = transactionDefaultType,
            defaultScope = transactionDefaultScope,
            categories = categories,
            onDismiss = {
                showAddTransactionSheet = false
                transactionToEdit = null
            },
            onSave = { entity ->
                viewModel.saveTransaction(entity)
                showAddTransactionSheet = false
                transactionToEdit = null
            }
        )
    }

    // Dialog: Update Vehicle KM
    if (showKmDialog) {
        KmUpdateDialog(
            initialKm = user?.currentKm ?: 24500,
            onDismiss = { showKmDialog = false },
            onSave = { newKm ->
                viewModel.updateVehicleKm(newKm)
                showKmDialog = false
            }
        )
    }

    // Dialog: Manage Categories
    if (showCategoryManagerDialog) {
        CategoryManagerDialog(
            categories = categories,
            onSaveCategory = { viewModel.saveCategory(it) },
            onDeleteCategory = { viewModel.deleteCategory(it) },
            onDismiss = { showCategoryManagerDialog = false }
        )
    }
}
