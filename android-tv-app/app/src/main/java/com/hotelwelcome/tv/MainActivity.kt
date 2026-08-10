package com.hotelwelcome.tv

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast

/**
 * Full-screen kiosk WebView pointed at the hotel's welcome screen web app
 * for this specific room. This is the only screen guests ever see; staff
 * reach [SetupActivity] via a long-press on the remote's Back button.
 */
class MainActivity : Activity() {

    private lateinit var webView: WebView
    private val retryHandler = Handler(Looper.getMainLooper())
    private var retryRunnable: Runnable? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val roomNumber = Prefs.getRoomNumber(this)
        if (roomNumber.isNullOrBlank()) {
            startActivity(Intent(this, SetupActivity::class.java))
            finish()
            return
        }

        webView = WebView(this)
        setContentView(webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            mediaPlaybackRequiresUserGesture = false
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                if (url.startsWith("intent://") || url.startsWith("market://")) {
                    launchNativeIntent(url)
                    return true
                }
                return false
            }

            override fun onPageFinished(view: WebView, url: String?) {
                cancelRetry()
            }

            override fun onReceivedError(
                view: WebView,
                request: WebResourceRequest,
                error: WebResourceError,
            ) {
                // Only care about the main page failing to load, not a
                // missing sub-resource. Retry - this covers the TV booting
                // and grabbing the WebView before Wi-Fi has come up yet.
                if (request.isForMainFrame) scheduleRetry()
            }
        }

        loadWelcomeScreen(roomNumber)
    }

    private fun loadWelcomeScreen(roomNumber: String) {
        val url = BuildConfig.WELCOME_SCREEN_BASE_URL.trimEnd('/') + "/tv/" + Uri.encode(roomNumber)
        webView.loadUrl(url)
    }

    private fun scheduleRetry() {
        cancelRetry()
        val runnable = Runnable {
            val roomNumber = Prefs.getRoomNumber(this)
            if (!roomNumber.isNullOrBlank()) loadWelcomeScreen(roomNumber)
        }
        retryRunnable = runnable
        retryHandler.postDelayed(runnable, RETRY_DELAY_MS)
    }

    private fun cancelRetry() {
        retryRunnable?.let { retryHandler.removeCallbacks(it) }
        retryRunnable = null
    }

    /**
     * The welcome screen's "Watch Live TV" button navigates to an
     * `intent://` URL (see web/components/tv/WatchLiveTvButton.tsx), which
     * is how a web page hands off to a native Android app. Parse it and
     * start the target app (Hulu), falling back to its Play Store listing
     * if it isn't installed.
     */
    private fun launchNativeIntent(url: String) {
        val intent = try {
            if (url.startsWith("intent://")) {
                Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
            } else {
                Intent(Intent.ACTION_VIEW, Uri.parse(url))
            }
        } catch (e: Exception) {
            null
        } ?: return

        try {
            startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            val targetPackage = intent.getPackage()
            if (targetPackage != null) {
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$targetPackage")))
                    return
                } catch (e2: ActivityNotFoundException) {
                    // Fall through to the toast below.
                }
            }
            Toast.makeText(this, "That app isn't installed on this TV.", Toast.LENGTH_LONG).show()
        }
    }

    /** Staff-only: long-press Back on the remote to reconfigure this TV's room number. */
    override fun onKeyLongPress(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            startActivity(Intent(this, SetupActivity::class.java))
            return true
        }
        return super.onKeyLongPress(keyCode, event)
    }

    override fun onDestroy() {
        cancelRetry()
        webView.destroy()
        super.onDestroy()
    }

    companion object {
        private const val RETRY_DELAY_MS = 5000L
    }
}
