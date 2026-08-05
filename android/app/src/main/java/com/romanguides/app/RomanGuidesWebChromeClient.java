package com.romanguides.app;

import android.os.Message;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;
import org.json.JSONObject;

// Capacitor's default WebChromeClient does not implement onCreateWindow, so
// android.webkit.WebChromeClient's base implementation applies: any web
// content — including content inside a cross-origin iframe — that tries to
// open a new window (target="_blank" or window.open()) is silently dropped.
// No error, no log.
//
// This was one of two hypotheses tried for "Go to cart" doing nothing inside
// the old raw-iframe Bokun embed — both were disproven by diagnostic
// logging (this method never fired for that specific button; the real
// cause was that a raw <iframe> isn't Bokun's real embed mechanism at all —
// see BookingWidgetModal.tsx's top comment for the actual root cause and
// fix). This class is kept anyway: it's still correct, general-purpose
// hardening for a real, separate risk — a payment step (3-D Secure, PayPal,
// Apple Pay) genuinely opening a popup from inside Bokun's own widget iframe.
//
// Extends BridgeWebChromeClient (not a bare WebChromeClient) to keep every
// bit of Capacitor's own behavior — file uploads, permissions, JS dialogs,
// geolocation, console logging — and only adds onCreateWindow.
//
// Rather than bouncing straight to the system browser (which would defeat
// most of the point of embedding the widget in-app at all), the target URL
// is relayed to our own top-level page as a DOM event. BookingWidgetModal.tsx
// listens for it and shows a full-screen fallback iframe there instead,
// staying in-app. If that specific destination refuses to be framed (e.g. a
// bank's real 3-D Secure page sending X-Frame-Options: DENY), the modal's
// own load-timeout/error handling catches it, and its "Open in browser"
// action is the real escape hatch for that case — this native layer
// doesn't need to special-case it.
public class RomanGuidesWebChromeClient extends BridgeWebChromeClient {

    public RomanGuidesWebChromeClient(Bridge bridge) {
        super(bridge);
    }

    @Override
    public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
        WebView transportWebView = new WebView(view.getContext());
        transportWebView.setWebViewClient(
            new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView webView, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    // JSONObject.quote() escapes safely for embedding inside a JS string
                    // literal (quotes, backslashes, control characters) — the URL comes
                    // from arbitrary embedded web content, never trust it unescaped.
                    String script = "window.dispatchEvent(new CustomEvent('romanguides:newwindow', { detail: " + JSONObject.quote(url) + " }))";
                    view.evaluateJavascript(script, null);
                    return true; // il WebView temporaneo non deve mai renderizzare nulla
                }
            }
        );

        WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
        transport.setWebView(transportWebView);
        resultMsg.sendToTarget();
        return true;
    }
}
