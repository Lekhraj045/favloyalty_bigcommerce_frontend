"use client";

import { Button } from "@heroui/button";
import { XMarkIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  featureName,
}: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    router.push("/pricing");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Modal Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <LockClosedIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Upgrade to Premium
            </h2>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {featureName} is available exclusively with our premium plan.
            Upgrade today to access this and many other powerful features to
            enhance your store.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="flat"
              onPress={onClose}
              className="px-6 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Maybe Later
            </Button>
            <Button
              onPress={handleUpgrade}
              className="px-6 py-2 bg-gray-800 text-white hover:bg-gray-900"
            >
              &gt; Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
