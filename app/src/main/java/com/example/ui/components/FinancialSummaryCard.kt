package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.PolishDarkBorder
import com.example.ui.theme.PolishDarkCardSurface
import com.example.ui.theme.PolishDeepPurpleOnPrimary
import com.example.ui.theme.PolishExpenseRed
import com.example.ui.theme.PolishHeroCardBackground
import com.example.ui.theme.PolishHeroCardText
import com.example.ui.theme.PolishMediumPurpleContainer
import com.example.ui.theme.PolishPurplePrimary
import com.example.ui.viewmodel.AccountScopeFilter
import com.example.ui.viewmodel.FinancialMetrics

@Composable
fun FinancialSummaryCards(
    metrics: FinancialMetrics,
    scope: AccountScopeFilter,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Hero Balance Card - "Professional Polish" Aesthetic (Lavender Card with Deep Purple Accents & 28dp radius)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(28.dp),
            colors = CardDefaults.cardColors(
                containerColor = PolishHeroCardBackground
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(22.dp)
            ) {
                // Header & Scope Pill
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = when (scope) {
                            AccountScopeFilter.CONSOLIDATED -> "SALDO GERAL CONSOLIDADO"
                            AccountScopeFilter.PF -> "SALDO PESSOAL (PF)"
                            AccountScopeFilter.PJ -> "SALDO PJ (TRABALHO)"
                        },
                        fontSize = 12.sp,
                        color = PolishHeroCardText.copy(alpha = 0.85f),
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(PolishHeroCardText)
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = if (metrics.netBalance >= 0) "LUCRO" else "ATENÇÃO",
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Hero Amount
                Text(
                    text = formatCurrency(metrics.netBalance),
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.ExtraBold,
                    color = PolishHeroCardText,
                    letterSpacing = (-0.5).sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Sub-Row (Ganhos vs Gastos) separated by clean divider
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(1.dp)
                        .background(PolishHeroCardText.copy(alpha = 0.2f))
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Ganhos Column
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "GANHOS",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = PolishHeroCardText.copy(alpha = 0.7f),
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = formatCurrency(metrics.totalIncome),
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = PolishHeroCardText
                        )
                    }

                    // Gastos Column
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "GASTOS",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = PolishHeroCardText.copy(alpha = 0.7f),
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = formatCurrency(metrics.totalExpense),
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = PolishHeroCardText
                        )
                    }
                }
            }
        }

        // Secondary Info Strip
        if (scope == AccountScopeFilter.PJ && metrics.pjIncome > 0) {
            val margin = ((metrics.netBalance / metrics.pjIncome) * 100).toInt()
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, PolishDarkBorder, RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = PolishDarkCardSurface
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.TrendingUp,
                            contentDescription = null,
                            tint = PolishPurplePrimary,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Margem de Lucro nas Corridas",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    Text(
                        text = "$margin%",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = PolishPurplePrimary
                    )
                }
            }
        }
    }
}
