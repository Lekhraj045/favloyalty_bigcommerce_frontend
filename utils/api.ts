const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://favbigcommerce.share.zrok.io";

// Token expiration buffer (refresh 2 minutes before expiration)
const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000; // 2 minutes

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("bc_session_token") ||
    localStorage.getItem("sessionToken") ||
    null
  );
};

// Helper function to get store hash from localStorage
const getStoreHash = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bc_store_hash");
};

// Helper function to check if token is expired or about to expire
const isTokenExpiredOrExpiringSoon = (): boolean => {
  if (typeof window === "undefined") return true;

  const expiresAt = localStorage.getItem("bc_session_expires_at");
  if (!expiresAt) return true;

  const expirationTime = parseInt(expiresAt, 10);
  const now = Date.now();
  const timeUntilExpiration = expirationTime - now;

  // Return true if expired or will expire within the buffer time
  return timeUntilExpiration <= TOKEN_REFRESH_BUFFER_MS;
};

// Helper function to refresh the session token
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const refreshSessionToken = async (): Promise<string | null> => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const storeHash = getStoreHash();
      if (!storeHash) {
        console.error("❌ Cannot refresh token: store hash not found");
        return null;
      }

      console.log("🔄 Refreshing session token...");
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeHash }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error("❌ Error refreshing token:", errorBody);
        throw new Error(
          errorBody.message || errorBody.error || "Failed to refresh token",
        );
      }

      const result = await response.json();
      const { sessionToken, sessionExpiresAt } = result;

      // Update localStorage with new token
      localStorage.setItem("bc_session_token", sessionToken);
      localStorage.setItem(
        "bc_session_expires_at",
        sessionExpiresAt.toString(),
      );

      console.log("✅ Session token refreshed successfully");
      return sessionToken;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      // Clear expired token on refresh failure
      localStorage.removeItem("bc_session_token");
      localStorage.removeItem("bc_session_expires_at");
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Helper function to ensure token is valid before making API calls
const ensureValidToken = async (): Promise<boolean> => {
  if (isTokenExpiredOrExpiringSoon()) {
    const newToken = await refreshSessionToken();
    return newToken !== null;
  }
  return true;
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

// Enhanced fetch wrapper that handles token refresh and retry
const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  retryCount = 0,
): Promise<Response> => {
  const maxRetries = 1;

  // Ensure token is valid before making the request
  await ensureValidToken();

  // Build headers - preserve existing headers but add auth
  const headers = new Headers(options.headers);
  const authHeaders = getAuthHeaders(
    options.body instanceof FormData ? false : true,
  );
  Object.entries(authHeaders).forEach(([key, value]) => {
    if (value) {
      headers.set(key, value as string);
    }
  });

  // Make the request with current token
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error: any) {
    // Handle network errors (CORS, server down, etc.)
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      console.error("❌ Network error:", {
        url,
        error: error.message,
        message: "Backend server may not be running or there's a CORS issue",
      });
      throw error;
    }
    throw error;
  }

  // If we get a 401, try refreshing the token and retry once
  if (response.status === 401 && retryCount < maxRetries) {
    console.log("🔄 Received 401, refreshing token and retrying...");
    const newToken = await refreshSessionToken();

    if (newToken) {
      // Update auth headers with new token
      const newAuthHeaders = getAuthHeaders(
        options.body instanceof FormData ? false : true,
      );
      const retryHeaders = new Headers(options.headers);
      Object.entries(newAuthHeaders).forEach(([key, value]) => {
        if (value) {
          retryHeaders.set(key, value as string);
        }
      });

      // Retry the request with the new token
      response = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });
    }
  }

  return response;
};

export async function getStoreInfo(storeHash: string) {
  const response = await fetch(`${API_URL}/api/store/${storeHash}`);
  if (!response.ok) throw new Error("Failed to fetch store");
  return response.json();
}

// Helper function to get store ID from localStorage
export function getStoreId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bc_store_id");
}

// Fetch channels for a store
export async function getChannels(storeId: string): Promise<{
  channels: Channel[];
  storeCurrency: string | null;
}> {
  console.log("📥 Fetching channels for store:", storeId);

  const response = await fetchWithAuth(
    `${API_URL}/api/channels?storeId=${storeId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching channels:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch channels",
    );
  }

  const result = await response.json();
  console.log("✅ Channels fetched successfully:", result);

  // Handle both array response and object with channels property
  if (result.channels && Array.isArray(result.channels)) {
    return {
      channels: result.channels,
      storeCurrency: result.storeCurrency ?? "USD",
    };
  }
  if (Array.isArray(result)) {
    return { channels: result, storeCurrency: "USD" };
  }
  if (result.data && Array.isArray(result.data)) {
    return {
      channels: result.data,
      storeCurrency: result.storeCurrency ?? "USD",
    };
  }
  return { channels: [], storeCurrency: "USD" };
}

export type Channel = {
  id: string | null; // MongoDB ObjectId (null if not yet synced to database)
  channel_id: number; // BigCommerce channel ID
  channel_name: string | null;
  channel_type?: string | null;
  platform?: string | null;
  status?: string | null;
  setupprogress?: number; // Setup progress (0-4)
  pointsTierSystemCompleted?: boolean;
  waysToEarnCompleted?: boolean;
  waysToRedeemCompleted?: boolean;
  customiseWidgetCompleted?: boolean;
  widget_visibility?: boolean;
  default_currency?: string | null; // Channel currency (e.g. INR, USD) for "per X spent" label
  site_url?: string | null; // Channel site URL (e.g. https://store.com)
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
  signedPayload: string,
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
  _id?: string; // MongoDB ObjectId for the tier
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
  logoFile?: File,
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
      JSON.stringify(pointData.customPointName),
    );
  }

  if (pointData.tier && pointData.tier.length > 0) {
    formData.append("tier", JSON.stringify(pointData.tier));
  }

  console.log("📤 Saving points:", { storeId, channelId, pointData });

  const response = await fetchWithAuth(`${API_URL}/api/points`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error saving points:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to save points",
    );
  }

  const result = await response.json();
  console.log("✅ Points saved successfully:", result);
  return result;
}

export async function updatePoints(
  pointId: string,
  pointData: PointData,
  logoFile?: File,
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
      JSON.stringify(pointData.customPointName),
    );
  }

  if (pointData.tier && pointData.tier.length > 0) {
    formData.append("tier", JSON.stringify(pointData.tier));
  }

  console.log("📤 Updating points:", { pointId, pointData });

  const response = await fetchWithAuth(`${API_URL}/api/points/${pointId}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error updating points:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to update points",
    );
  }

  const result = await response.json();
  console.log("✅ Points updated successfully:", result);
  return result;
}

export async function getPoints(
  storeId: string,
  channelId: string,
): Promise<PointData | null> {
  console.log("📥 Fetching points:", { storeId, channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/points?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.log("ℹ️ No points configuration found");
      return null;
    }
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching points:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch points",
    );
  }

  const result = await response.json();
  console.log("✅ Points fetched successfully:", result);
  return result;
}

// Collect Settings Types
export interface CollectSettingsData {
  basic?: {
    signup?: { active: boolean; point: number };
    spent?: { active: boolean; point: number };
    birthday?: { active: boolean; point: number };
    subucribing?: { active: boolean; point: number };
    profileComplition?: { active: boolean; point: number };
  };
  event?: {
    events?: Array<{
      name: string;
      type: string;
      eventDate: Date | string;
      point: number;
    }>;
    active?: boolean;
  };
  referAndEarn?: {
    active: boolean;
    point: number;
  };
  socialMedia?: {
    active: boolean;
  };
  goal?: {
    active: boolean;
  };
  rejoin?: {
    active: boolean;
    dayOfRecall: number;
    pointRejoin: number;
  };
  emailSetting?: any; // Can be expanded later
}

export async function saveCollectSettings(
  storeId: string,
  channelId: string,
  settingsData: CollectSettingsData,
): Promise<{
  success: boolean;
  message: string;
  data?: any;
  eventProcessing?: any;
}> {
  console.log("📤 Saving collect settings:", {
    storeId,
    channelId,
    settingsData,
  });

  const response = await fetchWithAuth(`${API_URL}/api/collect-settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      storeId,
      channelId,
      ...settingsData,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error saving collect settings:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to save collect settings",
    );
  }

  const result = await response.json();
  console.log("✅ Collect settings saved successfully:", result);
  return result;
}

export async function getCollectSettings(
  storeId: string,
  channelId: string,
): Promise<CollectSettingsData | null> {
  console.log("📥 Fetching collect settings:", { storeId, channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/collect-settings?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.log("ℹ️ No collect settings found");
      return null;
    }
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching collect settings:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to fetch collect settings",
    );
  }

  const result = await response.json();
  console.log("✅ Collect settings fetched successfully:", result);
  return result;
}

// Redeem Settings Types
export interface RedeemCoupon {
  _id?: string;
  store_id?: string;
  channel_id?: string;
  redeemType:
    | "purchase"
    | "freeShipping"
    | "freeProduct"
    | "storeCredit"
    | "orderPoint";
  coupon?: {
    active: boolean;
    price_rule_id?: string;
    target_type?: string;
    name?: string;
    lowerCaseName?: string;
    value?: number;
    discountAmount?: number;
    expire?: string | null;
    hasExpiry?: boolean;
    restriction?: {
      status?: boolean;
      maxReduption?: {
        status?: boolean;
        value?: number;
      };
      selectedCustomber?: {
        status?: boolean;
        tier?: Array<{
          status: boolean;
          name: string;
          tierId: string;
          tierIndex: number;
        }>;
        tag?: Array<{
          status: boolean;
          name: string;
          tagId: string;
        }>;
      };
      selectedItems?: {
        status?: boolean;
        items?: Array<{
          types: string;
          value: string;
          imgUrl: string;
          pointRequired: string;
          itemUrl: string;
          ids: string;
          price: string;
          variantId: string;
          productId: string;
        }>;
      };
      selectedCollections?: {
        status?: boolean;
        collections?: Array<{
          value: string;
          imgUrl: string;
          collectionUrl: string;
          ids: string;
          pointRequired: string;
        }>;
      };
      minimumPurchaseAmount?: {
        status?: boolean;
        value?: number;
      };
      createdAt?: Date | string;
      updatedAt?: Date | string;
    };
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  OrderFromPoint?: {
    status?: boolean;
    pointValue?: number;
    amount?: number;
    currencyCode?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export async function getRedeemSettings(
  storeId: string,
  channelId: string,
): Promise<RedeemCoupon[]> {
  console.log("📥 Fetching redeem settings:", { storeId, channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/redeem-settings?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.log("ℹ️ No redeem settings found");
      return [];
    }
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching redeem settings:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch redeem settings",
    );
  }

  const result = await response.json();
  console.log("✅ Redeem settings fetched successfully:", result);

  // Ensure we always return an array
  return Array.isArray(result) ? result : [];
}

export interface CreateRedeemCouponData {
  redeemType:
    | "purchase"
    | "freeShipping"
    | "freeProduct"
    | "storeCredit"
    | "orderPoint";
  target_type?: string;
  pointValue: number;
  discountAmount?: number;
  expire?: string | null;
  selectedItems?: Array<{
    value: string;
    type: string;
    src: string;
    pointRequired: string;
    productUrl: string;
    ids: string;
    price: string;
    variantId: string;
    productId: string;
  }>;
  selectedCollections?: Array<{
    value: string;
    src: string;
    collectionUrl: string;
    ids: string;
    pointRequired: string;
  }>;
  seletedCust?: {
    tier: Array<{
      status: boolean;
      name: string;
      tierId: string;
      tierIndex: number;
    }>;
    tag: Array<{
      status: boolean;
      name: string;
      tagId: string;
    }>;
  };
  seletedCustDisable?: boolean;
  seletedProductDisable?: boolean;
  currentRestrictionType?: "product" | "collection";
  onlineStoreDashBoardDisable?: boolean;
  redemptionLimitDisable?: boolean;
  redemptionLimit?: number;
  minimumnPurchaseAmount?: number;
  minimumnPurchaseAmountDisable?: boolean;
}

export async function createRedeemCoupon(
  storeId: string,
  channelId: string,
  couponData: CreateRedeemCouponData,
): Promise<{ success: boolean; message: string; data?: any }> {
  console.log("📤 Creating redeem coupon:", { storeId, channelId, couponData });

  const response = await fetchWithAuth(`${API_URL}/api/redeem-settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      storeId,
      channelId,
      ...couponData,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error creating redeem coupon:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to create redeem coupon",
    );
  }

  const result = await response.json();
  console.log("✅ Redeem coupon created successfully:", result);
  return result;
}

export async function updateRedeemCoupon(
  couponId: string,
  storeId: string,
  channelId: string,
  couponData: Partial<CreateRedeemCouponData>,
): Promise<{ success: boolean; message: string }> {
  console.log("📤 Updating redeem coupon:", {
    couponId,
    storeId,
    channelId,
    couponData,
  });

  const response = await fetchWithAuth(`${API_URL}/api/redeem-settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      couponId,
      storeId,
      channelId,
      ...couponData,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error updating redeem coupon:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to update redeem coupon",
    );
  }

  const result = await response.json();
  console.log("✅ Redeem coupon updated successfully:", result);
  return result;
}

export async function toggleCouponStatus(
  couponId: string,
  active: boolean,
): Promise<{ success: boolean; message: string; data?: any }> {
  console.log("📤 Toggling coupon status:", { couponId, active });

  try {
    const response = await fetchWithAuth(
      `${API_URL}/api/redeem-settings/toggle-status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponId,
          active,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("❌ Error toggling coupon status:", errorBody);
      throw new Error(
        errorBody.message ||
          errorBody.error ||
          "Failed to toggle coupon status",
      );
    }

    const result = await response.json();
    console.log("✅ Coupon status toggled successfully:", result);
    return result;
  } catch (error: any) {
    // Handle network errors
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      console.error(
        "❌ Network error - Backend server may not be running or CORS issue",
      );
      throw new Error(
        "Unable to connect to server. Please check if the backend server is running.",
      );
    }
    throw error;
  }
}

export async function deleteRedeemCoupon(
  couponId: string,
): Promise<{ success: boolean; message: string }> {
  console.log("📤 Deleting redeem coupon:", { couponId });

  try {
    const response = await fetchWithAuth(`${API_URL}/api/redeem-settings`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        couponId,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("❌ Error deleting redeem coupon:", errorBody);
      throw new Error(
        errorBody.message ||
          errorBody.error ||
          "Failed to delete redeem coupon",
      );
    }

    const result = await response.json();
    console.log("✅ Redeem coupon deleted successfully:", result);
    return result;
  } catch (error: any) {
    // Handle network errors
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      console.error(
        "❌ Network error - Backend server may not be running or CORS issue",
      );
      throw new Error(
        "Unable to connect to server. Please check if the backend server is running.",
      );
    }
    throw error;
  }
}

// Product Types
export interface BigCommerceProduct {
  id: number;
  name: string;
  sku: string;
  price: string;
  description: string;
  imageUrl: string;
  url: string;
  isVisible: boolean;
  type: string;
}

export interface ProductsResponse {
  success: boolean;
  data: BigCommerceProduct[];
  meta?: {
    pagination?: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}

export async function getProducts(
  storeId: string,
  channelId: string | null,
  keyword?: string,
  limit: number = 50,
  page: number = 1,
): Promise<ProductsResponse> {
  console.log("📥 Fetching products:", {
    storeId,
    channelId,
    keyword,
    limit,
    page,
  });

  const queryParams = new URLSearchParams({
    storeId,
    limit: limit.toString(),
    page: page.toString(),
  });

  if (channelId) {
    queryParams.append("channelId", channelId);
  }

  if (keyword && keyword.trim()) {
    queryParams.append("keyword", keyword.trim());
  }

  const response = await fetchWithAuth(
    `${API_URL}/api/products?${queryParams.toString()}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching products:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch products",
    );
  }

  const result = await response.json();
  console.log("✅ Products fetched successfully:", result);
  return result;
}

// Widget Customization Types
export interface WidgetCustomization {
  _id?: string;
  store_id?: string;
  channel_id?: string;
  widgetIconUrlId?: string | null;
  widgetIconColor?: string | null;
  widgetBgColor?: string;
  headingColor?: string;
  LauncherType?: "IconOnly" | "LabelOnly" | "Icon&Label";
  Label?: string | null;
  backgroundPatternEnabled?: boolean;
  widgetButton?: string;
  announcements?: Array<{
    _id?: string;
    enable: boolean;
    image: string | null;
    link: string | null;
  }>;
  displayOption?: Array<{
    _id?: string;
    label: string;
    enable: boolean;
  }>;
  backgroundPatternUrlId?: string | null;
  metaData?: {
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateWidgetCustomizationData {
  storeId: string;
  channelId: string;
  widgetIconUrlId?: string | null;
  widgetIconColor?: string | null;
  widgetBgColor?: string;
  headingColor?: string;
  LauncherType?: "IconOnly" | "LabelOnly" | "Icon&Label";
  Label?: string | null;
  backgroundPatternEnabled?: boolean;
  widgetButton?: string;
  announcements?: Array<{
    enable: boolean;
    image: string | null;
    link: string | null;
  }>;
  displayOption?: Array<{
    label: string;
    enable: boolean;
  }>;
  backgroundPatternUrlId?: string | null;
}

// Get widget customization
export async function getWidgetCustomization(
  storeId: string,
  channelId: string,
): Promise<WidgetCustomization | null> {
  console.log("📥 Fetching widget customization:", { storeId, channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/widget-customization?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.log("ℹ️ No widget customization found");
      return null;
    }
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching widget customization:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to fetch widget customization",
    );
  }

  const result = await response.json();
  console.log("✅ Widget customization fetched successfully:", result);
  return result;
}

// Create or update widget customization
export async function saveWidgetCustomization(
  storeId: string,
  channelId: string,
  widgetData: Omit<CreateWidgetCustomizationData, "storeId" | "channelId">,
): Promise<{ success: boolean; message: string; data?: WidgetCustomization }> {
  console.log("📤 Saving widget customization:", {
    storeId,
    channelId,
    widgetData,
  });

  const response = await fetchWithAuth(`${API_URL}/api/widget-customization`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      storeId,
      channelId,
      ...widgetData,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error saving widget customization:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to save widget customization",
    );
  }

  const result = await response.json();
  console.log("✅ Widget customization saved successfully:", result);
  return result;
}

// Update widget customization
export async function updateWidgetCustomization(
  storeId: string,
  channelId: string,
  widgetData: Partial<
    Omit<CreateWidgetCustomizationData, "storeId" | "channelId">
  >,
): Promise<{ success: boolean; message: string; data?: WidgetCustomization }> {
  console.log("📤 Updating widget customization:", {
    storeId,
    channelId,
    widgetData,
  });

  const response = await fetchWithAuth(`${API_URL}/api/widget-customization`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      storeId,
      channelId,
      ...widgetData,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error updating widget customization:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to update widget customization",
    );
  }

  const result = await response.json();
  console.log("✅ Widget customization updated successfully:", result);
  return result;
}

// Delete widget customization
export async function deleteWidgetCustomization(
  storeId: string,
  channelId: string,
): Promise<{ success: boolean; message: string }> {
  console.log("📤 Deleting widget customization:", { storeId, channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/widget-customization?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error deleting widget customization:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to delete widget customization",
    );
  }

  const result = await response.json();
  console.log("✅ Widget customization deleted successfully:", result);
  return result;
}

// Setup Progress Functions
// Note: setupprogress is now calculated automatically from the 4 completion status fields
// This function recalculates it based on current completion status
export async function updateSetupProgress(
  channelId: string,
  progress?: number, // Optional, kept for backward compatibility but ignored
): Promise<{ success: boolean; message: string; data?: any }> {
  console.log("📤 Updating setup progress (auto-calculated):", { channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/channels/setup-progress`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error updating setup progress:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to update setup progress",
    );
  }

  const result = await response.json();
  console.log("✅ Setup progress updated successfully:", result);
  return result;
}

export async function getSetupProgress(channelId: string): Promise<{
  success: boolean;
  data?: { channelId: string; setupprogress: number };
}> {
  console.log("📥 Fetching setup progress:", { channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/channels/setup-progress?channelId=${channelId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching setup progress:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch setup progress",
    );
  }

  const result = await response.json();
  console.log("✅ Setup progress fetched successfully:", result);
  return result;
}

// Update page completion status
export async function updatePageCompletionStatus(
  channelId: string,
  pageType:
    | "pointsTierSystem"
    | "waysToEarn"
    | "waysToRedeem"
    | "customiseWidget",
  completed: boolean,
): Promise<{ success: boolean; message: string; data?: any }> {
  console.log("📤 Updating page completion status:", {
    channelId,
    pageType,
    completed,
  });

  const response = await fetchWithAuth(
    `${API_URL}/api/channels/page-completion`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId,
        pageType,
        completed: completed ? 1 : 0,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error updating page completion status:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to update page completion status",
    );
  }

  const result = await response.json();
  console.log("✅ Page completion status updated successfully:", result);
  return result;
}

// Update widget visibility for a channel (enable/disable widget)
export async function updateWidgetVisibilityApi(
  channelId: string,
  visible: boolean,
): Promise<{ success: boolean; message: string; data?: any }> {
  console.log("📤 Updating widget visibility:", { channelId, visible });

  const response = await fetchWithAuth(`${API_URL}/api/widget/visibility`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channelId,
      visible,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error updating widget visibility:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to update widget visibility",
    );
  }

  const result = await response.json();
  console.log("✅ Widget visibility updated successfully:", result);
  return result;
}

// Reset all channel settings to default (post-installation state)
export async function resetChannelSettingsApi(channelId: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    channelId: string;
    setupprogress: number;
    pointsTierSystemCompleted: boolean;
    waysToEarnCompleted: boolean;
    waysToRedeemCompleted: boolean;
    customiseWidgetCompleted: boolean;
    widget_visibility: boolean;
  };
}> {
  const response = await fetchWithAuth(
    `${API_URL}/api/channels/reset-settings`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to reset channel settings",
    );
  }

  return response.json();
}

// Email Template Types
export interface EmailTemplate {
  _id?: string;
  channel_id?: string;
  templateType: string;
  name: string;
  heading: string;
  imageUrl: string;
  body: string;
  emailTemplate: string;
  options?: string[];
  metaData?: {
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
}

// Get email template by type
export async function getEmailTemplateByType(
  channelId: string,
  templateType: string,
): Promise<EmailTemplate | null> {
  console.log("📥 Fetching email template:", { channelId, templateType });

  const response = await fetchWithAuth(
    `${API_URL}/api/email-templates/by-type?channelId=${channelId}&templateType=${templateType}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.log("ℹ️ No email template found");
      return null;
    }
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching email template:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch email template",
    );
  }

  const result = await response.json();
  console.log("✅ Email template fetched successfully:", result);
  return result.data || result;
}

// Update email template
export async function updateEmailTemplate(
  channelId: string,
  templateType: string,
  templateData: Partial<EmailTemplate>,
  bannerImageFile?: File,
): Promise<EmailTemplate> {
  console.log("📤 Updating email template:", {
    channelId,
    templateType,
    templateData,
    hasBannerImage: !!bannerImageFile,
  });

  // If there's a banner image file, use FormData
  if (bannerImageFile) {
    const formData = new FormData();
    formData.append("channelId", channelId);
    formData.append("templateType", templateType);
    formData.append("bannerImage", bannerImageFile);

    // Append other template data as JSON string
    Object.keys(templateData).forEach((key) => {
      const value = templateData[key as keyof EmailTemplate];
      if (value !== undefined && value !== null) {
        if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetchWithAuth(`${API_URL}/api/email-templates`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("❌ Error updating email template:", errorBody);
      throw new Error(
        errorBody.message ||
          errorBody.error ||
          "Failed to update email template",
      );
    }

    const result = await response.json();
    console.log("✅ Email template updated successfully:", result);
    return result.data || result;
  } else {
    // No file upload, use JSON
    const response = await fetchWithAuth(`${API_URL}/api/email-templates`, {
      method: "PUT",
      body: JSON.stringify({
        channelId,
        templateType,
        ...templateData,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("❌ Error updating email template:", errorBody);
      throw new Error(
        errorBody.message ||
          errorBody.error ||
          "Failed to update email template",
      );
    }

    const result = await response.json();
    console.log("✅ Email template updated successfully:", result);
    return result.data || result;
  }
}

// Store Plan Types
export interface StorePlan {
  plan: "free" | "paid";
  trialDaysRemaining: number | null;
  paypalSubscriptionId: string | null;
  // Subscription limit info
  limitReached: boolean;
  orderCount: number;
  selectedOrderLimit: number;
}

// Get store plan information
export async function getStorePlan(): Promise<StorePlan> {
  console.log("📥 Fetching store plan...");

  const response = await fetchWithAuth(`${API_URL}/api/store/plan`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching store plan:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch store plan",
    );
  }

  const result = await response.json();
  console.log("✅ Store plan fetched successfully:", result);
  return result.data || result;
}

// Downgrade store to free plan
export async function downgradeToFree(): Promise<StorePlan> {
  console.log("📥 Downgrading to free plan...");

  const response = await fetchWithAuth(
    `${API_URL}/api/store/downgrade-to-free`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error downgrading plan:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to downgrade plan",
    );
  }

  const result = await response.json();
  console.log("✅ Plan downgraded successfully:", result);
  return result.data || result;
}

// Customer Types
export interface CustomerProfile {
  name?: string | null;
  contactNo?: string | null;
  ageGroup?: string | null;
  gender?: string | null;
  weddingAnniversary?: Date | string | null;
  dateOfBirth?: Date | string | null;
}

export interface CustomerAddress {
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  company?: string | null;
  country?: string | null;
  zip?: string | null;
  province?: string | null;
  default?: boolean;
}

export interface Customer {
  id: string;
  email: string;
  shop: string | null;
  firstName: string | null;
  lastName: string | null;
  points: number;
  pointsEarned: number;
  pointsRedeemed: number;
  ordersCount: number;
  totalSpent: number;
  joiningDate: Date | string;
  lastVisit: Date | string | null;
  currentTier: {
    tierIndex: number;
    multiplier: number;
    minPointsRequired: number;
    maxPoints: number | null;
  };
  tierDisplay?: string; // "None" if tier system is off, otherwise tier name
  tierStatus?: boolean; // Whether tier system is enabled for this channel
  tierOptions?: {
    maxTierIndex: number;
    tiers: { tierIndex: number; tierName: string }[];
  } | null;
  profile?: CustomerProfile;
  dob?: Date | string | null;
  default_address?: CustomerAddress;
  tags: string[];
  storeId: string;
  channelId: number;
  refferalCount?: number; // Note: typo in backend model (refferalCount)
  referral_points?: number; // Points earned through referrals
  bcCustomerId?: number | null; // BigCommerce customer ID
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Transaction Types
export type TransactionType =
  | "earn"
  | "redeem"
  | "adjustment"
  | "referral"
  | "signup"
  | "expiration"
  | "refund";
export type TransactionCategory =
  | "order"
  | "manual"
  | "referral"
  | "signup"
  | "expiration"
  | "refund"
  | "other";
export type TransactionStatus =
  | "pending"
  | "completed"
  | "expired"
  | "cancelled"
  | "failed";

export interface Transaction {
  id: string;
  customerId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  storeId: string;
  channelId: number;
  bcCustomerId: number;
  type: TransactionType;
  transactionCategory: TransactionCategory;
  points: number; // Positive for earn, negative for redeem
  description: string;
  reason?: string | null;
  status: TransactionStatus;
  expiresAt?: Date | string | null;
  notificationSent: boolean;
  adminUserId?: string | null;
  source: string;
  metadata?: Record<string, any>;
  relatedTransactionId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction;
}

export interface CreateTransactionRequest {
  customerId: string;
  storeId: string;
  channelId: number;
  type: TransactionType;
  transactionCategory?: TransactionCategory;
  points: number;
  description: string;
  reason?: string;
  status?: TransactionStatus;
  expiresAt?: Date | string;
  adminUserId?: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FetchCustomersResponse {
  success: boolean;
  message: string;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  source?: "database" | "bigcommerce";
  syncStats?: {
    totalFetched: number;
    stored: number;
    updated: number;
    errors: number;
    skipped: number;
  };
}

// Fetch customers from BigCommerce and store in database
export async function fetchAndStoreCustomers(
  storeId: string,
  channelId: number,
): Promise<FetchCustomersResponse> {
  console.log("📥 Fetching and storing customers:", { storeId, channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/customers/fetch?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching and storing customers:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to fetch and store customers",
    );
  }

  const result = await response.json();
  console.log("✅ Customers fetched and stored successfully:", result);
  return result;
}

// Get customers from database
export async function getCustomers(
  storeId: string,
  channelId: number,
  page: number = 1,
  limit: number = 50,
): Promise<CustomersResponse> {
  console.log("📥 Fetching customers:", { storeId, channelId, page, limit });

  // Validate required parameters
  if (!storeId) {
    throw new Error("Store ID is required");
  }

  if (channelId === undefined || channelId === null) {
    throw new Error("Channel ID is required");
  }

  const queryParams = new URLSearchParams({
    storeId,
    channelId: channelId.toString(),
    page: page.toString(),
    limit: limit.toString(),
  });

  try {
    const response = await fetchWithAuth(
      `${API_URL}/api/customers?${queryParams.toString()}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("❌ Error fetching customers:", errorBody);
      throw new Error(
        errorBody.message || errorBody.error || "Failed to fetch customers",
      );
    }

    const result = await response.json();
    console.log("✅ Customers fetched successfully:", result);
    return result;
  } catch (error: any) {
    // Handle network errors
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      console.error(
        "❌ Network error - Backend server may not be running or CORS issue",
      );
      throw new Error(
        `Unable to connect to backend server at ${API_URL}. Please check if the backend server is running.`,
      );
    }
    throw error;
  }
}

// Get single customer by ID
export async function getCustomerById(
  customerId: string,
): Promise<{ success: boolean; data: Customer }> {
  console.log("📥 Fetching customer:", { customerId });

  const response = await fetchWithAuth(
    `${API_URL}/api/customers/${customerId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching customer:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch customer",
    );
  }

  const result = await response.json();
  console.log("✅ Customer fetched successfully:", result);
  return result;
}

export interface CustomerReferral {
  name: string;
  email: string;
  points: number;
}

export async function getCustomerReferrals(
  customerId: string,
): Promise<{ success: boolean; data: CustomerReferral[] }> {
  const response = await fetchWithAuth(
    `${API_URL}/api/customers/${customerId}/referrals`,
    { method: "GET" },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to fetch customer referrals",
    );
  }

  return response.json();
}

/**
 * Update customer tier (upgrade only). Fails if tierIndex is not higher than current.
 */
export async function updateCustomerTier(
  customerId: string,
  tierIndex: number,
): Promise<{
  success: boolean;
  data: { id: string; currentTier: object; tierDisplay: string };
}> {
  const response = await fetchWithAuth(
    `${API_URL}/api/customers/${customerId}/tier`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tierIndex }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || "Failed to update customer tier",
    );
  }

  const result = await response.json();
  console.log("✅ Customer tier updated successfully:", result);
  return result;
}

// Transaction API Functions

/**
 * Get all transactions with filters
 */
export async function getTransactions(
  storeId: string,
  options?: {
    channelId?: number;
    customerId?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    transactionCategory?: TransactionCategory;
    page?: number;
    limit?: number;
  },
): Promise<TransactionsResponse> {
  if (!storeId) {
    throw new Error("storeId is required");
  }

  const params = new URLSearchParams({
    storeId,
    page: String(options?.page || 1),
    limit: String(options?.limit || 50),
  });

  if (options?.channelId) {
    params.append("channelId", String(options.channelId));
  }
  if (options?.customerId) {
    params.append("customerId", options.customerId);
  }
  if (options?.type) {
    params.append("type", options.type);
  }
  if (options?.status) {
    params.append("status", options.status);
  }
  if (options?.transactionCategory) {
    params.append("transactionCategory", options.transactionCategory);
  }

  const response = await fetchWithAuth(
    `${API_URL}/api/transactions?${params.toString()}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to fetch transactions");
  }

  return await response.json();
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(
  transactionId: string,
): Promise<TransactionResponse> {
  const response = await fetchWithAuth(
    `${API_URL}/api/transactions/${transactionId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to fetch transaction");
  }

  return await response.json();
}

/**
 * Create a new transaction (for manual adjustments)
 */
export async function createTransaction(
  transactionData: CreateTransactionRequest,
): Promise<TransactionResponse> {
  const response = await fetchWithAuth(`${API_URL}/api/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to create transaction");
  }

  return await response.json();
}

/**
 * Get customer transaction history
 */
export async function getCustomerTransactions(
  customerId: string,
  options?: {
    type?: TransactionType;
    status?: TransactionStatus;
    transactionCategory?: TransactionCategory;
    page?: number;
    limit?: number;
  },
): Promise<TransactionsResponse> {
  if (!customerId) {
    throw new Error("customerId is required");
  }

  const params = new URLSearchParams({
    page: String(options?.page || 1),
    limit: String(options?.limit || 50),
  });

  if (options?.type) {
    params.append("type", options.type);
  }
  if (options?.status) {
    params.append("status", options.status);
  }
  if (options?.transactionCategory) {
    params.append("transactionCategory", options.transactionCategory);
  }

  const response = await fetchWithAuth(
    `${API_URL}/api/transactions/customer/${customerId}?${params.toString()}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || "Failed to fetch customer transactions",
    );
  }

  return await response.json();
}

/**
 * Recalculate customer tiers based on updated tier settings
 * This is automatically called when tier settings are saved, but can be manually triggered if needed
 */
export async function recalculateCustomerTiers(
  storeId: string,
  channelId: string,
): Promise<{
  success: boolean;
  message: string;
  data: { updated: number; unchanged: number; total: number };
}> {
  if (!storeId || !channelId) {
    throw new Error("storeId and channelId are required");
  }

  const response = await fetchWithAuth(
    `${API_URL}/api/customers/recalculate-tiers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeId,
        channelId,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || "Failed to recalculate customer tiers",
    );
  }

  return await response.json();
}

/**
 * Bulk import customer points from CSV data
 */
export interface BulkImportCustomer {
  email: string;
  points: number;
}

export interface BulkImportRequest {
  storeId: string;
  channelId: number;
  importType: "add" | "reset";
  customers: BulkImportCustomer[];
}

export interface BulkImportResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    success: number;
    failed: number;
    notFound: number;
    errors: Array<{
      email: string;
      error: string;
    }>;
  };
}

export async function bulkImportPoints(
  request: BulkImportRequest,
): Promise<BulkImportResponse> {
  const { storeId, channelId, importType, customers } = request;

  if (
    !storeId ||
    !channelId ||
    !importType ||
    !customers ||
    !Array.isArray(customers)
  ) {
    throw new Error(
      "Missing required fields: storeId, channelId, importType, customers",
    );
  }

  const response = await fetchWithAuth(
    `${API_URL}/api/transactions/bulk-import`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeId,
        channelId,
        importType,
        customers,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to import points");
  }

  return await response.json();
}

// Points Awarded Statistics Types
export interface PointsAwardedStat {
  transactionName: string;
  totalPointsCurrent: number;
  totalPointsPrevious: number;
  growth: number;
}

export interface PointsAwardedStatsResponse {
  success: boolean;
  data: {
    totalPointsAwarded: number;
    stats: PointsAwardedStat[];
    totalPointsAwardedEquivalent: number;
  };
}

export interface PointsRedeemedStat {
  transactionName: string;
  totalPointsRedeemed: number;
  totalPointsRedeemedPrevious: number;
  growth: number;
}

export interface PointsRedeemedStatsResponse {
  success: boolean;
  data: {
    totalPointsRedeemed: number;
    totalPointsRedeemedEquivalent?: number;
    stats: PointsRedeemedStat[];
  };
}

/**
 * Get points redeemed statistics for dashboard
 */
export async function getPointsRedeemedStats(
  storeId: string,
  channelId: string,
  startDate: string,
  endDate: string,
): Promise<PointsRedeemedStatsResponse> {
  const queryParams = new URLSearchParams({
    storeId,
    channelId,
    startDate,
    endDate,
  });

  const response = await fetchWithAuth(
    `${API_URL}/api/transactions/points-redeemed-stats?${queryParams.toString()}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to fetch points redeemed stats",
    );
  }

  return response.json();
}

/**
 * Get points awarded statistics for dashboard
 */
export async function getPointsAwardedStats(
  storeId: string,
  channelId: string,
  startDate: string,
  endDate: string,
): Promise<PointsAwardedStatsResponse> {
  console.log("📥 Fetching points awarded stats:", {
    storeId,
    channelId,
    startDate,
    endDate,
  });

  const queryParams = new URLSearchParams({
    storeId,
    channelId,
    startDate,
    endDate,
  });

  const response = await fetchWithAuth(
    `${API_URL}/api/transactions/points-awarded-stats?${queryParams.toString()}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching points awarded stats:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to fetch points awarded stats",
    );
  }

  const result = await response.json();
  console.log("✅ Points awarded stats fetched successfully:", result);
  return result;
}

// Payment API Functions
export interface CreateOrderResponse {
  id: string;
}

export interface CapturePaymentResponse {
  success: boolean;
  payment: {
    id: string;
    status: string;
    amount: string;
    currency: string;
    payer: any;
  };
  amount: string;
  subscription?: {
    id: string;
    status: string;
    planId: string;
    storeId: string;
    nextBillingDate: string;
    trialEndsAt: string | null;
  } | null;
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(
  value: string,
  currency: string = "USD",
  userId?: string,
  channelId?: string,
  storeId?: string,
  returnUrl?: string,
  cancelUrl?: string,
): Promise<CreateOrderResponse> {
  console.log("📥 Creating PayPal order:", {
    value,
    currency,
    userId,
    channelId,
    storeId,
  });

  const response = await fetchWithAuth(`${API_URL}/api/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      value,
      currency,
      userId,
      channelId,
      storeId,
      returnUrl,
      cancelUrl,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error creating PayPal order:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to create PayPal order",
    );
  }

  const result = await response.json();
  console.log("✅ PayPal order created successfully:", result);
  return result;
}

/**
 * Capture a PayPal payment
 */
export async function capturePayPalPayment(
  orderID: string,
  storeId?: string,
  planId?: string,
  selectedOrderLimit?: number,
  billingInterval?: string,
): Promise<CapturePaymentResponse> {
  console.log("📥 Capturing PayPal payment:", {
    orderID,
    storeId,
    planId,
    selectedOrderLimit,
    billingInterval,
  });

  const response = await fetchWithAuth(
    `${API_URL}/api/payment/capture-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID,
        storeId,
        planId,
        selectedOrderLimit,
        billingInterval,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error capturing PayPal payment:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to capture PayPal payment",
    );
  }

  const result = await response.json();
  console.log("✅ PayPal payment captured successfully:", result);
  return result;
}

// ============================================
// Webhook API Functions
// ============================================

/**
 * Subscribe to a BigCommerce webhook
 */
export async function subscribeWebhook(
  scope: string,
  channelId?: string,
): Promise<{ status: boolean; message: string; data: any }> {
  const response = await fetchWithAuth(`${API_URL}/api/webhooks/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scope,
      channelId: channelId || null,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || "Failed to subscribe webhook",
    );
  }

  return await response.json();
}

/**
 * Get all webhooks for the current store
 */
export async function getAllWebhooks(): Promise<{
  status: boolean;
  message: string;
  data: any[];
}> {
  const response = await fetchWithAuth(`${API_URL}/api/webhooks`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch webhooks",
    );
  }

  return await response.json();
}

/**
 * Get webhook logs
 */
export async function getWebhookLogs(options?: {
  channelId?: string;
  scope?: string;
  limit?: number;
}): Promise<{
  status: boolean;
  message: string;
  data: any[];
  count: number;
}> {
  const params = new URLSearchParams();
  if (options?.channelId) params.append("channelId", options.channelId);
  if (options?.scope) params.append("scope", options.scope);
  if (options?.limit) params.append("limit", options.limit.toString());

  const url = `${API_URL}/api/webhooks/logs${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetchWithAuth(url, {
    method: "GET",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch webhook logs",
    );
  }

  return await response.json();
}

/**
 * Unsubscribe from a webhook
 */
export async function unsubscribeWebhook(
  webhookId: string,
): Promise<{ status: boolean; message: string }> {
  const response = await fetchWithAuth(`${API_URL}/api/webhooks/${webhookId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || "Failed to unsubscribe webhook",
    );
  }

  return await response.json();
}
