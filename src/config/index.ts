let backendDomain = import.meta.env.VITE_NODE_ENV;

backendDomain = backendDomain
  ? backendDomain.endsWith('/')
    ? backendDomain
    : `${backendDomain}/`
  : '';

const configJson = {
  backendDomain,
};

export default configJson;