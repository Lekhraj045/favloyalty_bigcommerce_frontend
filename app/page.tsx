import { Button } from "@heroui/button";

export default function Home() {
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 justify-between items-center">
          <h1 className="text-xl font-bold">Setup FavLoyalty</h1>

          <div className="flex gap-2.5 items-center">
            <div className="relative offline-widget pl-6">
              <p className="font-bold">Loyalty program not active</p>
            </div>
            <Button className="custom-btn">Disable Widget</Button>
            <Button className="custom-btn danger-btn">Reset Settings</Button>
          </div>
        </div>
      </div>
    </>
  );
}
