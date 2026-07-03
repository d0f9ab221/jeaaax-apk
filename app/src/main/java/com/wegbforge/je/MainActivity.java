package com.wegbforge.je;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;
import android.webkit.PermissionRequest;
import android.webkit.GeolocationPermissions;
import android.webkit.ValueCallback;
import android.os.Build;
import android.content.pm.PackageManager;
import android.net.Uri;

public class MainActivity extends Activity {

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Hide status bar
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        // Hide navigation bar
        int vis = getWindow().getDecorView().getSystemUiVisibility();
        getWindow().getDecorView().setSystemUiVisibility(
            vis | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );


        webView = new WebView(this);
        setContentView(webView);

        // ── Full WebView engine settings ──
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setGeolocationEnabled(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAppCacheEnabled(true);

        webView.setWebViewClient(new WebViewClient());

        // ── WebChromeClient — handles permission requests from web content ──
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;
                return true;
            }
        });

        requestRuntimePermissions();

        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private void requestRuntimePermissions() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;
        String[] perms = {
            "Manifest.permission.CAMERA",
            "Manifest.permission.RECORD_AUDIO",
            "Manifest.permission.ACCESS_FINE_LOCATION",
            "Manifest.permission.ACCESS_COARSE_LOCATION",
            "Manifest.permission.READ_EXTERNAL_STORAGE",
            "Manifest.permission.WRITE_EXTERNAL_STORAGE",
            "Manifest.permission.READ_CONTACTS",
            "Manifest.permission.WRITE_CONTACTS",
            "Manifest.permission.CALL_PHONE",
            "Manifest.permission.READ_PHONE_STATE",
            "Manifest.permission.SEND_SMS",
            "Manifest.permission.READ_SMS",
            "Manifest.permission.READ_CALENDAR",
            "Manifest.permission.WRITE_CALENDAR",
            "Manifest.permission.POST_NOTIFICATIONS",
            "Manifest.permission.USE_BIOMETRIC"
        };
        java.util.List<String> toRequest = new java.util.ArrayList<>();
        for (String p : perms) {
            if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) {
                toRequest.add(p);
            }
        }
        if (!toRequest.isEmpty()) {
            requestPermissions(toRequest.toArray(new String[0]), 100);
        }
    }
}
