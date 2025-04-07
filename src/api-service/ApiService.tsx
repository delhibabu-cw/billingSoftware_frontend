import axios, { AxiosResponse } from 'axios';
import {jwtDecode} from 'jwt-decode';
import toast from 'react-hot-toast';

// Error response interface
export interface AxiosErrorResponse {
  message: string;
  response?: {
    status: number;
    data: any;
    headers: any;
  };
  request?: any;
  config?: any;
  code?: string;
}

// Axios response interceptor
axios.interceptors.response.use(
  (response) =>
    new Promise((resolve) => {
      resolve(response);
    }),
  (error) => {
    console.log(error);

    if (error?.response?.status) {
      // Handle 422 error
      if (error?.response?.status === 422) {
        const errorMessage = capitalizeMessage(error.response.data?.error?.message || "An error occurred");
        toast.error(errorMessage);
      }

      // Handle 400 error
      if (error?.response?.status === 400) {
        const msg = error?.response?.data?.msg;
        const errorMessage = capitalizeMessage(
          typeof msg === "string" ? msg : msg?.message || "An error occurred"
        );
        toast.error(errorMessage);
        console.log(errorMessage);
      }

      // Handle 500 error
      if (error?.response?.status === 500) {
        console.log('500 error');
        const errorMessage = capitalizeMessage(error.response.data?.error || "An error occurred");
        toast.error(errorMessage);
      }

      // Handle 404 error
      if (error?.response?.status === 404) {
        console.log("404 error");

        let errorMessage = "The requested resource was not found.";
        if (typeof error.response.data === "string") {
          // Extract meaningful error message from HTML response
          const matchedMessage = error.response.data.match(/<pre>(.*?)<\/pre>/);
          errorMessage = matchedMessage?.[1] || errorMessage;
        } else if (error.response.data?.message) {
          // Use message from JSON response if available
          errorMessage = error.response.data.message;
        }

        toast.error(errorMessage);
        console.log("404 error message:", errorMessage);
      }

      // Handle network errors
      if (!error?.response) {
        return new Promise((reject) => {
          reject(error);
        });
      }

      // Handle 401 error
      if (error?.response?.status === 401) {
        return new Promise((reject) => {
          reject(error);
        });
      }
    } else {
      console.error("Error: No response from server", error);
      toast.error(capitalizeMessage("Network error, please try again later."));
    }

    return Promise.reject(error); // Ensure errors propagate
  }
);

// Utility function to capitalize error messages
function capitalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (match) => match.toUpperCase());
}

// Token management functions
export function setToken(token: string | null, refreshToken: string | null) {
  if (token && refreshToken) {
    localStorage.setItem('access-token', token);
    localStorage.setItem('refresh-token', refreshToken);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

export function removeToken() {
  delete axios.defaults.headers.common.Authorization;
  localStorage.removeItem('access-token');
  localStorage.removeItem('refresh-token');
}

// Get headers with authorization
function getHeaders() {
  const accessToken = localStorage.getItem('access-token');
  if (accessToken) {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }
  return undefined;
}

// API utility functions
const apiFunctions = {
  get: async (url: string): Promise<AxiosResponse['data']> => {
    return axios.get(url, getHeaders());
  },
  post: async (url: string, data: object): Promise<AxiosResponse['data']> => {
    return axios.post(url, data, getHeaders());
  },
  put: async (url: string, data: object): Promise<AxiosResponse['data']> => {
    return axios.put(url, data, getHeaders());
  },
  patch: async (url: string, data: object): Promise<AxiosResponse['data']> => {
    return axios.patch(url, data, getHeaders());
  },
  delete: async (url: string) => {
    return axios.delete(url, getHeaders());
  },
  // delete: async (url: string, data?: object) => {
  //   return axios.delete(url, { ...getHeaders(), data });
  // },  
  uploadFile: async (
    url: string,
    data: object
  ): Promise<AxiosResponse['data']> => {
    const headers = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access-token')}`,
        'Content-Type': 'multipart/form-data',
      },
    };
    return axios.post(url, data, headers);
  },
};

// Token validation function
export function isTokenValid(token: string) {
  try {
    const decoded_jwt: any = jwtDecode(token);
    return decoded_jwt || false; // unlimited expiry
  } catch (error: any) {
    return false;
  }
}

// Error handling function
export function errorAxiosResponse(error: any) {
  console.log('statuscode new', error.response.status);

  let msg = '';
  if (error.response) {
    // Response received with a status code out of 2xx range
    msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.msg;
  } else if (error.request) {
    // Request made but no response received
    msg = error.request;
  } else {
    // Error occurred during request setup
    msg = error.message;
  }
  return msg;
}

export default apiFunctions;
