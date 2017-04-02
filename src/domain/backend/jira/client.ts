import * as axios from 'axios';
import HttpClient from '../../shared/httpClient';

/**
 * Sets up an axios http client instance with some request logging and
 * sane defaults in place
 */
export default function(config, logger): HttpClient {
  const instance = axios.create({
    baseURL: `https://${config.get('domain')}`,
    auth: {
      username: config.get('username'),
      password: config.get('password')
    }
  });

  instance.interceptors.request.use(
    config => {
      logger.trace(`${config.method} ${config.url}`);
      return config;
    },
    error => Promise.reject(error)
  );

  instance.interceptors.response.use(
    response => {
      logger.trace(`${response.status} containing ${JSON.stringify(response.data, null, 4)}`);
      return response;
    },
    error => {
      if (error.response && error.response.data) {
        logger.trace(JSON.stringify(error.response.data, null, 4));
      }

      return Promise.reject(error)
    }
  );

  return {
    get: async (path: string, options: Object): Promise<any> => {
      return await instance.get(path, options);
    },
    put: async (path: string, data: Object): Promise<any> => {
      return await instance.put(path, data);
    },
    post: async (path: string, data: Object): Promise<any> => {
      return await instance.post(path, data);
    },
    delete: async (path: string): Promise<any> => {
      return await instance.delete(path);
    }
  };
};
