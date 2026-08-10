package com.hotelwelcome.tv

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast

/**
 * First-run (and staff-triggered, via long-press Back in MainActivity)
 * screen where a room number is typed in using the TV remote's D-pad and
 * the on-screen keyboard Android shows for a focused EditText.
 */
class SetupActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_setup)

        val input = findViewById<EditText>(R.id.roomNumberInput)
        input.setText(Prefs.getRoomNumber(this).orEmpty())

        findViewById<Button>(R.id.saveButton).setOnClickListener {
            val roomNumber = input.text.toString().trim()
            if (roomNumber.isEmpty()) {
                Toast.makeText(this, R.string.setup_error_empty, Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            Prefs.setRoomNumber(this, roomNumber)
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }

        input.requestFocus()
    }
}
