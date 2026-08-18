package com.example.ui.screens

import android.app.DatePickerDialog
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.TableChart
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.TransactionEntity
import com.example.data.local.entity.UserAccount
import com.example.ui.components.CategoryBreakdownList
import com.example.ui.components.ComparativePfPjChart
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatDate
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.RedExpense
import com.example.ui.viewmodel.FinancialMetrics
import com.example.ui.viewmodel.PeriodFilter
import java.util.Calendar

@Composable
fun ReportsScreen(
    user: UserAccount?,
    metrics: FinancialMetrics,
    transactions: List<TransactionEntity>,
    selectedPeriod: PeriodFilter,
    onPeriodSelected: (PeriodFilter) -> Unit,
    customStartDate: Long,
    customEndDate: Long,
    onCustomRangeSelected: (Long, Long) -> Unit,
    onExportPdf: () -> Unit,
    onExportCsv: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    // Date pickers for custom range
    var showCustomRangePicker by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 16.dp, vertical = 14.dp)
        ) {
            Text(
                text = "Relatórios & Análise Financeira",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Visão comparativa de receitas, despesas e exportação de extratos",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Period Selector Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    PeriodFilter.CURRENT_MONTH,
                    PeriodFilter.PREVIOUS_MONTH,
                    PeriodFilter.CUSTOM,
                    PeriodFilter.ALL
                ).forEach { period ->
                    val isSel = selectedPeriod == period
                    FilterChip(
                        selected = isSel,
                        onClick = {
                            if (period == PeriodFilter.CUSTOM) {
                                val cal = Calendar.getInstance()
                                DatePickerDialog(
                                    context,
                                    { _, y1, m1, d1 ->
                                        val startCal = Calendar.getInstance().apply { set(y1, m1, d1, 0, 0, 0) }
                                        DatePickerDialog(
                                            context,
                                            { _, y2, m2, d2 ->
                                                val endCal = Calendar.getInstance().apply { set(y2, m2, d2, 23, 59, 59) }
                                                onCustomRangeSelected(startCal.timeInMillis, endCal.timeInMillis)
                                            },
                                            cal.get(Calendar.YEAR),
                                            cal.get(Calendar.MONTH),
                                            cal.get(Calendar.DAY_OF_MONTH)
                                        ).show()
                                    },
                                    cal.get(Calendar.YEAR),
                                    cal.get(Calendar.MONTH),
                                    1
                                ).show()
                            } else {
                                onPeriodSelected(period)
                            }
                        },
                        label = { Text(period.label, fontSize = 11.sp) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            if (selectedPeriod == PeriodFilter.CUSTOM) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Intervalo: ${formatDate(customStartDate)} até ${formatDate(customEndDate)}",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Scrollable Reports Content
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. Export Action Cards
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Exportar Relatório (${selectedPeriod.label})",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Gere documentos formatados prontos para envio ou arquivamento fiscal MEI.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // PDF Export Button
                            Button(
                                onClick = onExportPdf,
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp)
                                    .testTag("export_pdf_button"),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = Color(0xFF090D16)
                                )
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PictureAsPdf,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Gerar PDF",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }

                            // CSV Export Button
                            OutlinedButton(
                                onClick = onExportCsv,
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp)
                                    .testTag("export_csv_button"),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.TableChart,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Exportar CSV",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }
                }
            }

            // 2. Comparative PF vs PJ Chart Card
            item {
                ComparativePfPjChart(
                    pjExpense = metrics.pjExpense,
                    pfExpense = metrics.pfExpense,
                    pjIncome = metrics.pjIncome,
                    pfIncome = metrics.pfIncome
                )
            }

            // 3. Category Breakdown: Despesas
            item {
                CategoryBreakdownList(
                    transactions = transactions,
                    isExpense = true
                )
            }

            // 4. Category Breakdown: Receitas
            item {
                CategoryBreakdownList(
                    transactions = transactions,
                    isExpense = false
                )
            }

            item {
                Spacer(modifier = Modifier.height(70.dp))
            }
        }
    }
}
