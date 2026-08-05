package com.romanguides.app;

import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

// This was the second of two hypotheses tried for "Go to cart" doing
// nothing inside the old raw-iframe Bokun embed — disproven by diagnostic
// logging (this override never fired for that specific button; see
// BookingWidgetModal.tsx's top comment for the actual root cause and fix,
// found afterwards). Kept anyway because the underlying behavior is still
// correct in general: Capacitor's shouldOverrideUrlLoading normally treats
// any navigation whose destination host isn't our own app (or on the
// configured allowNavigation list) as external, and tries to launch it as
// an Android Intent — for EVERY frame, including navigation happening
// entirely inside a nested iframe. That's the wrong behavior for
// third-party embedded content in general (a widget navigating between its
// own pages isn't the user leaving our app), so nested-frame navigation is
// left alone here and only the top frame still defers to Capacitor's own
// external-link handling, unchanged.
public class RomanGuidesWebViewClient extends BridgeWebViewClient {

    public RomanGuidesWebViewClient(Bridge bridge) {
        super(bridge);
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        if (!request.isForMainFrame()) {
            return false;
        }
        return super.shouldOverrideUrlLoading(view, request);
    }
}
