import apiFunctions from "./ApiService";
import siteUrls from "./SiteUrls";

export const postSigninApi = async (payload:any) => {
    return apiFunctions.post(siteUrls.auth.signin, payload);
  };

  export const getAuthRoleApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.auth.role}${query}`);
  }

  export const getProfileApi = async () => {
    return apiFunctions.get(`${siteUrls.auth.profile}`);
  }


