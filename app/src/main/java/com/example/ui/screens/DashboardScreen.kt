package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.TransactionEntity
import com.example.data.local.entity.UserAccount
import com.example.ui.components.FinancialSummaryCards
import com.example.ui.components.MotoDashboardSection
import com.example.ui.components.PaymentMethodChip
import com.example.ui.components.ScopeBadge
import com.example.ui.components.TopHeader
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatShortDate
import com.example.ui.components.getCategoryIcon
import com.example.ui.theme.PolishDarkBackground
import com.example.ui.theme.PolishDarkBorder
import com.example.ui.theme.PolishDarkCardSurface
import com.example.ui.theme.PolishDeepPurpleOnPrimary
import com.example.ui.theme.PolishExpenseRed
import com.example.ui.theme.PolishMediumPurpleContainer
import com.example.ui.theme.PolishPurplePrimary
import com.example.ui.viewmodel.AccountScopeFilter
import com.example.ui.viewmodel.FinancialMetrics
import com.example.ui.viewmodel.PeriodFilter

@Composable
fun DashboardScreen(
    user: UserAccount?,
    metrics: FinancialMetrics,
    transactions: List<TransactionEntity>,
    selectedScope: AccountScopeFilter,
    onScopeSelected: (AccountScopeFilter) -> Unit,
    selectedPeriod: PeriodFilter,
    onPeriodSelected: (PeriodFilter) -> Unit,
    isDarkMode: Boolean,
    onToggleDarkMode: () -> Unit,
    onOpenProfile: () -> Unit,
    onAddIncomeClick: () -> Unit,
    onAddExpenseClick: () -> Unit,
    onUpdateKmClick: () -> Unit,
    onOpenMaintenanceHub: () -> Unit,
    onRecordOilChangeClick: () -> Unit,
    onViewAllTransactions: () -> Unit,
    onEditTransaction: (TransactionEntity) -> Unit,
    onDeleteTransaction: (TransactionEntity) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(PolishDarkBackground)
    ) {
        // Sticky Header with Scope Selector & Filters
        TopHeader(
            user = user,
            selectedScope = selectedScope,
            onScopeSelected = onScopeSelected,
            selectedPeriod = selectedPeriod,
            onPeriodSelected = onPeriodSelected,
            isDarkMode = isDarkMode,
            onToggleDarkMode = onToggleDarkMode,
            onOpenProfile = onOpenProfile
        )

        // Scrollable Dashboard Content
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. Financial Summary Hero Card
            item {
                FinancialSummaryCards(
                    metrics = metrics,
                    scope = selectedScope
                )
            }

            // 2. Big Action Buttons
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // + Nova Receita
                    Button(
                        onClick = onAddIncomeClick,
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("dashboard_add_income_btn"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PolishPurplePrimary,
                            contentColor = PolishDeepPurpleOnPrimary
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "+ Receita",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }

                    // - Nova Despesa
                    Button(
                        onClick = onAddExpenseClick,
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("dashboard_add_expense_btn"),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PolishDarkCardSurface,
                            contentColor = PolishExpenseRed
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, PolishDarkBorder)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Remove,
                            contentDescription = null,
                            tint = PolishExpenseRed,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "- Despesa",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }

            // 3. Motorcycle Management Section
            if (selectedScope != AccountScopeFilter.PF) {
                item {
                    MotoDashboardSection(
                        user = user,
                        metrics = metrics,
                        onUpdateKmClick = onUpdateKmClick,
                        onOpenMaintenanceHub = onOpenMaintenanceHub,
                        onRecordOilChangeClick = onRecordOilChangeClick
                    )
                }
            }

            // 4. Recent Transactions Header & List
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TRANSAÇÕES RECENTES",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                        letterSpacing = 1.sp
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clickable { onViewAllTransactions() }
                            .padding(4.dp)
                    ) {
                        Text(
                            text = "Ver Todas (${transactions.size})",
                            style = MaterialTheme.typography.labelMedium,
                            color = PolishPurplePrimary,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Icon(
                            imageVector = Icons.Default.ArrowForward,
                            contentDescription = null,
                            tint = PolishPurplePrimary,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            if (transactions.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, PolishDarkBorder, RoundedCornerShape(16.dp)),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = PolishDarkCardSurface)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Nenhuma transação cadastrada",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Toque nos botões acima para adicionar suas receitas ou despesas.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            } else {
                val recent = transactions.take(8)
                items(recent, key = { it.id }) { item ->
                    TransactionItemCard(
                        transaction = item,
                        onEdit = { onEditTransaction(item) },
                        onDelete = { onDeleteTransaction(item) }
                    )
                }
            }

            item {
                Spacer(modifier = Modifier.height(70.dp))
            }
        }
    }
}

@Composable
fun TransactionItemCard(
    transaction: TransactionEntity,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isIncome = transaction.type == "INCOME"

    // Professional Polish Item: bg-[#2B2930]/50 p-3 rounded-xl border border-[#49454F]/50
    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, PolishDarkBorder.copy(alpha = 0.6f), RoundedCornerShape(14.dp))
            .clickable { onEdit() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = PolishDarkCardSurface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                // Category Icon (rounded-lg bg-[#381E72])
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(PolishDeepPurpleOnPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = getCategoryIcon("", transaction.category),
                        contentDescription = transaction.category,
                        tint = PolishPurplePrimary,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                    Text(
                        text = transaction.title,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        ScopeBadge(scope = transaction.scope)
                        PaymentMethodChip(method = transaction.paymentMethod)
                        Text(
                            text = formatShortDate(transaction.date),
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                        )
                    }
                    if (transaction.vehicleKm != null) {
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Odômetro: ${transaction.vehicleKm} km",
                            fontSize = 10.sp,
                            color = PolishPurplePrimary
                        )
                    }
                }
            }

            // Amount and Action
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = (if (isIncome) "+ " else "- ") + formatCurrency(transaction.amount),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isIncome) PolishPurplePrimary else PolishExpenseRed
                )

                Row {
                    IconButton(
                        onClick = onEdit,
                        modifier = Modifier.size(26.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Editar",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.size(26.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Excluir",
                            tint = PolishExpenseRed.copy(alpha = 0.7f),
                            modifier = Modifier.size(15.dp)
                        )
                    }
                }
            }
        }
    }
}
