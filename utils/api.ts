const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://favbigcommerce.share.zrok.io";

export async function getStoreInfo(storeHash: string) {
  const response = await fetch(`${API_URL}/api/store/${storeHash}`);
  if (!response.ok) throw new Error("Failed to fetch store");
  return response.json();
}

export type LoginResponse = {
  sessionToken: string;
  sessionExpiresAt: number;
  store: {
    hash: string;
    userEmail: string;
    userId?: string;
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