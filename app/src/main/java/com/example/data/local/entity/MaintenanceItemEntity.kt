package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "maintenance_items")
data class MaintenanceItemEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val intervalKm: Int,
    val lastPerformedKm: Int,
    val lastPerformedDate: Long = System.currentTimeMillis(),
    val cost: Double = 0.0,
    val notes: String = ""
) {
    val nextDueKm: Int
        get() = lastPerformedKm + intervalKm
}
