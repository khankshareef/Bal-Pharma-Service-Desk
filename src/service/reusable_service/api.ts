import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

const BaseUrl = import.meta.env.VITE_BASE_URL;

type Coords = { lat: number; lng: number };

let cachedCoords: Coords | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 30_000;
const GEO_TIMEOUT_MS = 5_000;

function getCoords(): Promise<Coords | null> {
  const now = Date.now();

  if (cachedCoords && now - lastFetchedAt < CACHE_TTL_MS) {
    return Promise.resolve(cachedCoords);
  }

  if (!navigator.geolocation) {
    return Promise.resolve(cachedCoords);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cachedCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        lastFetchedAt = Date.now();
        resolve(cachedCoords);
      },
      () => {
        resolve(cachedCoords);
      },
      {
        enableHighAccuracy: true,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: 15_000,
      }
    );
  });
}

const api = axios.create({
  baseURL: BaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const coords = await getCoords();
    if (coords) {
      config.headers["X-Client-Latitude"] = String(coords.lat);
      config.headers["X-Client-Longitude"] = String(coords.lng);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("EmployeeId");
    }

    if (status === 403 || status === 428) {
      const msg =
        error.response?.data?.error ||
        "You are outside your assigned location.";

      window.dispatchEvent(
        new CustomEvent("geo-blocked", { detail: { message: msg } })
      );
    }

    if (!error.response && error.code !== "ERR_CANCELED") {
      window.dispatchEvent(new Event("network-error"));
    }

    return Promise.reject(error);
  }
);

export const Reusable_Service = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
  },

  post: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
  },

  put: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  },

  patch: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response: AxiosResponse<T> = await api.patch(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  },
};

export default api;