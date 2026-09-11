/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/meridian-operations',
  async redirects() {
    return [
      // Send visitors on the old public link to the new jasonlim.tech URL.
      // Scoped to this specific host only — the other Vercel-assigned
      // domain (...jason-lims-projects-ef7a21ff.vercel.app) is used
      // internally as the rewrite target from jasonlim.tech itself, so it
      // must never redirect or the proxy would loop.
      {
        source: '/',
        basePath: false,
        has: [{ type: 'host', value: 'meridian-operations-five.vercel.app' }],
        destination: 'https://jasonlim.tech/meridian-operations',
        permanent: true,
      },
      {
        source: '/:path*',
        basePath: false,
        has: [{ type: 'host', value: 'meridian-operations-five.vercel.app' }],
        destination: 'https://jasonlim.tech/meridian-operations/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
