package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.UserAccount
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM user_account WHERE id = 1 LIMIT 1")
    fun getUserFlow(): Flow<UserAccount?>

    @Query("SELECT * FROM user_account WHERE id = 1 LIMIT 1")
    suspend fun getUser(): UserAccount?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(user: UserAccount)

    @Update
    suspend fun updateUser(user: UserAccount)

    @Query("UPDATE user_account SET currentKm = :newKm WHERE id = 1")
    suspend fun updateCurrentKm(newKm: Int)

    @Query("UPDATE user_account SET lastOilChangeKm = :km WHERE id = 1")
    suspend fun updateLastOilChangeKm(km: Int)

    @Query("UPDATE user_account SET isDarkMode = :isDark WHERE id = 1")
    suspend fun updateThemeMode(isDark: Boolean)

    @Query("UPDATE user_account SET isLoggedIn = :loggedIn WHERE id = 1")
    suspend fun updateLoginState(loggedIn: Boolean)
}
