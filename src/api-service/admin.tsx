import apiFunctions from "./ApiService";
import siteUrls from "./SiteUrls";

export const getRoleApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.admin.role}${query}`);
  }

export const getUserApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.admin.user}${query}`);
  }

export const getClientApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.admin.client}${query}`);
  }


// post client create
export const postClientApi = async (payload: any) => {
  return apiFunctions.post(`${siteUrls.admin.client}`, payload);
};

// post user create
export const deleteClientApi = async (query: any) => {
  return apiFunctions.delete(`${siteUrls.admin.client}/${query}`);
};

