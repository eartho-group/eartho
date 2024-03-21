import {
  EarthoOneOptions,
  AuthenticationResult,
  GetTokenSilentlyOptions,
  IdToken,
  PopupConfigOptions,
  PopupConnectOptions,
  RedirectConnectOptions
} from '../../src';

import * as utils from '../../src/utils';
import { EarthoOne } from '../../src/Eartho';

import {
  TEST_ACCESS_TOKEN,
  TEST_CLIENT_ID,
  TEST_CODE,
  TEST_DOMAIN,
  TEST_ID_TOKEN,
  TEST_REDIRECT_URI,
  TEST_REFRESH_TOKEN,
  TEST_STATE
} from '../constants';
import { expect } from '@jest/globals';
import { patchOpenUrlWithOnRedirect } from '../../src/Eartho.utils';

const authorizationResponse: AuthenticationResult = {
  code: 'my_code',
  state: TEST_STATE
};

export const assertPostFn = (mockFetch: jest.Mock) => {
  return (
    url: string,
    body: any,
    headers: Record<string, string> = null,
    callNum = 0,
    json = true
  ) => {
    const [actualUrl, call] = mockFetch.mock.calls[callNum];

    expect(url).toEqual(actualUrl);

    expect(body).toEqual(
      json
        ? JSON.parse(call.body)
        : Array.from(new URLSearchParams(call.body).entries()).reduce(
            (acc, curr) => ({ ...acc, [curr[0]]: curr[1] }),
            {}
          )
    );

    if (headers) {
      Object.keys(headers).forEach(header =>
        expect(headers[header]).toEqual(call.headers[header])
      );
    }
  };
};

/**
 * Extracts the keys and values from an IterableIterator and applies
 * them to an object.
 * @param itor The iterable
 * @returns An object with the keys and values from the iterable
 */
const itorToObject = <K extends string | number | symbol, V>(
  itor: IterableIterator<[K, V]>
): Record<K, V> =>
  [...itor].reduce((m, [key, value]) => {
    m[key] = value;
    return m;
  }, {} as Record<K, V>);

/**
 * Asserts that the supplied URL matches various criteria, including host, path, and query params.
 * @param actualUrl The URL
 * @param host The host
 * @param path The URL path
 * @param queryParams The query parameters to check
 * @param strict If true, the query parameters must match the URL parameters exactly. Otherwise, a loose match is performed to check that
 * the parameters passed in at least appear in the URL (but the URL can have extra ones). Default is true.
 */
export const assertUrlEquals = (
  actualUrl: URL | string,
  host: string,
  path: string,
  queryParams: Record<string, string>,
  strict: boolean = true
) => {
  const url = new URL(actualUrl);
  const searchParamsObj = itorToObject(url.searchParams.entries());

  expect(url.host).toEqual(host);
  expect(url.pathname).toEqual(path);

  if (strict) {
    expect(searchParamsObj).toStrictEqual({
      earthoOneClient: expect.any(String),
      ...queryParams
    });
  } else {
    expect(searchParamsObj).toMatchObject(queryParams);
  }
};

export const fetchResponse = (ok, json) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(json)
  });

export const setupFn = (mockVerify: jest.Mock) => {
  return (config?: Partial<EarthoOneOptions>, claims?: Partial<IdToken>) => {
    const options: EarthoOneOptions = {
      domain: TEST_DOMAIN,
      clientId: TEST_CLIENT_ID,
      authorizationParams: {
        redirect_uri: TEST_REDIRECT_URI
      }
    };

    Object.assign(options.authorizationParams, config?.authorizationParams);

    delete config?.authorizationParams;

    Object.assign(options, config);

    const eartho = new EarthoOne(options);

    mockVerify.mockReturnValue({
      claims: Object.assign(
        {
          exp: Date.now() / 1000 + 86400
        },
        claims
      ),
      user: {
        sub: 'me'
      }
    });

    return eartho;
  };
};

const processDefaultconnectWithRedirectOptions = config => {
  const defaultTokenResponseOptions = {
    success: true,
    response: {}
  };
  const defaultAuthorizeResponseOptions = {
    code: TEST_CODE,
    state: TEST_STATE
  };
  const token = {
    ...defaultTokenResponseOptions,
    ...(config.token || {})
  };
  const authorize = {
    ...defaultAuthorizeResponseOptions,
    ...(config.authorize || {})
  };

  return {
    token,
    authorize,
    useHash: config.useHash,
    customCallbackUrl: config.customCallbackUrl
  };
};

export const connectWithRedirectFn = (mockWindow, mockFetch) => {
  return async (
    eartho,
    options: RedirectConnectOptions = undefined,
    testConfig: {
      token?: {
        success?: boolean;
        response?: any;
      };
      authorize?: {
        code?: string;
        state?: string;
        error?: string;
        errorDescription?: string;
      };
      useHash?: boolean;
      customCallbackUrl?: string;
    } = {
      token: {},
      authorize: {}
    }
  ) => {
    const {
      token,
      authorize: { code, state, error, errorDescription },
      useHash,
      customCallbackUrl
    } = processDefaultconnectWithRedirectOptions(testConfig);
    await eartho.connectWithRedirect(options);

    const patchesOptions = options && patchOpenUrlWithOnRedirect(options);

    if (!patchesOptions || patchesOptions.openUrl == null) {
      expect(mockWindow.location.assign).toHaveBeenCalled();
    }

    if (error && errorDescription) {
      window.history.pushState(
        {},
        '',
        `/${
          useHash ? '#' : ''
        }?error=${error}&error_description=${errorDescription}&state=${state}`
      );
    } else if (error) {
      window.history.pushState(
        {},
        '',
        `/${useHash ? '#' : ''}?error=${error}&state=${state}`
      );
    } else if (code) {
      window.history.pushState(
        {},
        '',
        `/${useHash ? '#' : ''}?code=${code}&state=${state}`
      );
    } else {
      window.history.pushState({}, '', `/`);
    }

    mockFetch.mockResolvedValueOnce(
      fetchResponse(
        token.success,
        Object.assign(
          {
            id_token: TEST_ID_TOKEN,
            refresh_token: TEST_REFRESH_TOKEN,
            access_token: TEST_ACCESS_TOKEN,
            expires_in: 86400
          },
          token.response
        )
      )
    );

    return await eartho.handleRedirectCallback(customCallbackUrl);
  };
};

const processDefaultconnectWithPopupOptions = config => {
  const defaultTokenResponseOptions = {
    success: true,
    response: {}
  };

  const defaultAuthorizeResponseOptions = {
    response: authorizationResponse
  };

  const token = {
    ...defaultTokenResponseOptions,
    ...(config.token || {})
  };

  const authorize = {
    ...defaultAuthorizeResponseOptions,
    ...(config.authorize || {})
  };

  const delay = config.delay || 0;

  return {
    token,
    authorize,
    delay
  };
};

export const setupMessageEventLister = (
  mockWindow: any,
  response: any = {},
  delay = 0
) => {
  mockWindow.addEventListener.mockImplementationOnce((type, cb) => {
    if (type === 'message') {
      setTimeout(() => {
        cb({
          data: {
            type: 'authorization_response',
            response
          }
        });
      }, delay);
    }
  });

  mockWindow.open.mockReturnValue({
    close: () => {},
    location: {
      href: ''
    }
  });
};

export const connectWithPopupFn = (mockWindow, mockFetch) => {
  return async (
    eartho,
    options: PopupConnectOptions = undefined,
    config: PopupConfigOptions = undefined,
    testConfig: {
      token?: {
        success?: boolean;
        response?: any;
      };
      authorize?: {
        response?: any;
      };
      delay?: number;
    } = {
      token: {},
      authorize: {},
      delay: 0
    }
  ) => {
    const {
      token,
      authorize: { response },
      delay
    } = processDefaultconnectWithPopupOptions(testConfig);

    setupMessageEventLister(mockWindow, response, delay);

    mockFetch.mockResolvedValueOnce(
      fetchResponse(
        token.success,
        Object.assign(
          {
            id_token: TEST_ID_TOKEN,
            refresh_token: TEST_REFRESH_TOKEN,
            access_token: TEST_ACCESS_TOKEN,
            expires_in: 86400
          },
          token.response
        )
      )
    );
    await eartho.connectWithPopup(options, config);
  };
};

export const checkSessionFn = mockFetch => {
  return async eartho => {
    mockFetch.mockResolvedValueOnce(
      fetchResponse(true, {
        id_token: TEST_ID_TOKEN,
        refresh_token: TEST_REFRESH_TOKEN,
        access_token: TEST_ACCESS_TOKEN,
        expires_in: 86400
      })
    );
    await eartho.checkSession();
  };
};

const processDefaultGetTokenSilentlyOptions = config => {
  const defaultTokenResponseOptions = {
    success: true,
    response: {}
  };
  const token = {
    ...defaultTokenResponseOptions,
    ...(config.token || {})
  };

  return {
    token
  };
};

export const getTokenSilentlyFn = (mockWindow, mockFetch) => {
  return async (
    eartho,
    options: GetTokenSilentlyOptions = undefined,
    testConfig: {
      token?: {
        success?: boolean;
        response?: any;
      };
    } = {
      token: {}
    }
  ) => {
    const { token } = processDefaultGetTokenSilentlyOptions(testConfig);

    mockFetch.mockResolvedValueOnce(
      fetchResponse(
        token.success,
        Object.assign(
          {
            id_token: TEST_ID_TOKEN,
            refresh_token: TEST_REFRESH_TOKEN,
            access_token: TEST_ACCESS_TOKEN,
            expires_in: 86400
          },
          token.response
        )
      )
    );

    return await eartho.getTokenSilently(options);
  };
};
