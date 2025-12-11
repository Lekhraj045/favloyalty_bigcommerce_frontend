const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://favbigcommerce.share.zrok.io";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("bc_session_token") ||
    localStorage.getItem("sessionToken") ||
    null
  );
};

// Helper function to build auth headers
const getAuthHeaders = (includeContentType = false): HeadersInit => {
  const headers: HeadersInit = {};
  const token = getAuthToken();
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Note: Don't set Content-Type for FormData - browser will set it automatically with boundary
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  return headers;
};

export async function getStoreInfo(storeHash: string) {
  const response = await fetch(`${API_URL}/api/store/${storeHash}`);
  if (!response.ok) throw new Error("Failed to fetch store");
  return response.json();
}

export type Channel = {
  id: string | null; // MongoDB ObjectId (null if not yet synced to database)
  channel_id: number; // BigCommerce channel ID
  channel_name: string | null;
  channel_type?: string | null;
  platform?: string | null;
  status?: string | null;
};

export type LoginResponse = {
  sessionToken: string;
  sessionExpiresAt: number;
  store: {
    id: string; // MongoDB ObjectId
    hash: string;
    email: string; // userEmail
    userEmail?: string; // Keep for backward compatibility
    userId?: string;
    storeName?: string;
    storeDomain?: string;
    storeUrl?: string;
    currency?: string;
    timezone?: string;
    language?: string;
    platformVersion?: string;
    installedAt?: Date | string;
    updatedAt?: Date | string;
    scope?: string;
    isActive?: boolean;
  };
  channels?: Channel[];
  channelCount?: number;
  bigCommerce?: {
    user?: any;
    owner?: any;
    context?: string;
    issuedAt?: number;
  };
};

export async function loginWithSignedPayload(
  signedPayload: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedPayload }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "JWT verification failed");
  }

  return response.json();
}

export interface Tier {
  tierName: string;
  pointRequired: number;
  multiplier: number;
  badgeColor?: string;
}

export interface Logo {
  id?: number;
  src: string;
  name: string;
}

export interface CustomPointName {
  name: string;
  active: boolean;
}

export interface PointData {
  _id?: string; // Point ID for updates
  pointName: string;
  customPointName?: CustomPointName[];
  expiry: boolean;
  expiriesInDays?: number;
  tierStatus: boolean;
  logo?: Logo;
  customLogo?: Logo;
  tier?: Tier[];
}

export async function savePoints(
  storeId: string,
  channelId: string,
  pointData: PointData,
  logoFile?: File
): Promise<{ success: boolean; message: string; data?: any }> {
  const formData = new FormData();

  formData.append("storeId", storeId);
  formData.append("channelId", channelId);
  formData.append("pointName", pointData.pointName);
  formData.append("expiry", String(pointData.expiry));
  formData.append("tierStatus", String(pointData.tierStatus));

  if (pointData.expiry && pointData.expiriesInDays) {
    formData.append("expiriesInDays", String(pointData.expiriesInDays));
  }

  if (pointData.logo) {
    formData.append("logo", JSON.stringify(pointData.logo));
  }

  if (pointData.customLogo) {
    formData.append("customLogo", JSON.stringify(pointData.customLogo));
  }

  if (logoFile) {
    formData.append("logoImage", logoFile);
  }

  if (pointData.customPointName && pointData.customPointName.length > 0) {
    formData.append(
      "customPointName",
      JSON.stringify(pointData.customPointName)
    );
  }

  if (pointData.tier && pointData.tier.length > 0) {
    formData.append("tier", JSON.stringify(pointData.tier));
  }

  console.log("📤 Saving points:", { storeId, channelId, pointData });

  const response = await fetch(`${API_URL}/api/points`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error saving points:", errorBody);
    throw new Error(errorBody.message || errorBody.error || "Failed to save points");
  }

  const result = await response.json();
  console.log("✅ Points saved successfully:", result);
  return result;
}

export async function updatePoints(
  pointId: string,
  pointData: PointData,
  logoFile?: File
): Promise<{ success: boolean; message: string; data?: any }> {
  const formData = new FormData();

  formData.append("pointName", pointData.pointName);
  formData.append("expiry", String(pointData.expiry));
  formData.append("tierStatus", String(pointData.tierStatus));

  if (pointData.expiry && pointData.expiriesInDays) {
    formData.append("expiriesInDays", String(pointData.expiriesInDays));
  }

  if (pointData.logo) {
    formData.append("logo", JSON.stringify(pointData.logo));
  }

  if (pointData.customLogo) {
    formData.append("customLogo", JSON.stringify(pointData.customLogo));
  }

  if (logoFile) {
    formData.append("logoImage", logoFile);
  }

  if (pointData.customPointName && pointData.customPointName.length > 0) {
    formData.append(
      "customPointName",
      JSON.stringify(pointData.customPointName)
    );
  }

  if (pointData.tier && pointData.tier.length > 0) {
    formData.append("tier", JSON.stringify(pointData.tier));
  }

  console.log("📤 Updating points:", { pointId, pointData });

  const response = await fetch(`${API_URL}/api/points/${pointId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error updating points:", errorBody);
    throw new Error(errorBody.message || errorBody.error || "Failed to update points");
  }

  const result = await response.json();
  console.log("✅ Points updated successfully:", result);
  return result;
}

export async function getPoints(
  storeId: string,
  channelId: string
): Promise<PointData | null> {
  console.log("📥 Fetching points:", { storeId, channelId });

  const response = await fetch(
    `${API_URL}/api/points?storeId=${storeId}&channelId=${channelId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.log("ℹ️ No points configuration found");
      return null;
    }
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching points:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch points"
    );
  }

  const result = await response.json();
  console.log("✅ Points fetched successfully:", result);
  return result;
}
