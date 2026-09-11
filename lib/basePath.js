// Meridian Operations is served under the /meridian-operations path when
// embedded at jasonlim.tech/meridian-operations (see the basePath setting
// in next.config.js). Next.js applies basePath automatically to next/link
// and next/router, but NOT to hardcoded fetch() URLs — those need this
// prefix added explicitly at every call site.
export const BASE_PATH = '/meridian-operations';
