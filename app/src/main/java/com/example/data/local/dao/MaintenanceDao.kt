package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.MaintenanceItemEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MaintenanceDao {
    @Query("SELECT * FROM maintenance_items ORDER BY id ASC")
    fun getAllMaintenanceItemsFlow(): Flow<List<MaintenanceItemEntity>>

    @Query("SELECT * FROM maintenance_items ORDER BY id ASC")
    suspend fun getAllMaintenanceItems(): List<MaintenanceItemEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItem(item: MaintenanceItemEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<MaintenanceItemEntity>)

    @Update
    suspend fun updateItem(item: MaintenanceItemEntity)

    @Delete
    suspend fun deleteItem(item: MaintenanceItemEntity)

    @Query("DELETE FROM maintenance_items WHERE id = :id")
    suspend fun deleteById(id: Long)
}
