/**
 * Authenticated UI API Luvio Network Adapter
 */

// See LDS error handling: https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.data_error
class RecordError extends Error {
    body;
    ok;
    status;
    statusText;
    constructor(message, status = 404) {
        super(message);
        this.body = { message };
        this.ok = false;
        this.status = status;
        this.statusText = message;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createNetworkAdapter() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async function networkAdapter(req) {
        // Build a request to the UI API proxied through the LWR auth middleware
        const { baseUri, basePath, body, queryParams, method, headers } = req;
        const path = `${baseUri}${basePath}${generateQueryString(queryParams)}`;
        try {
            const res = await fetch(path, {
                method: method.toUpperCase(),
                headers: generateHeaders(headers),
                body: body === null ? null : JSON.stringify(body),
            });
            if (res.ok) {
                return {
                    body: res.status === 204 ? undefined : await res.json(), // HTTP 204 = No Content
                    status: res.status,
                    statusText: res.statusText,
                    ok: res.ok,
                    headers: {},
                };
            }
            // Request goes through but returns HTTP errors
            throw new RecordError(res.statusText, res.status);
        } catch (e) {
            // Return the epic failure; no response status => 401
            // e.g. CORS or prefetch errors
            const error = e;
            throw new RecordError(error.message, error.status >= 0 ? error.status : 401);
        }
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateQueryString(params) {
    const queryStrings = [];
    for (const key of Object.keys(params)) {
        const value = Array.isArray(params[key]) ? params[key].join(',') : params[key];
        if (value) {
            queryStrings.push(`${key}=${value}`);
        }
    }
    return queryStrings.length > 0 ? `?${queryStrings.join('&')}` : '';
}

function generateHeaders(headers){
    const fetchHeaders = new globalThis.Headers();
    for (const key of Object.keys(headers)) {
        fetchHeaders.set(key, headers[key]);
    }
    // Always JSON
    fetchHeaders.set('Accept', 'application/json');
    fetchHeaders.set('Content-Type', 'application/json');
    return fetchHeaders;
}