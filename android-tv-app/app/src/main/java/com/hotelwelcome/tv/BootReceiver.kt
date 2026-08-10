package com.hotelwelcome.tv

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Relaunches the welcome screen after the TV reboots (e.g. overnight power cycle). */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

        val launchIntent = Intent(context, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(launchIntent)
    }
}
