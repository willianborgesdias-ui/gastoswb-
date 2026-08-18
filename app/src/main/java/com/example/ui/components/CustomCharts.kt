package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.TransactionEntity
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.PurplePJ
import com.example.ui.theme.RedExpense

@Composable
fun ComparativePfPjChart(
    pjExpense: Double,
    pfExpense: Double,
    pjIncome: Double,
    pfIncome: Double,
    modifier: Modifier = Modifier
) {
    val totalExpense = pjExpense + pfExpense
    val pjPercent = if (totalExpense > 0) ((pjExpense / totalExpense) * 100).toInt() else 50
    val pfPercent = if (totalExpense > 0) 100 - pjPercent else 50

    val pjWeight by animateFloatAsState(
        targetValue = if (totalExpense > 0) (pjExpense / totalExpense).toFloat().coerceIn(0.05f, 0.95f) else 0.5f,
        label = "pjWeight"
    )
    val pfWeight = 1f - pjWeight

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Comparativo de Despesas: PJ (Trabalho) vs PF (Pessoal)",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Entenda para onde vai o dinheiro que você ganha com as entregas/serviços",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Split Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(18.dp)
                    .clip(RoundedCornerShape(9.dp))
            ) {
                Box(
                    modifier = Modifier
                        .weight(pjWeight)
                        .height(18.dp)
                        .background(PurplePJ)
                )
                Box(
                    modifier = Modifier
                        .weight(pfWeight)
                        .height(18.dp)
                        .background(EmeraldLight)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Legends & Values Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // PJ Side
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(PurplePJ)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "PJ (Custos Moto / MEI)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$pjPercent% • ${formatCurrency(pjExpense)}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = PurplePJ
                    )
                }

                // PF Side
                Column(horizontalAlignment = Alignment.End) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(EmeraldLight)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "PF (Casa / Pessoal)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$pfPercent% • ${formatCurrency(pfExpense)}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldLight
                    )
                }
            }
        }
    }
}

@Composable
fun CategoryBreakdownList(
    transactions: List<TransactionEntity>,
    isExpense: Boolean,
    modifier: Modifier = Modifier
) {
    val filtered = transactions.filter { if (isExpense) it.type == "EXPENSE" else it.type == "INCOME" }
    val totalAmount = filtered.sumOf { it.amount }

    val categoryGroups = filtered
        .groupBy { it.category }
        .map { (cat, list) ->
            val sum = list.sumOf { it.amount }
            val percent = if (totalAmount > 0) (sum / totalAmount * 100).toFloat() else 0f
            Triple(cat, sum, percent)
        }
        .sortedByDescending { it.second }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = if (isExpense) "Detalhamento de Despesas por Categoria" else "Detalhamento de Receitas por Categoria",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            if (categoryGroups.isEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Nenhum lançamento no período selecionado.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                Spacer(modifier = Modifier.height(12.dp))

                categoryGroups.forEach { (categoryName, sum, percent) ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.surfaceVariant),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = getCategoryIcon("", categoryName),
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = categoryName,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = formatCurrency(sum),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isExpense) RedExpense else EmeraldLight
                                )
                                Text(
                                    text = "${String.format(java.util.Locale.US, "%.1f", percent)}%",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        // Category Bar
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth(fraction = (percent / 100f).coerceIn(0.01f, 1f))
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(if (isExpense) RedExpense else EmeraldLight)
                            )
                        }
                    }
                }
            }
        }
    }
}
