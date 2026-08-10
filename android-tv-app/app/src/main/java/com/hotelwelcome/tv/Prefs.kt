package com.hotelwelcome.tv

import android.content.Context

/** Tiny SharedPreferences wrapper storing which room number this TV belongs to. */
object Prefs {
    private const val PREFS_NAME = "welcome_screen_prefs"
    private const val KEY_ROOM_NUMBER = "room_number"

    fun getRoomNumber(context: Context): String? =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_ROOM_NUMBER, null)

    fun setRoomNumber(context: Context, roomNumber: String) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_ROOM_NUMBER, roomNumber)
            .apply()
    }
}
