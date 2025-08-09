"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

// Quick testing: read public environment variables (only for quick dev tests)
const WIDGET_ID = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID ?? "";
const TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH ?? "";

export default function Msg91OtpPage() {
  const [phone, setPhone] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof (window as any).initSendOTP === "function") {
      // widget methods available
      console.debug("MSG91: initSendOTP available");
    }
  }, [scriptLoaded]);

  function sanitizePhone(value: string) {
    // remove any non-digit characters; this keeps things simple for examples
    return value.replace(/[^\d]/g, "");
  }

  const handleSendOtp = () => {
    const identifier = "91" + sanitizePhone(phone);
    if (!identifier) {
      alert("Please enter a valid mobile number (digits only, without +).");
      return;
    }

    console.log("otp identifier ========= ", identifier);

    setLoading(true);

    const configuration = {
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      identifier,
      exposeMethods: true,
      success: (data: any) => {
        console.log("✅ success response:", data);
        setAccessToken(data?.accessToken ?? null);
        setLoading(false);
        alert(
          "OTP sent and verified! Access Token: " +
            (data?.accessToken ?? "[none]")
        );
      },
      failure: (error: any) => {
        console.error("❌ failure reason:", error);
        setLoading(false);
        alert("OTP failed: " + JSON.stringify(error));
      },
    };

    if (typeof (window as any).initSendOTP === "function") {
      (window as any).initSendOTP(configuration);
    } else {
      alert("OTP script not loaded yet. Please try again.");
      console.error("initSendOTP not available");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      {/* Load the external script after the page is interactive */}
      <Script
        src="https://verify.msg91.com/otp-provider.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={(e) => {
          console.error("Failed to load MSG91 script", e);
          setScriptError(true);
        }}
      />

      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-xl font-semibold mb-4">MSG91 OTP — Demo</h1>

        <label className="block text-sm mb-1">Mobile number (without +)</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 919876543210"
          className="w-full p-2 border rounded mb-3"
        />

        <button
          onClick={handleSendOtp}
          disabled={!scriptLoaded || loading || scriptError}
          className={`w-full py-2 rounded-lg font-medium ${
            !scriptLoaded || scriptError
              ? "opacity-50 cursor-not-allowed"
              : "bg-blue-600 text-white"
          }`}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        {scriptError && (
          <p className="text-sm text-red-600 mt-3">
            The external OTP script failed to load. Check console / network /
            CSP.
          </p>
        )}

        {accessToken && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">Last access token</div>
            <div className="text-sm break-all">{accessToken}</div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-400">
          Notes: This example reads <code>NEXT_PUBLIC_MSG91_WIDGET_ID</code> and{" "}
          <code>NEXT_PUBLIC_MSG91_TOKEN_AUTH</code> from environment.
        </div>
      </div>
    </div>
  );
}
