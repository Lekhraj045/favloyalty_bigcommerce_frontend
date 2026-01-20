import ChannelSelector from "@/components/ChannelSelector";
import { Button } from "@heroui/button";
import { ArrowLeft } from "lucide-react";
import CustomerTable from "./components/CustomerTable";

export default function CustomersPage() {
  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold">Loyalty Members</h1>
              <p>Customize the way you want customers to collect points</p>
            </div>

            <div className="flex gap-2.5 items-center">
              <ChannelSelector />
              <Button className="custom-btn">Upgrade</Button>
            </div>
          </div>

          <div className="card !p-0">
            <CustomerTable />
          </div>
        </div>
      </div>
    </>
  );
}
