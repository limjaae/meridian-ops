'use client';

import { useEffect, useRef } from 'react';
import SiteNav from '../../components/SiteNav';
import { BASE_PATH } from '../../lib/basePath';

// Swagger UI is loaded from a CDN rather than installed as an npm
// dependency. It's a pure renderer: it reads the OpenAPI spec at
// /openapi.yaml and draws the standard interactive Swagger UI page from
// it, identically to a framework-generated one. Keeping it CDN-based
// means this page can't ever break the production build.
const SWAGGER_UI_VERSION = '5.17.14';

export default function ApiDocsPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const cssHref = `https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css`;
    if (!document.querySelector(`link[href="${cssHref}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
    }

    function render() {
      if (cancelled || !window.SwaggerUIBundle) return;
      window.SwaggerUIBundle({
        url: `${BASE_PATH}/openapi.yaml`,
        domNode: containerRef.current,
        presets: [window.SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout',
        deepLinking: true,
      });
    }

    const scriptSrc = `https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js`;
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existing && window.SwaggerUIBundle) {
      render();
    } else {
      const script = existing || document.createElement('script');
      script.src = scriptSrc;
      script.onload = render;
      if (!existing) document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <p className="font-mono text-xs tracking-wideish text-navy mb-2">API REFERENCE</p>
        <h1 className="font-display text-2xl sm:text-3xl text-charcoal mb-2">
          All 9 endpoints, documented and callable.
        </h1>
        <p className="text-sm text-slateline max-w-2xl mb-8">
          A hand-written OpenAPI spec describing every route in this app, rendered with Swagger UI.
          Read-only endpoints can be called directly from here with the “Try it out” button.
        </p>
        <div className="bg-white border border-hairline rounded-lg overflow-hidden">
          <div ref={containerRef} />
        </div>
      </div>
    </main>
  );
}
