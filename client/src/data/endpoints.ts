export enum Endpoints {
  AUTH = '/login/auth',
  CLUB = '/club',
  FILEUPLOAD = '/fileupload',
}

export const getApiEndpoint = (endpoint: Endpoints) => {
  return `${import.meta.env.VITE_API_PATH}${endpoint}`;
}
