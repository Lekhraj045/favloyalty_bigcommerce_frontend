"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const BROWSER_BACK_ROUTE = "__BROWSER_BACK__";

type UseUnsavedChangesGuardOptions = {
  hasUnsavedChanges: boolean;
  onSave: () => Promise<void> | void;
  onDiscard?: () => void;
};

export function useUnsavedChangesGuard({
  hasUnsavedChanges,
  onSave,
  onDiscard,
}: UseUnsavedChangesGuardOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const pendingNavigationRef = useRef<string | null>(null);
  const isNavigatingRef = useRef(false);

  const setPendingRoute = (route: string | null) => {
    pendingNavigationRef.current = route;
    setPendingNavigation(route);
  };

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handlePopState = () => {
      if (hasUnsavedChanges && !isNavigatingRef.current) {
        window.history.pushState(null, "", window.location.href);
        setPendingRoute(BROWSER_BACK_ROUTE);
        setShowUnsavedModal(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, pathname]);

  const safeNavigate = (route: string) => {
    if (hasUnsavedChanges && !isNavigatingRef.current) {
      setPendingRoute(route);
      setShowUnsavedModal(true);
      return;
    }
    isNavigatingRef.current = false;
    router.push(route);
  };

  const navigateToPendingRoute = (route: string | null) => {
    if (!route) return;
    if (route === BROWSER_BACK_ROUTE) {
      window.history.back();
      return;
    }
    if (route !== pathname) {
      router.push(route);
    }
  };

  const handleSaveUnsavedChanges = async () => {
    const navRoute = pendingNavigationRef.current ?? pendingNavigation;
    isNavigatingRef.current = true;
    try {
      await onSave();
      setShowUnsavedModal(false);
      setPendingRoute(null);
      navigateToPendingRoute(navRoute);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    } catch {
      isNavigatingRef.current = false;
      setShowUnsavedModal(false);
      setPendingRoute(null);
    }
  };

  const handleDiscardUnsavedChanges = () => {
    onDiscard?.();
    setShowUnsavedModal(false);
    const navRoute = pendingNavigationRef.current ?? pendingNavigation;
    setPendingRoute(null);
    isNavigatingRef.current = true;
    navigateToPendingRoute(navRoute);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  };

  return {
    showUnsavedModal,
    safeNavigate,
    handleSaveUnsavedChanges,
    handleDiscardUnsavedChanges,
  };
}
