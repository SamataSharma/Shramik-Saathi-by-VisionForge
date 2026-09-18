package org.visionforge.minear;

import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {
    public static final String TAG = "MineAR";
    public static final String VIRTUAL_DOMAIN = "localhost";
    public static final String START_URL = "http://" + VIRTUAL_DOMAIN + "/index.html";
    public static final int PERMISSION_REQ_CODE = 1001;

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen on during safety training sessions
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Enable display cutout handling for Android P (API 28+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        // Setup WebView
        webView = new WebView(this);
        setContentView(webView);

        // Setup Window Insets Listener for display cutout, notch, status bar and gesture navigation
        webView.setOnApplyWindowInsetsListener(new android.view.View.OnApplyWindowInsetsListener() {
            @Override
            public android.view.WindowInsets onApplyWindowInsets(android.view.View v, android.view.WindowInsets insets) {
                applyWindowInsetsToWebView(insets);
                return insets;
            }
        });

        initWebSettings();
        webView.setWebViewClient(new LocalWebViewClient(getAssets()));
        webView.setWebChromeClient(new LocalWebChromeClient(this));

        checkAndRequestPermissions();

        // Load simulator
        webView.loadUrl(START_URL);
    }

    private int safeInsetTop = 0;
    private int safeInsetBottom = 0;
    private int safeInsetLeft = 0;
    private int safeInsetRight = 0;
    private boolean hasDisplayCutout = false;

    private void applyWindowInsetsToWebView(android.view.WindowInsets insets) {
        float density = getResources().getDisplayMetrics().density;
        int top = insets.getSystemWindowInsetTop();
        int bottom = insets.getSystemWindowInsetBottom();
        int left = insets.getSystemWindowInsetLeft();
        int right = insets.getSystemWindowInsetRight();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            android.view.DisplayCutout cutout = insets.getDisplayCutout();
            if (cutout != null) {
                hasDisplayCutout = true;
                top = Math.max(top, cutout.getSafeInsetTop());
                bottom = Math.max(bottom, cutout.getSafeInsetBottom());
                left = Math.max(left, cutout.getSafeInsetLeft());
                right = Math.max(right, cutout.getSafeInsetRight());
            }
        }

        safeInsetTop = (int) (top / density);
        safeInsetBottom = (int) (bottom / density);
        safeInsetLeft = (int) (left / density);
        safeInsetRight = (int) (right / density);

        final String js = String.format(
            "document.documentElement.style.setProperty('--android-safe-top', '%dpx');" +
            "document.documentElement.style.setProperty('--android-safe-bottom', '%dpx');" +
            "document.documentElement.style.setProperty('--android-safe-left', '%dpx');" +
            "document.documentElement.style.setProperty('--android-safe-right', '%dpx');",
            safeInsetTop, safeInsetBottom, safeInsetLeft, safeInsetRight
        );

        webView.post(new Runnable() {
            @Override
            public void run() {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    webView.evaluateJavascript(js, null);
                } else {
                    webView.loadUrl("javascript:" + js);
                }
            }
        });
    }

    private void initWebSettings() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadsImagesAutomatically(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // Add native bridge
        webView.addJavascriptInterface(new AndroidBridge(this), "AndroidBridge");
    }

    private void checkAndRequestPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] permissions = new String[]{
                    android.Manifest.permission.CAMERA,
                    android.Manifest.permission.RECORD_AUDIO
            };
            boolean needRequest = false;
            for (String perm : permissions) {
                if (checkSelfPermission(perm) != PackageManager.PERMISSION_GRANTED) {
                    needRequest = true;
                    break;
                }
            }
            if (needRequest) {
                requestPermissions(permissions, PERMISSION_REQ_CODE);
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }

    public static class LocalWebViewClient extends WebViewClient {
        private final AssetManager assetManager;

        public LocalWebViewClient(AssetManager assetManager) {
            this.assetManager = assetManager;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String host = uri.getHost();

            if (host != null && (host.equalsIgnoreCase(VIRTUAL_DOMAIN) || host.equalsIgnoreCase("127.0.0.1"))) {
                String path = uri.getPath();
                if (path == null || path.isEmpty() || path.equals("/")) {
                    path = "/index.html";
                }

                String assetRelativePath = path.startsWith("/") ? path.substring(1) : path;
                String fullAssetPath = "www/" + assetRelativePath;

                try {
                    InputStream stream = assetManager.open(fullAssetPath);
                    String mimeType = guessMimeType(fullAssetPath);
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Access-Control-Allow-Origin", "*");
                    headers.put("Cache-Control", "no-cache");
                    return new WebResourceResponse(mimeType, "UTF-8", 200, "OK", headers, stream);
                } catch (IOException e) {
                    if (!path.contains(".")) {
                        try {
                            InputStream stream = assetManager.open("www/index.html");
                            Map<String, String> headers = new HashMap<>();
                            headers.put("Access-Control-Allow-Origin", "*");
                            return new WebResourceResponse("text/html", "UTF-8", 200, "OK", headers, stream);
                        } catch (IOException ignored) {}
                    }
                    Log.w(TAG, "Asset not found: " + fullAssetPath);
                }
            }

            return super.shouldInterceptRequest(view, request);
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            Log.d(TAG, "Loading URL: " + url);
        }

        private String guessMimeType(String path) {
            String lower = path.toLowerCase();
            if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
            if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript";
            if (lower.endsWith(".css")) return "text/css";
            if (lower.endsWith(".json")) return "application/json";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".webp")) return "image/webp";
            if (lower.endsWith(".wasm")) return "application/wasm";
            if (lower.endsWith(".woff")) return "font/woff";
            if (lower.endsWith(".woff2")) return "font/woff2";
            if (lower.endsWith(".ttf")) return "font/ttf";
            if (lower.endsWith(".mp3")) return "audio/mpeg";
            if (lower.endsWith(".wav")) return "audio/wav";
            if (lower.endsWith(".ogg")) return "audio/ogg";
            return "application/octet-stream";
        }
    }

    public static class LocalWebChromeClient extends WebChromeClient {
        private final Activity activity;

        public LocalWebChromeClient(Activity activity) {
            this.activity = activity;
        }

        @Override
        public void onPermissionRequest(final PermissionRequest request) {
            activity.runOnUiThread(new PermissionGranter(request));
        }

        @Override
        public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
            Log.d(TAG, "[JS] " + consoleMessage.message() + " -- From line "
                    + consoleMessage.lineNumber() + " of " + consoleMessage.sourceId());
            return true;
        }
    }

    public static class PermissionGranter implements Runnable {
        private final PermissionRequest request;

        public PermissionGranter(PermissionRequest request) {
            this.request = request;
        }

        @Override
        public void run() {
            request.grant(request.getResources());
        }
    }

    public static class AndroidBridge {
        private final MainActivity activity;

        public AndroidBridge(MainActivity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public void vibrate(long milliseconds) {
            try {
                Vibrator vibrator = (Vibrator) activity.getSystemService(Context.VIBRATOR_SERVICE);
                if (vibrator != null && vibrator.hasVibrator()) {
                    vibrator.vibrate(milliseconds);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error triggering vibration", e);
            }
        }

        @JavascriptInterface
        public void showToast(String message) {
            Toast.makeText(activity, message, Toast.LENGTH_SHORT).show();
        }

        @JavascriptInterface
        public String getPlatform() {
            return "Android";
        }

        @JavascriptInterface
        public String getSafeAreaInsets() {
            return String.format(
                "{\"top\":%d,\"bottom\":%d,\"left\":%d,\"right\":%d,\"hasCutout\":%b}",
                activity.safeInsetTop, activity.safeInsetBottom, activity.safeInsetLeft, activity.safeInsetRight, activity.hasDisplayCutout
            );
        }
    }
}
