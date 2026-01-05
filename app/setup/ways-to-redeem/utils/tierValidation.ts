// Helper function to generate a MongoDB ObjectId-compatible string
// MongoDB ObjectIds are 24-character hex strings
export const generateObjectId = (): string => {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const randomPart = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return (timestamp + randomPart).padEnd(24, '0').substring(0, 24);
};

// Helper function to validate and fix tierId to ensure it's a valid ObjectId
export const validateTierId = (tierId: string | undefined): string => {
  // Check if tierId is a valid ObjectId format (24 hex characters)
  if (tierId && /^[0-9a-fA-F]{24}$/.test(tierId)) {
    return tierId;
  }
  // Generate a new valid ObjectId
  return generateObjectId();
};

// Helper function to validate and fix all tiers in an array
export const validateTiers = (
  tiers: Array<{
    status: boolean;
    name: string;
    tierId: string;
    tierIndex: number;
  }>
): Array<{
  status: boolean;
  name: string;
  tierId: string;
  tierIndex: number;
}> => {
  return tiers.map((tier) => ({
    ...tier,
    tierId: validateTierId(tier.tierId),
  }));
};

