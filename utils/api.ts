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
          errorBody.message || errorBody.error || "Failed to refresh token"
        );
      }

      const result = await response.json();
      const { sessionToken, sessionExpiresAt } = result;

      // Update localStorage with new token
      localStorage.setItem("bc_session_token", sessionToken);
      localStorage.setItem(
        "bc_session_expires_at",
        sessionExpiresAt.toString()
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
  retryCount = 0
): Promise<Response> => {
  const maxRetries = 1;

  // Ensure token is valid before making the request
  await ensureValidToken();

  // Build headers - preserve existing headers but add auth
  const headers = new Headers(options.headers);
  const authHeaders = getAuthHeaders(
    options.body instanceof FormData ? false : true
  );
  Object.entries(authHeaders).forEach(([key, value]) => {
    if (value) {
      headers.set(key, value as string);
    }
  });

  // Make the request with current token
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get a 401, try refreshing the token and retry once
  if (response.status === 401 && retryCount < maxRetries) {
    console.log("🔄 Received 401, refreshing token and retrying...");
    const newToken = await refreshSessionToken();

    if (newToken) {
      // Update auth headers with new token
      const newAuthHeaders = getAuthHeaders(
        options.body instanceof FormData ? false : true
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
export async function getChannels(storeId: string): Promise<Channel[]> {
  console.log("📥 Fetching channels for store:", storeId);

  const response = await fetchWithAuth(
    `${API_URL}/api/channels?storeId=${storeId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching channels:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch channels"
    );
  }

  const result = await response.json();
  console.log("✅ Channels fetched successfully:", result);

  // Handle both array response and object with channels property
  if (Array.isArray(result)) {
    return result;
  } else if (result.channels && Array.isArray(result.channels)) {
    return result.channels;
  } else if (result.data && Array.isArray(result.data)) {
    return result.data;
  }

  return [];
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

  const response = await fetchWithAuth(`${API_URL}/api/points`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error saving points:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to save points"
    );
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

  const response = await fetchWithAuth(`${API_URL}/api/points/${pointId}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error updating points:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to update points"
    );
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

  const response = await fetchWithAuth(
    `${API_URL}/api/points?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "GET",
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
  settingsData: CollectSettingsData
): Promise<{ success: boolean; message: string; data?: any }> {
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
      errorBody.message || errorBody.error || "Failed to save collect settings"
    );
  }

  const result = await response.json();
  console.log("✅ Collect settings saved successfully:", result);
  return result;
}

export async function getCollectSettings(
  storeId: string,
  channelId: string
): Promise<CollectSettingsData | null> {
  console.log("📥 Fetching collect settings:", { storeId, channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/collect-settings?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.log("ℹ️ No collect settings found");
      return null;
    }
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching collect settings:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch collect settings"
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
  channelId: string
): Promise<RedeemCoupon[]> {
  console.log("📥 Fetching redeem settings:", { storeId, channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/redeem-settings?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.log("ℹ️ No redeem settings found");
      return [];
    }
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching redeem settings:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch redeem settings"
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
  couponData: CreateRedeemCouponData
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
      errorBody.message || errorBody.error || "Failed to create redeem coupon"
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
  couponData: Partial<CreateRedeemCouponData>
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
      errorBody.message || errorBody.error || "Failed to update redeem coupon"
    );
  }

  const result = await response.json();
  console.log("✅ Redeem coupon updated successfully:", result);
  return result;
}

export async function toggleCouponStatus(
  couponId: string,
  active: boolean
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
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("❌ Error toggling coupon status:", errorBody);
      throw new Error(
        errorBody.message || errorBody.error || "Failed to toggle coupon status"
      );
    }

    const result = await response.json();
    console.log("✅ Coupon status toggled successfully:", result);
    return result;
  } catch (error: any) {
    // Handle network errors
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      console.error(
        "❌ Network error - Backend server may not be running or CORS issue"
      );
      throw new Error(
        "Unable to connect to server. Please check if the backend server is running."
      );
    }
    throw error;
  }
}

export async function deleteRedeemCoupon(
  couponId: string
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
        errorBody.message || errorBody.error || "Failed to delete redeem coupon"
      );
    }

    const result = await response.json();
    console.log("✅ Redeem coupon deleted successfully:", result);
    return result;
  } catch (error: any) {
    // Handle network errors
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      console.error(
        "❌ Network error - Backend server may not be running or CORS issue"
      );
      throw new Error(
        "Unable to connect to server. Please check if the backend server is running."
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
  page: number = 1
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
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching products:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch products"
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
  channelId: string
): Promise<WidgetCustomization | null> {
  console.log("📥 Fetching widget customization:", { storeId, channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/widget-customization?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "GET",
    }
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
        "Failed to fetch widget customization"
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
  widgetData: Omit<CreateWidgetCustomizationData, "storeId" | "channelId">
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
        "Failed to save widget customization"
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
  >
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
        "Failed to update widget customization"
    );
  }

  const result = await response.json();
  console.log("✅ Widget customization updated successfully:", result);
  return result;
}

// Delete widget customization
export async function deleteWidgetCustomization(
  storeId: string,
  channelId: string
): Promise<{ success: boolean; message: string }> {
  console.log("📤 Deleting widget customization:", { storeId, channelId });

  const response = await fetchWithAuth(
    `${API_URL}/api/widget-customization?storeId=${storeId}&channelId=${channelId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error deleting widget customization:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to delete widget customization"
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
  progress?: number // Optional, kept for backward compatibility but ignored
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
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error updating setup progress:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to update setup progress"
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
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching setup progress:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch setup progress"
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
  completed: boolean
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
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error updating page completion status:", errorBody);
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        "Failed to update page completion status"
    );
  }

  const result = await response.json();
  console.log("✅ Page completion status updated successfully:", result);
  return result;
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
  templateType: string
): Promise<EmailTemplate | null> {
  console.log("📥 Fetching email template:", { channelId, templateType });

  const response = await fetchWithAuth(
    `${API_URL}/api/email-templates/by-type?channelId=${channelId}&templateType=${templateType}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.log("ℹ️ No email template found");
      return null;
    }
    const errorBody = await response.json().catch(() => ({}));
    console.error("❌ Error fetching email template:", errorBody);
    throw new Error(
      errorBody.message || errorBody.error || "Failed to fetch email template"
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
  bannerImageFile?: File
): Promise<EmailTemplate> {
  console.log("📤 Updating email template:", { channelId, templateType, templateData, hasBannerImage: !!bannerImageFile });

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
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetchWithAuth(
      `${API_URL}/api/email-templates`,
      {
        method: "PUT",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("❌ Error updating email template:", errorBody);
      throw new Error(
        errorBody.message || errorBody.error || "Failed to update email template"
      );
    }

    const result = await response.json();
    console.log("✅ Email template updated successfully:", result);
    return result.data || result;
  } else {
    // No file upload, use JSON
    const response = await fetchWithAuth(
      `${API_URL}/api/email-templates`,
      {
        method: "PUT",
        body: JSON.stringify({
          channelId,
          templateType,
          ...templateData,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("❌ Error updating email template:", errorBody);
      throw new Error(
        errorBody.message || errorBody.error || "Failed to update email template"
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
      errorBody.message || errorBody.error || "Failed to fetch store plan"
    );
  }

  const result = await response.json();
  console.log("✅ Store plan fetched successfully:", result);
  return result.data || result;
}
