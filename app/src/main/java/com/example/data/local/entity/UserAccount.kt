package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_account")
data class UserAccount(
    @PrimaryKey val id: Int = 1,
    val username: String = "admin",
    val passwordHash: String = "admin",
    val fullName: String = "Entregador Autônomo",
    val vehicleModel: String = "Honda CG 160 Fan",
    val vehiclePlate: String = "BRA-2E19",
    val currentKm: Int = 24500,
    val oilChangeIntervalKm: Int = 1000,
    val lastOilChangeKm: Int = 24000,
    val isDarkMode: Boolean = true,
    val isLoggedIn: Boolean = false
)
