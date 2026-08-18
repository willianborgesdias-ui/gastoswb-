package com.example.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.TwoWheeler
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.UserAccount
import com.example.ui.theme.PolishDarkBackground
import com.example.ui.theme.PolishDarkCardSurface
import com.example.ui.theme.PolishDeepPurpleOnPrimary
import com.example.ui.theme.PolishMediumPurpleContainer
import com.example.ui.theme.PolishPurplePrimary
import com.example.ui.viewmodel.AccountScopeFilter
import com.example.ui.viewmodel.PeriodFilter

@Composable
fun TopHeader(
    user: UserAccount?,
    selectedScope: AccountScopeFilter,
    onScopeSelected: (AccountScopeFilter) -> Unit,
    selectedPeriod: PeriodFilter,
    onPeriodSelected: (PeriodFilter) -> Unit,
    isDarkMode: Boolean,
    onToggleDarkMode: () -> Unit,
    onOpenProfile: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        color = PolishDarkBackground,
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // Header Bar: Avatar + Name + Settings
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Avatar Pill (w-10 h-10 rounded-full bg-[#4F378B] text-[#D0BCFF])
                    val initials = user?.fullName?.split(" ")?.take(2)?.mapNotNull { it.firstOrNull()?.toString() }?.joinToString("") ?: "MB"
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(PolishMediumPurpleContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = initials.ifEmpty { "MB" },
                            fontWeight = FontWeight.Bold,
                            color = PolishPurplePrimary,
                            fontSize = 15.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Olá, ${user?.vehicleModel?.ifEmpty { "Autônomo" } ?: "Autônomo"}",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                        )
                        Text(
                            text = user?.fullName ?: "Carlos da Silva",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Theme Switch Button
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(PolishDarkCardSurface)
                            .clickable { onToggleDarkMode() }
                            .testTag("theme_toggle_button"),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                            contentDescription = "Alternar Tema",
                            tint = PolishPurplePrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    // Profile / Settings Button (bg-[#2B2930] rounded-full)
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(PolishDarkCardSurface)
                            .clickable { onOpenProfile() }
                            .testTag("profile_button"),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Configurações",
                            tint = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // View Selector Tabs (bg-[#2B2930] rounded-full p-1)
            ScopeSelector(
                selectedScope = selectedScope,
                onScopeSelected = onScopeSelected
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Period Filter Scrollable Chips
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(PeriodFilter.values()) { period ->
                    val isSelected = selectedPeriod == period
                    FilterChip(
                        selected = isSelected,
                        onClick = { onPeriodSelected(period) },
                        label = {
                            Text(
                                text = period.label,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PolishMediumPurpleContainer,
                            selectedLabelColor = PolishPurplePrimary,
                            containerColor = PolishDarkCardSurface
                        ),
                        border = null,
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.testTag("period_chip_${period.name.lowercase()}")
                    )
                }
            }
        }
    }
}

@Composable
fun ScopeSelector(
    selectedScope: AccountScopeFilter,
    onScopeSelected: (AccountScopeFilter) -> Unit,
    modifier: Modifier = Modifier
) {
    // Professional Polish Tab Switcher: Container bg-[#2B2930] rounded-full with active tab bg-[#4F378B] text-[#D0BCFF]
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(30.dp))
            .background(PolishDarkCardSurface)
            .padding(4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            AccountScopeFilter.values().forEach { scope ->
                val isSelected = selectedScope == scope

                val targetBgColor = if (isSelected) PolishMediumPurpleContainer else Color.Transparent
                val targetTextColor = if (isSelected) PolishPurplePrimary else MaterialTheme.colorScheme.onSurfaceVariant

                val animatedBg by animateColorAsState(targetValue = targetBgColor, label = "scopeBg")

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(24.dp))
                        .background(animatedBg)
                        .clickable { onScopeSelected(scope) }
                        .padding(vertical = 8.dp)
                        .testTag("scope_btn_${scope.name.lowercase()}"),
                    contentAlignment = Alignment.Center
                ) {
                    val label = when (scope) {
                        AccountScopeFilter.PF -> "PF (Pessoal)"
                        AccountScopeFilter.PJ -> "PJ (Trabalho)"
                        AccountScopeFilter.CONSOLIDATED -> "Geral"
                    }
                    Text(
                        text = label,
                        color = targetTextColor,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                    )
                }
            }
        }
    }
}
