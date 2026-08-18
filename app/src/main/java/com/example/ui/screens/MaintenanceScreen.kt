package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DirectionsBike
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.MaintenanceItemEntity
import com.example.data.local.entity.UserAccount
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatDate
import com.example.ui.theme.AmberAccent
import com.example.ui.theme.AmberContainerDark
import com.example.ui.theme.EmeraldContainerDark
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.RedExpense
import com.example.ui.theme.RedExpenseContainerDark

@Composable
fun MaintenanceScreen(
    user: UserAccount?,
    maintenanceItems: List<MaintenanceItemEntity>,
    onUpdateKmClick: () -> Unit,
    onRecordMaintenance: (MaintenanceItemEntity, Int, Double, String) -> Unit,
    onSaveMaintenanceItem: (MaintenanceItemEntity) -> Unit,
    onDeleteMaintenanceItem: (MaintenanceItemEntity) -> Unit,
    modifier: Modifier = Modifier
) {
    val currentKm = user?.currentKm ?: 24500

    var selectedItemForAction by remember { mutableStateOf<MaintenanceItemEntity?>(null) }
    var showAddItemDialog by remember { mutableStateOf(false) }
    var itemToEdit by remember { mutableStateOf<MaintenanceItemEntity?>(null) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddItemDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color(0xFF090D16),
                modifier = Modifier
                    .padding(bottom = 60.dp)
                    .testTag("add_maintenance_alert_fab")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Novo Alerta de Manutenção")
            }
        },
        modifier = modifier.fillMaxSize()
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Header
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 16.dp, vertical = 14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Manutenção & Cuidados da Moto",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "${user?.vehicleModel ?: "Moto"} • Placa: ${user?.vehiclePlate ?: "N/A"}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // KM Badge with edit button
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(MaterialTheme.colorScheme.primaryContainer)
                            .clickable { onUpdateKmClick() }
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                            .testTag("maintenance_screen_update_km_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Speed,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "$currentKm KM",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            fontSize = 13.sp
                        )
                    }
                }
            }

            // List of Maintenance Cards
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Text(
                        text = "Alertas de Manutenção Preventiva",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                items(maintenanceItems, key = { it.id }) { item ->
                    val kmSinceLast = (currentKm - item.lastPerformedKm).coerceAtLeast(0)
                    val kmRemaining = item.nextDueKm - currentKm
                    val progress = (kmSinceLast.toFloat() / item.intervalKm.toFloat()).coerceIn(0f, 1f)

                    val isOverdue = currentKm >= item.nextDueKm
                    val isWarning = kmRemaining in 1..250

                    val statusColor = when {
                        isOverdue -> RedExpense
                        isWarning -> AmberAccent
                        else -> EmeraldLight
                    }

                    val statusBg = when {
                        isOverdue -> RedExpenseContainerDark
                        isWarning -> AmberContainerDark
                        else -> EmeraldContainerDark
                    }

                    val statusLabel = when {
                        isOverdue -> "VENCIDO (+${currentKm - item.nextDueKm} km)"
                        isWarning -> "ATENÇÃO ($kmRemaining km restantes)"
                        else -> "EM DIA ($kmRemaining km restantes)"
                    }

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = item.title,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = "Intervalo: a cada ${item.intervalKm} km  •  Última: ${item.lastPerformedKm} km (${formatDate(item.lastPerformedDate)})",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(statusBg)
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = statusLabel,
                                        color = statusColor,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.ExtraBold
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Progress Bar
                            LinearProgressIndicator(
                                progress = { progress },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(8.dp)
                                    .clip(RoundedCornerShape(4.dp)),
                                color = statusColor,
                                trackColor = MaterialTheme.colorScheme.surfaceVariant
                            )

                            if (item.notes.isNotBlank()) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "Dica/Obs: ${item.notes}",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Actions Row
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row {
                                    IconButton(
                                        onClick = { itemToEdit = item },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Edit,
                                            contentDescription = "Editar",
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                    IconButton(
                                        onClick = { onDeleteMaintenanceItem(item) },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = "Excluir",
                                            tint = RedExpense.copy(alpha = 0.8f),
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }

                                Button(
                                    onClick = { selectedItemForAction = item },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                                        contentColor = MaterialTheme.colorScheme.primary
                                    ),
                                    modifier = Modifier.testTag("record_service_${item.id}")
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "Registrar Troca",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(70.dp))
                }
            }
        }
    }

    // Dialog: Record Completed Maintenance (Posts PJ Expense automatically)
    if (selectedItemForAction != null) {
        val item = selectedItemForAction!!
        var costText by remember { mutableStateOf(if (item.cost > 0) String.format(java.util.Locale.US, "%.2f", item.cost) else "45.00") }
        var kmText by remember { mutableStateOf(currentKm.toString()) }
        var notesText by remember { mutableStateOf(item.notes) }

        AlertDialog(
            onDismissRequest = { selectedItemForAction = null },
            title = {
                Text(
                    text = "Registrar: ${item.title}",
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Ao confirmar, o odômetro e a data serão atualizados e o valor será lançado automaticamente como Despesa PJ.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    OutlinedTextField(
                        value = kmText,
                        onValueChange = { kmText = it.filter { c -> c.isDigit() } },
                        label = { Text("KM Atual no Momento da Troca") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = costText,
                        onValueChange = { costText = it.replace(",", ".") },
                        label = { Text("Valor Gasto (R$)") },
                        prefix = { Text("R$ ") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = notesText,
                        onValueChange = { notesText = it },
                        label = { Text("Oficina / Marca da Peça / Obs") },
                        maxLines = 2,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val km = kmText.toIntOrNull() ?: currentKm
                        val cost = costText.toDoubleOrNull() ?: 0.0
                        onRecordMaintenance(item, km, cost, notesText.trim())
                        selectedItemForAction = null
                    }
                ) {
                    Text("Confirmar e Lançar")
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { selectedItemForAction = null }) {
                    Text("Cancelar")
                }
            },
            shape = RoundedCornerShape(16.dp)
        )
    }

    // Dialog: Add or Edit Maintenance Alert
    if (showAddItemDialog || itemToEdit != null) {
        val isEditing = itemToEdit != null
        val initial = itemToEdit

        var title by remember { mutableStateOf(initial?.title ?: "") }
        var intervalText by remember { mutableStateOf(initial?.intervalKm?.toString() ?: "1000") }
        var lastKmText by remember { mutableStateOf(initial?.lastPerformedKm?.toString() ?: currentKm.toString()) }
        var notes by remember { mutableStateOf(initial?.notes ?: "") }

        AlertDialog(
            onDismissRequest = {
                showAddItemDialog = false
                itemToEdit = null
            },
            title = {
                Text(
                    text = if (isEditing) "Editar Alerta" else "Novo Alerta de Manutenção",
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Item / Peça (Ex: Troca de Óleo, Pneu)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = intervalText,
                        onValueChange = { intervalText = it.filter { c -> c.isDigit() } },
                        label = { Text("Trocar a cada quantos KM?") },
                        placeholder = { Text("Ex: 1000, 5000, 15000") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = lastKmText,
                        onValueChange = { lastKmText = it.filter { c -> c.isDigit() } },
                        label = { Text("Última troca feita em qual KM?") },
                        placeholder = { Text("Ex: 24000") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Marca recomendada / Observação") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val interval = intervalText.toIntOrNull() ?: 1000
                        val lastKm = lastKmText.toIntOrNull() ?: currentKm
                        if (title.isNotBlank()) {
                            val newItem = MaintenanceItemEntity(
                                id = initial?.id ?: 0L,
                                title = title.trim(),
                                intervalKm = interval,
                                lastPerformedKm = lastKm,
                                lastPerformedDate = initial?.lastPerformedDate ?: System.currentTimeMillis(),
                                cost = initial?.cost ?: 0.0,
                                notes = notes.trim()
                            )
                            onSaveMaintenanceItem(newItem)
                            showAddItemDialog = false
                            itemToEdit = null
                        }
                    }
                ) {
                    Text("Salvar")
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = {
                        showAddItemDialog = false
                        itemToEdit = null
                    }
                ) {
                    Text("Cancelar")
                }
            },
            shape = RoundedCornerShape(16.dp)
        )
    }
}
