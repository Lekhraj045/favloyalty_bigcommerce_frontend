import { Button } from "@heroui/button";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@heroui/modal";
import Image from "next/image";

interface WaysModalProps {
  onSelectRedeemType: (type: string) => void;
  isFreePlan?: boolean;
  onPremiumClick?: (featureName: string) => void;
}

export default function WaysModal({ 
  onSelectRedeemType, 
  isFreePlan = false,
  onPremiumClick 
}: WaysModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSelect = (type: string) => {
    // Check if it's a premium feature and user is on free plan
    const premiumTypes = ["percentage-discount", "free-shipping", "free-products"];
    if (isFreePlan && premiumTypes.includes(type)) {
      const featureNames: { [key: string]: string } = {
        "percentage-discount": "Percentage Discount",
        "free-shipping": "Free Shipping",
        "free-products": "Free Products",
      };
      if (onPremiumClick) {
        onPremiumClick(featureNames[type]);
      }
      return;
    }
    onSelectRedeemType(type);
    onOpenChange();
  };

  return (
    <>
      <Button className="custom-btn" onPress={onOpen}>
        Add Ways to Redeem
      </Button>
      <Modal
        classNames={{
          base: "bg-white",
          header: "border-b border-[#DEDEDE] bg-[#f3f3f3] p-4",
          body: "p-0",
          footer: "border-t border-[#DEDEDE]",
          closeButton: "top-3",
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-sm font-bold">Ways to redeem</h2>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col">
                  {/* Percentage Discount - Premium */}
                  <button
                    onClick={() => handleSelect("percentage-discount")}
                    className={`border-b border-[#DEDEDE] flex gap-4 items-center p-4 text-left w-full relative ${
                      isFreePlan
                        ? "cursor-not-allowed"
                        : "hover:bg-[#f3f3f3] cursor-pointer"
                    }`}
                    disabled={isFreePlan}
                  >
                    <div className={`border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 relative ${
                      isFreePlan ? "opacity-60 blur-[0.5px]" : ""
                    }`}>
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`}
                        width={24}
                        height={24}
                        alt="Percentage Discount"
                        priority
                      />
                      {isFreePlan && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                          <svg
                            className="w-3 h-3 text-yellow-800"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className={`text-[13px] flex-1 ${
                      isFreePlan ? "opacity-60 blur-[0.5px]" : ""
                    }`}>Percentage Discount</h3>
                  </button>

                  {/* Fixed Discount - Free */}
                  <button
                    onClick={() => handleSelect("fixed-discount")}
                    className="border-b border-[#DEDEDE] hover:bg-[#f3f3f3] flex gap-4 items-center p-4 text-left w-full cursor-pointer"
                  >
                    <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/fixed-discount.svg`}
                        width={24}
                        height={24}
                        alt="Fixed Discount"
                        priority
                      />
                    </div>
                    <h3 className="text-[13px]">Fixed Discount</h3>
                  </button>

                  {/* Free Shipping - Premium */}
                  <button
                    onClick={() => handleSelect("free-shipping")}
                    className={`border-b border-[#DEDEDE] flex gap-4 items-center p-4 text-left w-full relative ${
                      isFreePlan
                        ? "cursor-not-allowed"
                        : "hover:bg-[#f3f3f3] cursor-pointer"
                    }`}
                    disabled={isFreePlan}
                  >
                    <div className={`border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 relative ${
                      isFreePlan ? "opacity-60 blur-[0.5px]" : ""
                    }`}>
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-shipping.svg`}
                        width={24}
                        height={24}
                        alt="Free Shipping"
                        priority
                      />
                      {isFreePlan && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                          <svg
                            className="w-3 h-3 text-yellow-800"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className={`text-[13px] flex-1 ${
                      isFreePlan ? "opacity-60 blur-[0.5px]" : ""
                    }`}>Free Shipping</h3>
                  </button>

                  {/* Free Products - Premium */}
                  <button
                    onClick={() => handleSelect("free-products")}
                    className={`flex gap-4 items-center p-4 text-left w-full relative ${
                      isFreePlan
                        ? "cursor-not-allowed"
                        : "hover:bg-[#f3f3f3] cursor-pointer"
                    }`}
                    disabled={isFreePlan}
                  >
                    <div className={`border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10 relative ${
                      isFreePlan ? "opacity-60 blur-[0.5px]" : ""
                    }`}>
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-products.svg`}
                        width={24}
                        height={24}
                        alt="Free Products"
                        priority
                      />
                      {isFreePlan && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                          <svg
                            className="w-3 h-3 text-yellow-800"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className={`text-[13px] flex-1 ${
                      isFreePlan ? "opacity-60 blur-[0.5px]" : ""
                    }`}>Free Products</h3>
                  </button>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button className="custom-btn" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
