import { describe, expect, it } from 'vitest';
import { DevToolingChannel, isDevToolingUrl } from './net.js';

describe('isDevToolingUrl — traffic the framework makes about ITSELF', () => {
  it.each(Object.values(DevToolingChannel))('recognises %s', (pattern) => {
    expect(true).toBe(isDevToolingUrl(`http://localhost:3000${pattern}x`));
  });

  it('recognises the real URLs each framework fires in dev', () => {
    for (const url of [
      // Next dev overlay resolving a source map for a React key warning — the reported false negative.
      'http://localhost:3000/__nextjs_original-stack-frames',
      'http://localhost:3000/__nextjs_original-stack-frame?isServer=false',
      '/__nextjs_launch-editor?file=app/page.tsx',
      '/__nextjs_source-map?filename=x',
      '/_next/static/webpack/633457081244afec.webpack.hot-update.json',
      '/_next/webpack-hmr',
      '/@vite/client',
      '/@vite/env',
      '/@react-refresh',
      '/__vite_ping',
      '/main.a1b2c3.hot-update.js',
    ]) {
      expect(`${url} is dev tooling`).toBe(
        `${url} is ${isDevToolingUrl(url) ? 'dev tooling' : 'APP TRAFFIC'}`,
      );
    }
  });

  /**
   * The over-exclusion guard. Everything below is the app's own traffic and MUST still count against
   * settle — a pattern wide enough to swallow one of these turns this false negative into a false
   * green, which is the worse defect of the two.
   */
  it('leaves the app own traffic alone', () => {
    for (const url of [
      '/api/users',
      'http://localhost:3000/api/checkout',
      '/_next/static/chunks/main-app.js',
      '/_next/image?url=%2Fhero.png',
      '/_next/data/build/products.json',
      '/dashboard?__nextjs=1',
      '/_astro/index.BdF3k2.js',
      '/__data.json',
      'ipc://save_invoice',
      '/graphql',
    ]) {
      expect(`${url} is app traffic`).toBe(
        `${url} is ${isDevToolingUrl(url) ? 'DEV TOOLING' : 'app traffic'}`,
      );
    }
  });

  it('is false for a missing url', () => {
    expect(false).toBe(isDevToolingUrl(undefined));
  });
});
