package com.romanguides.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // See RomanGuidesWebChromeClient/RomanGuidesWebViewClient — general
        // hardening for embedded third-party web content (nested iframes
        // navigating internally, popups from a payment step). Kept even
        // though neither was the actual fix for the "Go to cart" bug — see
        // BookingWidgetModal.tsx's top comment for the real root cause.
        this.getBridge().getWebView().setWebChromeClient(new RomanGuidesWebChromeClient(this.getBridge()));
        this.getBridge().getWebView().setWebViewClient(new RomanGuidesWebViewClient(this.getBridge()));
    }
}
