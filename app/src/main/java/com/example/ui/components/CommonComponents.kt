package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Celebration
import androidx.compose.material.icons.filled.Checkroom
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.DirectionsBike
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.LocalPharmacy
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.Paid
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material.icons.filled.SportsMotorsports
import androidx.compose.material.icons.filled.TwoWheeler
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.PolishDarkCardSurface
import com.example.ui.theme.PolishDeepPurpleOnPrimary
import com.example.ui.theme.PolishMediumPurpleContainer
import com.example.ui.theme.PolishPurplePrimary
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

val PtBrLocale = Locale("pt", "BR")
val CurrencyFormatter = NumberFormat.getCurrencyInstance(PtBrLocale)
val DateFormatter = SimpleDateFormat("dd/MM/yyyy", PtBrLocale)
val ShortDateFormatter = SimpleDateFormat("dd 'de' MMM", PtBrLocale)
val MonthYearFormatter = SimpleDateFormat("MMMM yyyy", PtBrLocale)

fun formatCurrency(amount: Double): String {
    return CurrencyFormatter.format(amount)
}

fun formatDate(timeMillis: Long): String {
    return DateFormatter.format(Date(timeMillis))
}

fun formatShortDate(timeMillis: Long): String {
    return ShortDateFormatter.format(Date(timeMillis))
}

fun getCategoryIcon(iconName: String, categoryName: String): ImageVector {
    val name = (iconName + categoryName).lowercase(PtBrLocale)
    return when {
        name.contains("combustível") || name.contains("gasolina") || name.contains("posto") -> Icons.Default.LocalGasStation
        name.contains("óleo") || name.contains("oil") -> Icons.Default.Build
        name.contains("manutenção") || name.contains("peça") || name.contains("oficina") -> Icons.Default.Build
        name.contains("alimentação em serviço") || name.contains("refeição") || name.contains("almoço") -> Icons.Default.Restaurant
        name.contains("mei") || name.contains("das") || name.contains("imposto") || name.contains("tributo") -> Icons.Default.ReceiptLong
        name.contains("equipamento") || name.contains("acessório") || name.contains("capacete") || name.contains("baú") -> Icons.Default.SportsMotorsports
        name.contains("ipva") || name.contains("licenciamento") || name.contains("multa") -> Icons.Default.DirectionsBike
        name.contains("celular") || name.contains("internet") || name.contains("plano") -> Icons.Default.Smartphone
        name.contains("faturamento") || name.contains("corrida") || name.contains("entrega") || name.contains("ifood") -> Icons.Default.TwoWheeler
        name.contains("particular") || name.contains("frete") -> Icons.Default.LocalShipping
        name.contains("gorjeta") -> Icons.Default.MonetizationOn
        name.contains("supermercado") || name.contains("mercado") || name.contains("compras") -> Icons.Default.ShoppingCart
        name.contains("moradia") || name.contains("aluguel") || name.contains("condomínio") -> Icons.Default.Home
        name.contains("conta") || name.contains("luz") || name.contains("água") || name.contains("energia") -> Icons.Default.Bolt
        name.contains("saúde") || name.contains("farmácia") || name.contains("médico") -> Icons.Default.LocalPharmacy
        name.contains("lazer") || name.contains("festa") || name.contains("família") -> Icons.Default.Celebration
        name.contains("cartão") || name.contains("crédito") -> Icons.Default.CreditCard
        name.contains("educação") || name.contains("curso") -> Icons.Default.School
        name.contains("vestuário") || name.contains("roupa") -> Icons.Default.Checkroom
        name.contains("pró-labore") || name.contains("salário") || name.contains("retirada") -> Icons.Default.AccountBalanceWallet
        name.contains("renda extra") || name.contains("bico") -> Icons.Default.Paid
        name.contains("poupança") || name.contains("investimento") -> Icons.Default.Savings
        else -> Icons.Default.Category
    }
}

fun getPaymentMethodLabel(method: String): String {
    return when (method.uppercase()) {
        "PIX" -> "Pix"
        "DINHEIRO" -> "Dinheiro"
        "CARTAO_CREDITO" -> "Cartão Crédito"
        "CARTAO_DEBITO" -> "Cartão Débito"
        else -> method
    }
}

@Composable
fun ScopeBadge(
    scope: String,
    modifier: Modifier = Modifier
) {
    val isPj = scope.uppercase() == "PJ"
    val bgColor = if (isPj) PolishDeepPurpleOnPrimary else PolishMediumPurpleContainer
    val textColor = PolishPurplePrimary
    val label = if (isPj) "PJ" else "PF"

    Box(
        modifier = modifier
            .background(bgColor, RoundedCornerShape(6.dp))
            .padding(horizontal = 7.dp, vertical = 2.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun PaymentMethodChip(
    method: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .background(PolishDarkCardSurface, RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(
            text = getPaymentMethodLabel(method),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 10.sp,
            fontWeight = FontWeight.Medium
        )
    }
}
