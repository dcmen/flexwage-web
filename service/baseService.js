const request = require("request");
const requestPromise = require("request-promise");
const { createWriteStream } = require("fs");

const xApiKey = process.env.CASHD_API_KEY;
const { API_HTTPS } = require("../config/http");
const API = `https://${process.env.TYPE.toLowerCase()==='prod' ? '' : process.env.TYPE.toLowerCase() + "."}api.cashd.com.au`;

/**
 * BaseService is a Singleton that is responsible for
 * the call Api functionalities.
 * Methods this class provides:
 *      - get
 *      - getFile
 *      - postFormData
 *      - post
 *      - put
 *      - patch
 *      - delete
 *      - callsApi
 * */
class BaseService {
  static #instance;
  #headers;

  /**
   * Static method to get single instance of this class.
   * This method is not thread-safe. If multiple processes
   * call it at the same time, multiple instances might be
   * created
   * @return {BaseService}
   */

  static getInstance() {
    if (!BaseService.#instance) {
      BaseService.#instance = new BaseService();
      BaseService.#instance.initializeProperty();
    }
    return BaseService.#instance;
  }

  /**
   * Initialize headers variable to an enum
   * @return {void}
   */
  initializeProperty() {
    this.#headers = {
      "Content-Type": "application/json",
      "x-api-key": xApiKey,
    };
  }

  async callsApi(options, req) {
    const self = this;
    try {
      const result = await requestPromise({...options, resolveWithFullResponse: true});
      return result;
    } catch(errorResponse) {
      if (errorResponse.statusCode === 401) {
        const newReq = await self.refreshToken(req);
        if (newReq) {
          options.headers.Authorization = newReq.session.token;
          return await self.callsApi(options, newReq);
        }
      }
      return { statusCode: errorResponse.statusCode, body: errorResponse.error };
    }
  }

  async refreshToken(req) {
    const body =  {
      device_id: req.session.device_id,
      refresh_token: req.session.refresh_token
    };
    const options = {
      method: 'POST',
      url: `${API_HTTPS}/api/users/refreshToken`,
      headers: this.#headers,
      body: JSON.stringify(body)
    }
    try {
      const bodyJson = await requestPromise(options);
      const bodyParse = JSON.parse(bodyJson);
      if (bodyParse.success && bodyParse.code == 200) {
        req.session.token = bodyParse.token;
        req.session.refresh_token = bodyParse.refresh_token;
        return req;
      } else {
        console.log(bodyParse);
        req.session.destroy();
        return null;
      } 
    } catch (error) {
      console.error(error);
      req.session.destroy();
      return null;
    }
  }

  async get(path, token, req, qs = null) {
    const url = API_HTTPS + path;
    const options = token
      ? {
          method: "GET",
          url,
          headers: { ...this.#headers, Authorization: token },
        }
      : { method: "GET", url, headers: this.#headers };
    if (qs) {
      options.qs = qs;
    }
    return await this.callsApi(options, req);
  }

  getFile(path, res) {
    const url = API + path;
    const options = { method: "GET", url, headers: this.#headers };
    request(options).pipe(res);
  }

  async postFormData(path, formData, token, req) {
    const url = API_HTTPS + path;
    const options = {
      method: "POST",
      url,
      headers: { ...this.#headers, Authorization: token },
      formData,
    };
    return await this.callsApi(options, req);
  }

  async post(path, body, token, req) {
    const url = API_HTTPS + path;
    const options = token
      ? {
          method: "POST",
          url,
          headers: { ...this.#headers, Authorization: token },
          body: JSON.stringify(body),
        }
      : {
          method: "POST",
          url,
          headers: this.#headers,
          body: JSON.stringify(body),
        };
    return await this.callsApi(options, req);
  }

  async put(path, body, token, req) {
    const url = API_HTTPS + path;
    const options = {
      method: "PUT",
      url,
      headers: { ...this.#headers, Authorization: token },
      body: JSON.stringify(body),
    };
    return await this.callsApi(options, req);
  }

  async patch(path, body, token, req) {
    const url = API_HTTPS + path;
    const options = {
      method: "PATCH",
      url,
      headers: { ...this.#headers, Authorization: token },
      body: JSON.stringify(body),
    };
    return await this.callsApi(options, req);
  }

  async delete(path, body, token, req) {
    const url = API_HTTPS + path;
    const options = {
      method: "DELETE",
      url,
      headers: { ...this.#headers, Authorization: token },
      body: JSON.stringify(body),
    };
    return await this.callsApi(options, req);
  }
}

module.exports = BaseService;
