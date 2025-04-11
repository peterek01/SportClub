const API_BASE_URL = "http://127.0.0.1:5000/api";

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Login failed: ${errorMessage}`);
  }

  return response.json();
}

export async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  console.log("🔍 Refresh token sended:", refresh);

  if (!refresh || refresh === "undefined") {
    console.warn("No refresh token!");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refresh}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("Error refresh:", errorText);
      return null;
    }

    const data = await response.json();
    const newToken = data.access_token;
    const newRefresh = data.refresh_token;
    const role = data.role;

    if (newToken) {
      localStorage.setItem("token", newToken);
      if (newRefresh) localStorage.setItem("refresh_token", newRefresh);
      if (role) localStorage.setItem("role", role);

      const expiryTime = Date.now() + 5 * 60 * 1000;
      localStorage.setItem("tokenExpiry", expiryTime.toString());

      return newToken;
    }
    return null;
  } catch (error) {
    console.error("Network error on refresh:", error);
    return null;
  }
}

// // Function for authorization queries (JWT token)
// export async function fetchWithAutoRefresh(endpoint, options = {}) {
//   let token = localStorage.getItem("token");
//   if (!token) throw new Error("No authentication token found");
  
//   const buildHeaders = (tokenToUse) => ({
//     ...options.headers,
//     Authorization: `Bearer ${tokenToUse}`,
//     "Cache-Control": "no-cache",
//     Pragma: "no-cache",
//   });
  
//   const sendRequest = async (tokenToUse) => {
//     return await fetch(`${API_BASE_URL}/${endpoint}`, {
//       ...options,
//       headers: buildHeaders(tokenToUse),
//     });
//     return response;
//   };

//   let response = await sendRequest(token);

//   if (response.status === 401) {
//     const newToken = await refreshToken();

//     if (newToken) {
//       token = newToken;
//       response = await sendRequest(token);
//     } else {
//       throw new Error("Token expired and refresh failed");
//     }
//   }

//   if (!response.ok) {
//     throw new Error(`Request failed with status: ${response.status}`);
//   }

//   const text = await response.text();

//   try {
//     return JSON.parse(text);
//   } catch {
//       throw new Error("Invalid JSON response from server");
//   }
// }
