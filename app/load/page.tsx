// app/load/page.js
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { loginWithSignedPayload, type LoginResponse } from "@/utils/api";

function LoadPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyAndRedirect = async () => {
      const signedPayload = searchParams.get("signed_payload_jwt");

      if (!signedPayload) {
        setError("Missing signed payload");
        return;
      }

      try {
        const data: LoginResponse = await loginWithSignedPayload(
          signedPayload
        );
        const { store, sessionToken, channels } = data;

        // Store store information
        localStorage.setItem("bc_store_id", store.id);
        localStorage.setItem("bc_store_hash", store.hash);
        localStorage.setItem(
          "bc_user_email",
          store.userEmail || store.email || ""
        );
        localStorage.setItem("bc_session_token", sessionToken);
        localStorage.setItem(
          "bc_session_expires_at",
          data.sessionExpiresAt.toString()
        );

        // Store channels array
        if (channels && channels.length > 0) {
          localStorage.setItem("bc_channels", JSON.stringify(channels));
        } else {
          localStorage.setItem("bc_channels", JSON.stringify([]));
        }

        // Redirect to dashboard
        router.push(`/dashboard?storeHash=${store.hash}`);
      } catch (err) {
        console.error("Error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to verify app credentials"
        );
      }
    };

    verifyAndRedirect();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Loading your app...</p>
      </div>
    </div>
  );
}

export default function LoadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <LoadPageContent />
    </Suspense>
  );
}
