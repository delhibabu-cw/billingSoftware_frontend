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

export const getTrashClientApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.admin.trashClient}${query}`);
  }


// post client create
export const postClientApi = async (payload: any) => {
  return apiFunctions.post(`${siteUrls.admin.client}`, payload);
};

export const putClientApi = async (payload: any, query : any) => {
  return apiFunctions.put(`${siteUrls.admin.client}/${query}`, payload);
};

export const putRestoreClientApi = async (query : any) => {
  return apiFunctions.put(`${siteUrls.admin.restoreClient}/${query}`, {});
};

// post user create
export const deleteClientApi = async (query: any) => {
  return apiFunctions.delete(`${siteUrls.admin.client}/${query}`);
};

