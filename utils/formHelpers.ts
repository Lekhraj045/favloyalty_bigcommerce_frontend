/**
 * Global form input handling utilities
 * These functions can be reused across the entire application
 */

/**
 * Handles integer input changes with validation
 * - Removes non-numeric characters
 * - Removes leading zeros (except for "0")
 * - Limits to 5 digits
 */
export const handleIntegerInputChange = (
  value: string,
  setter: (value: string) => void
) => {
  // Remove any non-numeric characters
  let numericValue = value.replace(/[^0-9]/g, "");

  // Remove leading zeros (but keep "0" if that's the only character)
  if (numericValue.length > 1 && numericValue.startsWith("0")) {
    numericValue = numericValue.replace(/^0+/, "");
  }

  // Limit to 5 digits, allow empty string
  if (numericValue.length <= 5) {
    setter(numericValue);
  }
};

/**
 * Handles float/decimal input changes with validation
 * - Allows numbers and one decimal point
 * - Removes leading zeros from integer part
 * - Limits to 5 digits total
 */
export const handleFloatInputChange = (
  value: string,
  setter: (value: string) => void
) => {
  // Allow numbers and one decimal point
  let floatValue = value.replace(/[^0-9.]/g, "");

  // Ensure only one decimal point
  const parts = floatValue.split(".");
  if (parts.length > 2) {
    return; // Don't update if more than one decimal point
  }

  // Remove leading zeros from the integer part (but keep "0" if that's the only character before decimal)
  if (parts[0] && parts[0].length > 1 && parts[0].startsWith("0")) {
    parts[0] = parts[0].replace(/^0+/, "") || "0";
    floatValue = parts.join(".");
  }

  // Limit to 5 digits total (including decimal point), allow empty string
  const totalLength = floatValue.replace(".", "").length;
  if (totalLength <= 5) {
    setter(floatValue);
  }
};

/**
 * Handles input blur event
 * Sets value to "0" if empty or already "0"
 */
export const handleInputBlur = (
  currentValue: string,
  setter: (value: string) => void
) => {
  if (currentValue === "" || currentValue === "0") {
    setter("0");
  }
};
