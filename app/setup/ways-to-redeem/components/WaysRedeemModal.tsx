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

export default function WaysModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
                  <div className="border-b border-[#DEDEDE] hover:bg-[#f3f3f3]">
                    <a href="/setup/ways-to-redeem/percentage-discount" className="flex gap-4 items-center p-4">
                      <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10">
                        <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/percentage-discount.svg`} width={24} height={24} alt="Percentage Discount" priority />
                      </div>
                      <h3 className="text-[13px]">Percentage Discount</h3>
                    </a>
                  </div>

                  <div className="border-b border-[#DEDEDE] hover:bg-[#f3f3f3]">
                    <a href="/setup/ways-to-redeem/fixed-discount" className="flex gap-4 items-center p-4">
                      <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10">
                        <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/fixed-discount.svg`} width={24} height={24} alt="Fixed Discount" priority />
                      </div>
                      <h3 className="text-[13px]">Fixed Discount</h3>
                    </a>
                  </div>

                  <div className="border-b border-[#DEDEDE] hover:bg-[#f3f3f3]">
                    <a href="/setup/ways-to-redeem/free-shipping" className="flex gap-4 items-center p-4">
                      <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10">
                        <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-shipping.svg`} width={24} height={24} alt="Free Shipping" priority />
                      </div>
                      <h3 className="text-[13px]">Free Shipping</h3>
                    </a>
                  </div>

                  <div className="hover:bg-[#f3f3f3]">
                    <a href="/setup/ways-to-redeem/free-product" className="flex gap-4 items-center p-4">
                      <div className="border border-[#DEDEDE] rounded-lg p-2 w-10 h-10 max-w-10 max-h-10">
                        <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/free-products.svg`} width={24} height={24} alt="Free Products" priority />
                      </div>
                      <h3 className="text-[13px]">Free Products</h3>
                    </a>
                  </div>
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
