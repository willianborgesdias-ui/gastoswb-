package com.example.ui.screens

import android.app.DatePickerDialog
import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DirectionsBike
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SheetState
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.CategoryEntity
import com.example.data.local.entity.TransactionEntity
import com.example.ui.components.formatDate
import com.example.ui.components.getCategoryIcon
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.PurplePJ
import com.example.ui.theme.RedExpense
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditTransactionBottomSheet(
    initialTransaction: TransactionEntity? = null,
    defaultType: String = "EXPENSE",
    defaultScope: String = "PJ",
    categories: List<CategoryEntity>,
    onDismiss: () -> Unit,
    onSave: (TransactionEntity) -> Unit,
    sheetState: SheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
) {
    val context = LocalContext.current

    var type by remember { mutableStateOf(initialTransaction?.type ?: defaultType) }
    var scope by remember { mutableStateOf(initialTransaction?.scope ?: defaultScope) }
    var title by remember { mutableStateOf(initialTransaction?.title ?: "") }
    var amountText by remember {
        mutableStateOf(if (initialTransaction != null) String.format(java.util.Locale.US, "%.2f", initialTransaction.amount) else "")
    }

    val availableCategories = categories.filter {
        (it.scope == scope || it.scope == "BOTH") &&
                (it.type == type || it.type == "BOTH")
    }

    var selectedCategory by remember {
        mutableStateOf(initialTransaction?.category ?: availableCategories.firstOrNull()?.name ?: "Outros")
    }

    var categoryDropdownExpanded by remember { mutableStateOf(false) }
    var selectedDate by remember { mutableLongStateOf(initialTransaction?.date ?: System.currentTimeMillis()) }
    var paymentMethod by remember { mutableStateOf(initialTransaction?.paymentMethod ?: "PIX") }
    var notes by remember { mutableStateOf(initialTransaction?.notes ?: "") }
    var vehicleKmText by remember { mutableStateOf(initialTransaction?.vehicleKm?.toString() ?: "") }
    var fuelLitersText by remember {
        mutableStateOf(if (initialTransaction?.fuelLiters != null) String.format(java.util.Locale.US, "%.2f", initialTransaction.fuelLiters) else "")
    }

    var titleError by remember { mutableStateOf(false) }
    var amountError by remember { mutableStateOf(false) }

    // DatePicker dialog
    val calendar = Calendar.getInstance().apply { timeInMillis = selectedDate }
    val datePickerDialog = DatePickerDialog(
        context,
        { _, year, month, dayOfMonth ->
            val cal = Calendar.getInstance()
            cal.set(year, month, dayOfMonth)
            selectedDate = cal.timeInMillis
        },
        calendar.get(Calendar.YEAR),
        calendar.get(Calendar.MONTH),
        calendar.get(Calendar.DAY_OF_MONTH)
    )

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (initialTransaction == null) "Novo Lançamento" else "Editar Lançamento",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Fechar",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // 1. Type Switcher: Entrada (Receita) vs Saída (Despesa)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(4.dp)
            ) {
                // Despesa (Saída)
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (type == "EXPENSE") RedExpense else Color.Transparent)
                        .clickable {
                            type = "EXPENSE"
                            // adjust default category if needed
                            val newCats = categories.filter { (it.scope == scope || it.scope == "BOTH") && (it.type == "EXPENSE" || it.type == "BOTH") }
                            if (newCats.none { it.name == selectedCategory }) {
                                selectedCategory = newCats.firstOrNull()?.name ?: "Outros"
                            }
                        }
                        .padding(vertical = 10.dp)
                        .testTag("type_expense_btn"),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "- Saída (Despesa)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = if (type == "EXPENSE") Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Receita (Entrada)
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (type == "INCOME") EmeraldLight else Color.Transparent)
                        .clickable {
                            type = "INCOME"
                            val newCats = categories.filter { (it.scope == scope || it.scope == "BOTH") && (it.type == "INCOME" || it.type == "BOTH") }
                            if (newCats.none { it.name == selectedCategory }) {
                                selectedCategory = newCats.firstOrNull()?.name ?: "Faturamento / Corridas (Apps)"
                            }
                        }
                        .padding(vertical = 10.dp)
                        .testTag("type_income_btn"),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "+ Entrada (Receita)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = if (type == "INCOME") Color(0xFF090D16) else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // 2. Scope Switcher: PF vs PJ
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(4.dp)
            ) {
                // PJ
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (scope == "PJ") MaterialTheme.colorScheme.primary else Color.Transparent)
                        .clickable {
                            scope = "PJ"
                            val newCats = categories.filter { (it.scope == "PJ" || it.scope == "BOTH") && (it.type == type || it.type == "BOTH") }
                            if (newCats.none { it.name == selectedCategory }) {
                                selectedCategory = newCats.firstOrNull()?.name ?: "Combustível"
                            }
                        }
                        .padding(vertical = 8.dp)
                        .testTag("scope_pj_btn"),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "PJ • Trabalho / Moto",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp,
                        color = if (scope == "PJ") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // PF
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (scope == "PF") PurplePJ else Color.Transparent)
                        .clickable {
                            scope = "PF"
                            val newCats = categories.filter { (it.scope == "PF" || it.scope == "BOTH") && (it.type == type || it.type == "BOTH") }
                            if (newCats.none { it.name == selectedCategory }) {
                                selectedCategory = newCats.firstOrNull()?.name ?: "Alimentação Casa"
                            }
                        }
                        .padding(vertical = 8.dp)
                        .testTag("scope_pf_btn"),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "PF • Pessoal / Casa",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp,
                        color = if (scope == "PF") Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // 3. Amount Field (R$)
            OutlinedTextField(
                value = amountText,
                onValueChange = {
                    amountText = it.replace(",", ".")
                    amountError = false
                },
                label = { Text("Valor (R$) *") },
                placeholder = { Text("0,00") },
                prefix = { Text("R$ ", fontWeight = FontWeight.Bold) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                isError = amountError,
                supportingText = if (amountError) { { Text("Informe um valor maior que zero", color = MaterialTheme.colorScheme.error) } } else null,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("transaction_amount_field")
            )

            // 4. Description / Title
            OutlinedTextField(
                value = title,
                onValueChange = {
                    title = it
                    titleError = false
                },
                label = { Text("Descrição / Título *") },
                placeholder = {
                    Text(
                        if (type == "INCOME") "Ex: Faturamento semana iFood, Corrida particular"
                        else "Ex: Abastecimento Posto BR, Troca de óleo, Supermercado"
                    )
                },
                singleLine = true,
                isError = titleError,
                supportingText = if (titleError) { { Text("A descrição é obrigatória", color = MaterialTheme.colorScheme.error) } } else null,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("transaction_title_field")
            )

            // 5. Category Selector
            ExposedDropdownMenuBox(
                expanded = categoryDropdownExpanded,
                onExpandedChange = { categoryDropdownExpanded = !categoryDropdownExpanded },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = selectedCategory,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Categoria") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryDropdownExpanded) },
                    leadingIcon = {
                        Icon(
                            imageVector = getCategoryIcon("", selectedCategory),
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                    },
                    modifier = Modifier
                        .menuAnchor()
                        .fillMaxWidth()
                        .testTag("category_dropdown")
                )

                ExposedDropdownMenu(
                    expanded = categoryDropdownExpanded,
                    onDismissRequest = { categoryDropdownExpanded = false }
                ) {
                    val currentList = categories.filter {
                        (it.scope == scope || it.scope == "BOTH") &&
                                (it.type == type || it.type == "BOTH")
                    }
                    currentList.forEach { cat ->
                        DropdownMenuItem(
                            text = {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = getCategoryIcon(cat.iconName, cat.name),
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(cat.name)
                                }
                            },
                            onClick = {
                                selectedCategory = cat.name
                                categoryDropdownExpanded = false
                            }
                        )
                    }
                }
            }

            // 6. Date & Payment Method Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Date Picker Button
                OutlinedTextField(
                    value = formatDate(selectedDate),
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Data") },
                    trailingIcon = {
                        IconButton(onClick = { datePickerDialog.show() }) {
                            Icon(
                                imageVector = Icons.Default.CalendarToday,
                                contentDescription = "Selecionar Data",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    },
                    modifier = Modifier
                        .weight(1f)
                        .clickable { datePickerDialog.show() }
                )
            }

            // 7. Payment Method Selector Chips
            Column {
                Text(
                    text = "Método de Pagamento",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf("PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO").forEach { method ->
                        val isSel = paymentMethod == method
                        FilterChip(
                            selected = isSel,
                            onClick = { paymentMethod = method },
                            label = {
                                Text(
                                    text = when (method) {
                                        "PIX" -> "Pix"
                                        "DINHEIRO" -> "Dinheiro"
                                        "CARTAO_CREDITO" -> "Crédito"
                                        "CARTAO_DEBITO" -> "Débito"
                                        else -> method
                                    },
                                    fontSize = 11.sp
                                )
                            },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            // 8. Specific Motorcycle / Vehicle inputs if PJ & (Combustível or Manutenção or Óleo)
            val isVehicleExpense = scope == "PJ" && (
                    selectedCategory.contains("Combustível", ignoreCase = true) ||
                            selectedCategory.contains("Óleo", ignoreCase = true) ||
                            selectedCategory.contains("Manutenção", ignoreCase = true)
                    )

            AnimatedVisibility(visible = isVehicleExpense) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.DirectionsBike,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Dados do Veículo (Opcional para cálculo de consumo e alertas)",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = vehicleKmText,
                            onValueChange = { vehicleKmText = it.filter { c -> c.isDigit() } },
                            label = { Text("KM do Odômetro") },
                            placeholder = { Text("Ex: 24850") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f)
                        )

                        if (selectedCategory.contains("Combustível", ignoreCase = true)) {
                            OutlinedTextField(
                                value = fuelLitersText,
                                onValueChange = { fuelLitersText = it.replace(",", ".") },
                                label = { Text("Litros") },
                                placeholder = { Text("Ex: 11.2") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }
            }

            // 9. Observações / Detalhes
            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("Observação / Local (Opcional)") },
                placeholder = { Text("Ex: Oficina do Zé, 10w30 semi-sintético, taxa de aplicativo") },
                maxLines = 2,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Save Button
            Button(
                onClick = {
                    val amountVal = amountText.toDoubleOrNull()
                    if (title.isBlank()) {
                        titleError = true
                    }
                    if (amountVal == null || amountVal <= 0.0) {
                        amountError = true
                    }

                    if (title.isNotBlank() && amountVal != null && amountVal > 0.0) {
                        val transaction = TransactionEntity(
                            id = initialTransaction?.id ?: 0L,
                            title = title.trim(),
                            amount = amountVal,
                            type = type,
                            scope = scope,
                            category = selectedCategory,
                            date = selectedDate,
                            paymentMethod = paymentMethod,
                            notes = notes.trim(),
                            vehicleKm = vehicleKmText.toIntOrNull(),
                            fuelLiters = fuelLitersText.toDoubleOrNull()
                        )
                        onSave(transaction)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("save_transaction_button"),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (type == "INCOME") EmeraldLight else RedExpense
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = null,
                    tint = if (type == "INCOME") Color(0xFF090D16) else Color.White
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (initialTransaction == null) "Cadastrar Transação" else "Salvar Alterações",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = if (type == "INCOME") Color(0xFF090D16) else Color.White
                )
            }
        }
    }
}
