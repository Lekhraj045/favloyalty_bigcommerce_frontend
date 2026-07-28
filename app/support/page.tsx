"use client";

export default function SupportPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Support</h1>
            <p>Get help with setup, widget visibility, rewards, and billing.</p>
          </div>
        </div>

        <div className="card flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Contact Support</h2>
            <p className="text-sm text-gray-600">
              For help with FavLoyalty, contact our support team and include
              your store name and channel name for faster assistance.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <p>
              <span className="font-medium">Email:</span>{" "}
              <a
                href="mailto:support@favloyalty.com"
                className="text-blue-600 hover:underline"
              >
                support@favloyalty.com
              </a>
            </p>
            <p>
              <span className="font-medium">Contact Us:</span>{" "}
              <a
                href="https://favloyalty.com/contact"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                favloyalty.com/contact
              </a>
            </p>
            <p>
              <span className="font-medium">Guide:</span>{" "}
              Use the installation and user guide URL submitted in the
              BigCommerce listing for setup instructions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
