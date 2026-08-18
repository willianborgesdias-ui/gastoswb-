package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val amount: Double,
    val type: String, // "INCOME" or "EXPENSE"
    val scope: String, // "PF" or "PJ"
    val category: String,
    val date: Long = System.currentTimeMillis(),
    val paymentMethod: String = "PIX", // "PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO"
    val notes: String = "",
    val vehicleKm: Int? = null,
    val fuelLiters: Double? = null
)
