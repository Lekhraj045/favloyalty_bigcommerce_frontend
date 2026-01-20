"use client";

import { useState, useCallback } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { useDropzone, FileRejection } from "react-dropzone";
import { Info, X } from "lucide-react";

interface AdjustCustomerPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdjustCustomerPointsModal({
  isOpen,
  onClose,
}: AdjustCustomerPointsModalProps) {
  const [importType, setImportType] = useState("reset");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDropAccepted = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0];
    const reason = rejection.errors[0];

    if (reason.code === "file-too-large") {
      setError("File size must be less than 5 MB.");
    } else if (reason.code === "file-invalid-type") {
      setError("Only CSV files are allowed.");
    } else {
      setError("File upload failed. Please try again.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxSize: 5 * 1024 * 1024, // 5 MB
    multiple: false,
    onDropAccepted,
    onDropRejected,
  });

  const handleSubmit = () => {
    // TODO: Implement import points functionality
    console.log("Import points:", { importType, file: selectedFile });
    onClose();
    // Reset form
    setImportType("reset");
    setSelectedFile(null);
    setError(null);
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setImportType("reset");
    setSelectedFile(null);
    setError(null);
  };

  const handleDownloadTemplate = () => {
    // TODO: Implement download CSV template
    console.log("Download CSV template");
  };

  return (
    <Modal
      size="2xl"
      classNames={{
        base: "bg-white",
        header: "border-b border-[#DEDEDE] bg-[#f3f3f3] p-4",
        body: "p-4",
        footer: "border-t border-[#DEDEDE]",
        closeButton: "top-3",
      }}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex gap-2 items-center justify-between w-full">
                <h2 className="text-sm font-bold">Adjust Points</h2>
                <Button className="custom-btn" onPress={handleDownloadTemplate}>
                  Download a sample CSV template
                </Button>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="w-full custom-dropi relative">
                  <label className="block mb-1 text-[13px] text-gray-700">
                    Import points to
                  </label>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="add">Add points to existing customer balances</option>
                    <option value="reset">Reset points for customers</option>
                  </select>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-800">
                    {importType === "add"
                      ? "Importing points adds to points for existing customers only. New customers will not be created."
                      : "Importing points resets points for existing customers only. New customers will not be created."}
                  </p>
                </div>

                {/* File Upload Section */}
                <div className="space-y-3">
                  <label className="block mb-1 text-[13px] text-gray-700">
                    File selected:
                  </label>

                  {/* Upload Area - Always visible */}
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                      ? "border-[#392D5D] bg-[#f3f3f3]"
                      : error
                        ? "border-red-500 bg-red-50"
                        : "border-[#DEDEDE] hover:border-[#392D5D]"
                      }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-[#DEDEDE] flex items-center justify-center bg-white">
                        <span className="text-xl">⬆️</span>
                      </div>
                      <p className="text-sm font-medium text-[#303030]">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-[#616161]">
                        CSV (Max 5 MB)
                      </p>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <p className="text-sm text-red-600 font-medium">
                      {error}
                    </p>
                  )}

                  {/* Preview - Shows below upload area */}
                  {selectedFile && (
                    <div className="border border-[#DEDEDE] rounded-lg p-3 flex items-center gap-3 bg-white">
                      <div className="w-10 h-10 rounded-md border border-[#DEDEDE] flex items-center justify-center bg-[#f3f3f3]">
                        <span className="text-lg">📄</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#303030] truncate max-w-[300px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-[#616161]">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setError(null);
                        }}
                        className="text-[#616161] hover:text-[#303030] flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button className="custom-btn-default" onPress={onClose}>
                Cancel
              </Button>
              <Button className="custom-btn" onPress={handleSubmit} isDisabled={!selectedFile}>
                Import Points
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}