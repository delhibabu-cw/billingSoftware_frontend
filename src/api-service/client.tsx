import apiFunctions from "./ApiService";
import siteUrls from "./SiteUrls";


export const getAuthProductCategoryApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.client.authProductCategory}${query}`);
  }

export const getProductCategoryApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.client.productCategory}${query}`);
  }

export const deleteProductCategoryApi = async (query : any) => {
    return apiFunctions.delete(`${siteUrls.client.productCategory}/${query}`);
  }

  export const singleUploadApi = async (payload : any) => {
    return apiFunctions.post(`${siteUrls.client.singleUpload}`,payload);
  };

  export const postProductCategoryApi = async (payload : any) => {
    return apiFunctions.post(`${siteUrls.client.productCategory}`,payload);
  };

  export const putProductCategoryApi = async (payload : any, query: any) => {
    return apiFunctions.put(`${siteUrls.client.productCategory}/${query}`,payload);
  };

  export const getProductApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.client.product}${query}`);
  }

  export const postProductApi = async (payload : any) => {
    return apiFunctions.post(`${siteUrls.client.product}`,payload);
  };

  export const putProductApi = async (payload : any, query: any) => {
    return apiFunctions.put(`${siteUrls.client.product}/${query}`,payload);
  };

  export const deleteProductApi = async (id: string, productName: any) => {
    return apiFunctions.delete(`${siteUrls.client.product}/${id}?product_name=${productName}`);
  };

  export const putClientProfileApi = async (payload : any, query: any) => {
    return apiFunctions.put(`${siteUrls.client.client}/${query}`,payload);
  };

  export const postCreateBillApi = async (payload : any) => {
    return apiFunctions.post(`${siteUrls.client.bill}`,payload);
  };

  export const getSubRoleApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.client.subRole}${query}`);
  }

  export const postSubRoleApi = async (payload : any) => {
    return apiFunctions.post(`${siteUrls.client.subRole}`,payload);
  };

  export const putSubRoleApi = async (payload : any, query: any) => {
    return apiFunctions.put(`${siteUrls.client.subRole}/${query}`,payload);
  };

  export const deleteSubRoleApi = async (query : any) => {
    return apiFunctions.delete(`${siteUrls.client.subRole}/${query}`);
  }

  export const getClientUserApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.client.clientUser}${query}`);
  }

  export const postClientUserApi = async (payload : any) => {
    return apiFunctions.post(`${siteUrls.client.clientUser}`,payload);
  };

  export const putClientUserApi = async (payload : any, query: any) => {
    return apiFunctions.put(`${siteUrls.client.clientUser}/${query}`,payload);
  };

  export const deleteClientUserApi = async (query : any) => {
    return apiFunctions.delete(`${siteUrls.client.clientUser}/${query}`);
  }

  export const getBillsApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.client.bill}${query}`);
  }

  export const getBillPageApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.client.billPage}${query}`);
  }

  export const postBillPageApi = async (payload : any) => {
    return apiFunctions.post(`${siteUrls.client.billPage}`,payload);
  };

  export const putBillPageApi = async (payload : any, query: any) => {
    return apiFunctions.put(`${siteUrls.client.billPage}/${query}`,payload);
  };

  export const getStockApi = async (query : any) => {
    return apiFunctions.get(`${siteUrls.client.stock}${query}`);
  }

  export const postStockApi = async (payload : any) => {
    return apiFunctions.post(`${siteUrls.client.stock}`,payload);
  };

  export const putStockApi = async (payload : any, query : any) => {
    return apiFunctions.put(`${siteUrls.client.stock}/${query}`,payload);
  };

  export const putProductStockApi = async (payload : any, query : any) => {
    return apiFunctions.put(`${siteUrls.client.stockCount}/${query}`,payload);
  };
