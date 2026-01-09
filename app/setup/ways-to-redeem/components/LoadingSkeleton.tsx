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

        <div className="card !p-0">
          <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-40 rounded" />
            </div>

            <div className="flex gap-4">
              <Skeleton className="h-10 w-32 rounded" />
              <Skeleton className="h-10 w-32 rounded" />
              <Skeleton className="h-10 w-40 rounded" />
            </div>
          </div>

          <div className="p-4">
            {/* Table skeleton */}
            <div className="flex flex-col gap-4">
              {/* Table header skeleton */}
              <div className="flex items-center gap-4 pb-2 border-b border-[#DEDEDE]">
                <Skeleton className="h-4 w-8 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded ml-auto" />
              </div>

              {/* Table rows skeleton */}
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 py-3 border-b border-[#DEDEDE]"
                >
                  <Skeleton className="h-4 w-8 rounded" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                  <div className="flex items-center gap-2 ml-auto">
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
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

