import SetupHeader from "@/components/SetupHeader";
import SetupNavigation from "@/components/SetupNavigation";
import { Skeleton } from "@heroui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="head">
          <SetupHeader />
          <SetupNavigation />
        </div>

        <div className="flex gap-4 items-start">
          {/* Left column - Settings */}
          <div className="flex-1">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center gap-6">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-5 w-40 rounded" />
                </div>
              </div>

              {/* Customise Widget Card */}
              <div className="card">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-5 w-32 rounded" />
                    <Skeleton className="h-4 w-64 rounded mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                </div>
              </div>

              {/* Background Pattern Card */}
              <div className="card">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-4 w-64 rounded mt-1" />
                  </div>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <Skeleton key={index} className="h-12 w-16 rounded" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Widget Icon Card */}
              <div className="card">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-5 w-32 rounded" />
                    <Skeleton className="h-4 w-64 rounded mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                </div>
              </div>

              {/* Announcements Card */}
              <div className="card">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-5 w-40 rounded" />
                      <Skeleton className="h-4 w-64 rounded mt-1" />
                    </div>
                    <Skeleton className="h-10 w-40 rounded" />
                  </div>
                  <div className="flex flex-col gap-2">
                    {[1, 2].map((index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 border border-[#DEDEDE] rounded"
                      >
                        <Skeleton className="h-4 w-8 rounded" />
                        <Skeleton className="h-10 w-16 rounded" />
                        <Skeleton className="h-4 w-32 rounded flex-1" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-12 rounded-full" />
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Preview */}
          <div className="sticky top-1 w-[330px] min-h-[300px]">
            <div className="flex justify-between items-center gap-6 mb-4">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-5 w-24 rounded" />
              </div>
            </div>

            {/* Preview Card Skeleton */}
            <div className="w-full rounded-2xl border border-[#DEDEDE] bg-white shadow-sm overflow-hidden">
              {/* Header skeleton */}
              <div className="p-4 pb-8 relative rounded-t-2xl">
                <Skeleton className="h-6 w-24 rounded mb-2" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>

              {/* Body skeleton */}
              <div className="p-4 space-y-4 -mt-8 relative z-10">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons skeleton */}
        <div className="flex items-center gap-3 justify-end mt-4">
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}

