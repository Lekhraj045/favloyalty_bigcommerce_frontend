import { CheckBadgeIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";

export default function SetupBar() {
  return (
    <div className="dashboardbox setup-bar">
      <div className="card">
        <div className="flex items-center gap-2">
          <div className="flex gap-4 items-center w-full">
            <div className="flex gap-4 grow">
              <Button className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg relative px-6 py-3 h-[46px] w-full">
                <div className="flex justify-center items-center gap-1.5">
                  <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                  <span className="text-[13px] font-medium text-[#303030]">
                    Point
                  </span>
                </div>
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-green-600 rounded-b-lg"></span>
              </Button>

              <Button className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg relative px-6 py-3 h-[46px] w-full">
                <div className="flex justify-center items-center gap-1.5">
                  <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                  <span className="text-[13px] font-medium text-[#303030]">
                    Earn
                  </span>
                </div>

                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-green-600 rounded-b-lg"></span>
              </Button>

              <Button className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg relative px-6 py-3 h-[46px] w-full">
                <div className="flex justify-center items-center gap-1.5">
                  <ClockIcon className="h-5 w-5 text-amber-400" />
                  <span className="text-[13px] font-medium text-[#303030]">
                    Earn
                  </span>
                </div>

                {/* Orange line example */}
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-amber-500 rounded-b-lg"></span>
              </Button>

              <Button className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg relative px-6 py-3 h-[46px] w-full">
                <div className="flex justify-center items-center gap-1.5">
                  <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                  <span className="text-[13px] font-medium text-[#303030]">
                    Design
                  </span>
                </div>

                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-green-600 rounded-b-lg"></span>
              </Button>

              <Button className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg relative px-6 py-3 h-[46px] w-full">
                <div className="flex justify-center items-center gap-1.5">
                  <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                  <span className="text-[13px] font-medium text-[#303030]">
                    Email
                  </span>
                </div>

                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-green-600 rounded-b-lg"></span>
              </Button>
            </div>

            <Button className="custom-btn">Edit Setup</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
