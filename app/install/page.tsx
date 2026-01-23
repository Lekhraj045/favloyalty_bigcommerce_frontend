"use client";

import { useAppDispatch } from "@/store/hooks";
import { setChannels, setSelectedChannel } from "@/store/slices/channelSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getChannels, type Channel } from "@/utils/api";

function InstallPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleInstallation = async () => {
      const storeHash = searchParams.get("storeHash");
      const storeId = searchParams.get("storeId");
      const sessionToken = searchParams.get("sessionToken");
      const sessionExpiresAt = searchParams.get("sessionExpiresAt");
      const email = searchParams.get("email");

      if (!storeHash || !storeId || !sessionToken) {
        setError("Missing required parameters");
        return;
      }

      try {
        // Store session information
        localStorage.setItem("bc_store_hash", storeHash);
        localStorage.setItem("bc_store_id", storeId);
        localStorage.setItem("bc_session_token", sessionToken);
        if (sessionExpiresAt) {
          localStorage.setItem("bc_session_expires_at", sessionExpiresAt);
        }
        if (email) {
          localStorage.setItem("bc_user_email", email);
        }

        // Fetch channels for the store
        const channels: Channel[] = await getChannels(storeId.toString());

        // Store channels array in localStorage
        if (channels && channels.length > 0) {
          localStorage.setItem("bc_channels", JSON.stringify(channels));
          // Dispatch channels to Redux store
          dispatch(setChannels(channels));
          // Select first channel by default
          if (channels.length > 0) {
            dispatch(setSelectedChannel(channels[0]));
          }
        } else {
          localStorage.setItem("bc_channels", JSON.stringify([]));
          dispatch(setChannels([]));
        }

        // Redirect to setup page (Points & tier system page)
        router.push(`/setup/points-tier-system?storeHash=${storeHash}`);
      } catch (err) {
        console.error("Installation error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred during installation"
        );
      }
    };

    handleInstallation();
  }, [searchParams, router, dispatch]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Installation Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing Installation...</h1>
        <p className="text-gray-600">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}

export default function InstallPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <InstallPageContent />
    </Suspense>
  );
}
