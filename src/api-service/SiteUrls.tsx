import configJson from "../config/index";


const siteUrlsJson = {
  ourSiteUrls: {
    auth: {
      signin: 'signin',
      role: "auth/role",
      profile: 'profile',
      authProfile: 'auth/profile',
      upload: 'upload/single',
      uploadMulti: 'upload/multi',
      uploadAuthMulti: 'auth/upload/document',
      uploadResume: 'upload/resume',
      roleDropDown: 'roleDropDown',
      mobileSignup: 'otp/send',
      mobileSignupVerify: 'otp/verify',
      mobileValidation: 'mobileValidation',
      updateMobileValidataion: 'mobileValid/update',
      emailValidation: 'emailValidation',
      updateEmailValidation: 'emailValid/update',
      changePassword: "change/password",
      forgotPassword: 'forgot/password',
      resetPassword: 'reset/password',
      signUp: 'signup',
    },
    profile: {
      get: 'profile',
    },
    admin: {
      user: 'user',
      client: 'client',
      trashClient: 'trashClient',
      restoreClient: 'restoreClient',
      role: "role",
    },
    client: {
      client: 'client',
      authProductCategory: 'auth/productCategory',
      productCategory: "productCategory",
      product: "product",
      singleUpload: 'single-upload',
      bill: 'bill',
      subRole: 'subRole',
      clientUser: 'clientUser',
      billPage: 'billPage',
      stock: 'stock',
      stockCount : 'stockCount'
    }
  },
  outerDomainUrls: {},
};

function checkInnerJson(jsonData: any) {
  if (jsonData) {
    for (const key in jsonData) {
      if (typeof jsonData[key] === 'string') {
        jsonData[key] = `${configJson.backendDomain}${jsonData[key]}`;
      } else {
        jsonData[key] = checkInnerJson(jsonData[key]);
      }
    }
  }
  return jsonData as typeof siteUrlsJson.ourSiteUrls;
}
const siteUrls = {
  ...checkInnerJson(siteUrlsJson.ourSiteUrls),
  outerDomainUrls: siteUrlsJson.outerDomainUrls,
};
export default siteUrls;
