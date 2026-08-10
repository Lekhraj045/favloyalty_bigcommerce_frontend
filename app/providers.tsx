"use client";

import { store } from "@/store/store";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import LogRocket from "logrocket";
import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect } from "react";
import { Provider } from "react-redux";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export default function LogRocketInit() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID;
    if (!appId || process.env.NODE_ENV !== "production") return;
    LogRocket.init('favloyalty_bigc/favloyalty_bigc');
    // Identify merchant after login data exists
    const storeId = localStorage.getItem("bc_store_id");
    const storeHash = localStorage.getItem("bc_store_hash");
    const email = localStorage.getItem("bc_user_email");
    if (storeId) {
      LogRocket.identify(storeId, {
        email: email || "",
        storeHash: storeHash || "",
      });
    }
  }, []);
  return null;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <Provider store={store}>
      <LogRocketInit />
      <HeroUIProvider navigate={router.push}>
        <div className="fixed z-[100]">
          <ToastProvider placement="bottom-center" toastOffset={0} />
        </div>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </HeroUIProvider>
    </Provider>
  );
}
