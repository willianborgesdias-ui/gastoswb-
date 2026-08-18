package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.DirectionsBike
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.UserAccount
import com.example.ui.theme.PolishDarkBackground
import com.example.ui.theme.PolishDarkBorder
import com.example.ui.theme.PolishDarkCardSurface
import com.example.ui.theme.PolishDeepPurpleOnPrimary
import com.example.ui.theme.PolishExpenseRed
import com.example.ui.theme.PolishMediumPurpleContainer
import com.example.ui.theme.PolishPurplePrimary
import com.example.ui.viewmodel.FinancialMetrics

@Composable
fun MotoDashboardSection(
    user: UserAccount?,
    metrics: FinancialMetrics,
    onUpdateKmClick: () -> Unit,
    onOpenMaintenanceHub: () -> Unit,
    onRecordOilChangeClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val currentKm = user?.currentKm ?: 24500
    val lastOilKm = user?.lastOilChangeKm ?: 24000
    val intervalKm = user?.oilChangeIntervalKm ?: 1000
    val nextOilKm = lastOilKm + intervalKm
    val kmSinceLastOil = (currentKm - lastOilKm).coerceAtLeast(0)
    val kmRemaining = nextOilKm - currentKm

    val progress = (kmSinceLastOil.toFloat() / intervalKm.toFloat()).coerceIn(0f, 1f)
    val isOverdue = currentKm >= nextOilKm
    val isWarning = kmRemaining in 1..200

    val statusColor = when {
        isOverdue -> PolishExpenseRed
        isWarning -> Color(0xFFFFD54F)
        else -> PolishPurplePrimary
    }

    val badgeBg = when {
        isOverdue -> PolishExpenseRed.copy(alpha = 0.2f)
        isWarning -> Color(0xFFFFD54F).copy(alpha = 0.2f)
        else -> PolishDeepPurpleOnPrimary
    }

    val badgeText = when {
        isOverdue -> "Vencido há ${-kmRemaining}km"
        isWarning -> "Faltam ${kmRemaining}km"
        else -> "Faltam ${kmRemaining}km"
    }

    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Section Title & KM Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "MANUTENÇÃO DA MOTO",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = PolishPurplePrimary,
                letterSpacing = 1.sp
            )

            // Current KM Pill Button
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(PolishDarkCardSurface)
                    .border(1.dp, PolishDarkBorder, RoundedCornerShape(8.dp))
                    .clickable { onUpdateKmClick() }
                    .padding(horizontal = 8.dp, vertical = 4.dp)
                    .testTag("update_km_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Speed,
                    contentDescription = "KM",
                    tint = PolishPurplePrimary,
                    modifier = Modifier.size(13.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "$currentKm km",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.Default.Edit,
                    contentDescription = "Editar",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(12.dp)
                )
            }
        }

        // Maintenance Indicator Card (Design HTML spec: bg-[#2B2930] rounded-2xl p-4 border border-[#49454F])
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, PolishDarkBorder, RoundedCornerShape(20.dp)),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = PolishDarkCardSurface
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Header of card
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Troca de Óleo",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(badgeBg)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = badgeText,
                            color = statusColor,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Progress Bar and Counter (Design spec: bg-[#1C1B1F] h-2.5 rounded-full overflow-hidden)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .weight(1f)
                            .height(10.dp)
                            .clip(RoundedCornerShape(5.dp)),
                        color = statusColor,
                        trackColor = PolishDarkBackground
                    )

                    Text(
                        text = "$kmSinceLastOil/${intervalKm}km",
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = if (isOverdue) "Atenção: Limite de quilometragem atingido. Troque o óleo da moto." else "Próxima troca recomendada ao atingir $nextOilKm km.",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Quick Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onOpenMaintenanceHub,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("full_maintenance_btn"),
                        shape = RoundedCornerShape(10.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, PolishDarkBorder)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Build,
                            contentDescription = null,
                            tint = PolishPurplePrimary,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Histórico",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Button(
                        onClick = onRecordOilChangeClick,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("quick_oil_change_btn"),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PolishMediumPurpleContainer,
                            contentColor = PolishPurplePrimary
                        )
                    ) {
                        Text(
                            text = "Trocar Óleo",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Fuel Efficiency Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, PolishDarkBorder, RoundedCornerShape(18.dp)),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = PolishDarkCardSurface),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(PolishDeepPurpleOnPrimary),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalGasStation,
                            contentDescription = "Combustível",
                            tint = PolishPurplePrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Combustível no Período",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = formatCurrency(metrics.fuelExpense),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    val percentStr = String.format(java.util.Locale.US, "%.1f", metrics.fuelPercentageOfIncome)
                    Text(
                        text = "$percentStr%",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (metrics.fuelPercentageOfIncome > 25.0) PolishExpenseRed else PolishPurplePrimary
                    )
                    Text(
                        text = "do faturamento",
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
