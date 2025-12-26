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
          <div className="flex flex-col gap-1 p-4 border-b border-[#DEDEDE]">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-4 w-64 rounded mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-8 p-4">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-8 w-[120px] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card !p-0">
          <div className="flex justify-between items-center gap-6 p-4 border-b border-[#DEDEDE]">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3 w-64 rounded" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>

        <div className="card !p-0">
          <div className="flex justify-between items-center gap-4 p-4 border-b border-[#DEDEDE]">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3 w-64 rounded" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <Skeleton className="h-4 w-32 rounded mb-2" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 rounded mb-2" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end mt-4">
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}

