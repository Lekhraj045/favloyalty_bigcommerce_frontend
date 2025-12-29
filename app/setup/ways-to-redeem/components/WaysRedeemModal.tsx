import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import Image from "next/image";

interface WaysModalProps {
  onSelectRedeemType: (type: string) => void;
}

export default function WaysModal({ onSelectRedeemType }: WaysModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSelect = (type: string) => {
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
                  <button
                    onClick={() => handleSelect("percentage-discount")}
                    className="border-b border-[#DEDEDE] hover:bg-[#f3f3f3] flex gap-4 items-center p-4 text-left w-full"
                  >
                    <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`}
                        width={24}
                        height={24}
                        alt="Percentage Discount"
                        priority
                      />
                    </div>
                    <h3 className="text-[13px]">Percentage Discount</h3>
                  </button>

                  <button
                    onClick={() => handleSelect("fixed-discount")}
                    className="border-b border-[#DEDEDE] hover:bg-[#f3f3f3] flex gap-4 items-center p-4 text-left w-full"
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

                  <button
                    onClick={() => handleSelect("free-shipping")}
                    className="border-b border-[#DEDEDE] hover:bg-[#f3f3f3] flex gap-4 items-center p-4 text-left w-full"
                  >
                    <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-shipping.svg`}
                        width={24}
                        height={24}
                        alt="Free Shipping"
                        priority
                      />
                    </div>
                    <h3 className="text-[13px]">Free Shipping</h3>
                  </button>

                  <button
                    onClick={() => handleSelect("free-products")}
                    className="hover:bg-[#f3f3f3] flex gap-4 items-center p-4 text-left w-full"
                  >
                    <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-products.svg`}
                        width={24}
                        height={24}
                        alt="Free Products"
                        priority
                      />
                    </div>
                    <h3 className="text-[13px]">Free Products</h3>
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
