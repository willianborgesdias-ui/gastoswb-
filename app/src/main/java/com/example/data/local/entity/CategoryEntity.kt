package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val scope: String, // "PF", "PJ", or "BOTH"
    val type: String, // "INCOME", "EXPENSE", or "BOTH"
    val iconName: String = "category",
    val colorHex: String = "#10B981",
    val isDefault: Boolean = false
)
