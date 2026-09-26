// src/middleware/bearer-auth/index.ts
import { HTTPException } from "../../http-exception.js";
import { timingSafeEqual } from "../../utils/buffer.js";
var TOKEN_STRINGS = "[A-Za-z0-9._~+/-]+=*";
var PREFIX = "Bearer";
var HEADER = "Authorization";
var bearerAuth = (options) => {
  if (!("token" in options || "verifyToken" in options)) {
    throw new Error('bearer auth middleware requires options for "token" or "verifyToken"');
  }
  if (!options.realm) {
    options.realm = "";
  }
  if (options.prefix === void 0) {
    options.prefix = PREFIX;
  }
  const realm = options.realm?.replace(/"/g, '\\"');
  const prefix = options.prefix;
  const tokenRegexp = new RegExp(`^${TOKEN_STRINGS}$`);
  const wwwAuthenticatePrefix = prefix === "" ? "" : `${prefix} `;
  const throwHTTPException = async (c, status, wwwAuthenticateHeader, messageOption) => {
    const wwwAuthenticateHeaderValue = typeof wwwAuthenticateHeader === "function" ? await wwwAuthenticateHeader(c) : wwwAuthenticateHeader;
    const headers = {
      "WWW-Authenticate": typeof wwwAuthenticateHeaderValue === "string" ? wwwAuthenticateHeaderValue : `${wwwAuthenticatePrefix}${Object.entries(wwwAuthenticateHeaderValue).map(([key, value]) => `${key}="${value}"`).join(",")}`
    };
    const responseMessage = typeof messageOption === "function" ? await messageOption(c) : messageOption;
    const res = typeof responseMessage === "string" ? new Response(responseMessage, { status, headers }) : new Response(JSON.stringify(responseMessage), {
      status,
      headers: {
        ...headers,
        "content-type": "application/json"
      }
    });
    throw new HTTPException(status, { res });
  };
  return async function bearerAuth2(c, next) {
    const headerToken = c.req.header(options.headerName || HEADER);
    if (!headerToken) {
      await throwHTTPException(
        c,
        401,
        options.noAuthenticationHeader?.wwwAuthenticateHeader || `${wwwAuthenticatePrefix}realm="${realm}"`,
        options.noAuthenticationHeader?.message || options.noAuthenticationHeaderMessage || "Unauthorized"
      );
    } else {
      let tokenValue;
      if (prefix === "") {
        tokenValue = headerToken;
      } else {
        const headerLower = headerToken.toLowerCase();
        const prefixLower = prefix.toLowerCase();
        if (headerLower.startsWith(prefixLower) && headerToken[prefix.length] === " ") {
          tokenValue = headerToken.slice(prefix.length).trimStart();
        }
      }
      if (!tokenValue || !tokenRegexp.test(tokenValue)) {
        await throwHTTPException(
          c,
          400,
          options.invalidAuthenticationHeader?.wwwAuthenticateHeader || `${wwwAuthenticatePrefix}error="invalid_request"`,
          options.invalidAuthenticationHeader?.message || options.invalidAuthenticationHeaderMessage || "Bad Request"
        );
      } else {
        let equal = false;
        if ("verifyToken" in options) {
          equal = await options.verifyToken(tokenValue, c);
        } else if (typeof options.token === "string") {
          equal = await timingSafeEqual(options.token, tokenValue, options.hashFunction);
        } else if (Array.isArray(options.token) && options.token.length > 0) {
          for (const token of options.token) {
            if (await timingSafeEqual(token, tokenValue, options.hashFunction)) {
              equal = true;
              break;
            }
          }
        }
        if (!equal) {
          await throwHTTPException(
            c,
            401,
            options.invalidToken?.wwwAuthenticateHeader || `${wwwAuthenticatePrefix}error="invalid_token"`,
            options.invalidToken?.message || options.invalidTokenMessage || "Unauthorized"
          );
        }
      }
    }
    await next();
  };
};
export {
  bearerAuth
};
e === "function") {
        newState = newState(stateData[0]);
      }
      if (!Object.is(newState, stateData[0])) {
        stateData[0] = newState;
        if (pendingStack.length) {
          const [pendingType, pendingPromise] = pendingStack.at(-1);
          Promise.all([
            pendingType === 3 ? node : update([pendingType, false, localUpdateHook], node),
            pendingPromise
          ]).then(([node2]) => {
            if (!node2 || !(pendingType === 2 || pendingType === 3)) {
              return;
            }
            const lastVC = node2.vC;
            const addUpdateTask = () => {
              setTimeout(() => {
                if (lastVC !== node2.vC) {
                  return;
                }
                update([pendingType === 3 ? 1 : 0, false, localUpdateHook], node2);
              });
            };
            requestAnimationFrame(addUpdateTask);
          });
        } else {
          update([0, false, localUpdateHook], node);
        }
      }
    }
  ];
};
var useReducer = (reducer, initialArg, init) => {
  const handler = useCallback(
    (action) => {
      setState((state2) => reducer(state2, action));
    },
    [reducer]
  );
  const [state, setState] = useState(() => init ? init(initialArg) : initialArg);
  return [state, handler];
};
var useEffectCommon = (index, effect, deps) => {
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return;
  }
  const [, node] = buildData;
  const effectDepsArray = node[DOM_STASH][1][STASH_EFFECT] ||= [];
  const hookIndex = node[DOM_STASH][0]++;
  const [prevDeps, , prevCleanup] = effectDepsArray[hookIndex] ||= [];
  if (isDepsChanged(prevDeps, deps)) {
    if (prevCleanup) {
      prevCleanup();
    }
    const runner = () => {
      data[index] = void 0;
      data[2] = effect();
    };
    const data = [deps, void 0, void 0, void 0, void 0];
    data[index] = runner;
    effectDepsArray[hookIndex] = data;
  }
};
var useEffect = (effect, deps) => useEffectCommon(3, effect, deps);
var useLayoutEffect = (effect, deps) => useEffectCommon(1, effect, deps);
var useInsertionEffect = (effect, deps) => useEffectCommon(4, effect, deps);
var useCallback = (callback, deps) => {
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return callback;
  }
  const [, node] = buildData;
  const callbackArray = node[DOM_STASH][1][STASH_CALLBACK] ||= [];
  const hookIndex = node[DOM_STASH][0]++;
  const prevDeps = callbackArray[hookIndex];
  if (isDepsChanged(prevDeps?.[1], deps)) {
    callbackArray[hookIndex] = [callback, deps];
  } else {
    callback = callbackArray[hookIndex][0];
  }
  return callback;
};
function useRef(initialValue) {
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return { current: initialValue };
  }
  const [, node] = buildData;
  const refArray = node[DOM_STASH][1][STASH_REF] ||= [];
  const hookIndex = node[DOM_STASH][0]++;
  return refArray[hookIndex] ||= { current: initialValue };
}
var use = (promise) => {
  const cachedRes = resolvedPromiseValueMap.get(promise);
  if (cachedRes) {
    if (cachedRes.length === 2) {
      throw cachedRes[1];
    }
    return cachedRes[0];
  }
  promise.then(
    (res) => resolvedPromiseValueMap.set(promise, [res]),
    (e) => resolvedPromiseValueMap.set(promise, [void 0, e])
  );
  throw promise;
};
var useMemo = (factory, deps) => {
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    return factory();
  }
  const [, node] = buildData;
  const memoArray = node[DOM_STASH][1][STASH_MEMO] ||= [];
  const hookIndex = node[DOM_STASH][0]++;
  const prevDeps = memoArray[hookIndex];
  if (isDepsChanged(prevDeps?.[1], deps)) {
    memoArray[hookIndex] = [factory(), deps];
  }
  return memoArray[hookIndex][0];
};
var idCounter = 0;
var useId = () => useMemo(() => `:r${(idCounter++).toString(32)}:`, []);
var useDebugValue = (_value, _formatter) => {
};
var createRef = () => {
  return { current: null };
};
var forwardRef = (Component) => {
  return (props) => {
    const { ref, ...rest } = props;
    return Component(rest, ref);
  };
};
var useImperativeHandle = (ref, createHandle, deps) => {
  useEffect(() => {
    ref.current = createHandle();
    return () => {
      ref.current = null;
    };
  }, deps);
};
var useSyncExternalStore = (subscribe, getSnapshot, getServerSnapshot) => {
  const buildData = buildDataStack.at(-1);
  if (!buildData) {
    if (!getServerSnapshot) {
      throw new Error("getServerSnapshot is required for server side rendering");
    }
    return getServerSnapshot();
  }
  const snapshot = buildData[0][4] && getServerSnapshot ? getServerSnapshot() : getSnapshot();
  const [, setVersion] = useState(0);
  const latestSnapshot = useRef([snapshot, getSnapshot]);
  latestSnapshot.current = [snapshot, getSnapshot];
  const unsubscribeRef = useRef(null);
  useEffect(() => {
    const update2 = () => setVersion((version) => version + 1);
    unsubscribeRef.current?.();
    unsubscribeRef.current = subscribe(update2);
    const [snapshot2, getSnapshot2] = latestSnapshot.current;
    if (!Object.is(snapshot2, getSnapshot2())) {
      update2();
    }
  }, [subscribe]);
  useEffect(() => () => unsubscribeRef.current?.(), []);
  return snapshot;
};
export {
  STASH_EFFECT,
  createRef,
  forwardRef,
  startTransition,
  startViewTransition,
  use,
  useCallback,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  useViewTransition
};
