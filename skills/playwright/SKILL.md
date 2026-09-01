---
name: playwright
description: Enterprise-grade browser automation, multi-browser E2E testing (Chromium, Firefox, WebKit), stealth dynamic web scraping, live UI style & component reverse-engineering, synthetic health monitoring, and AI agent browser control via @playwright/mcp.
---

# Microsoft Playwright (Universal Automation, E2E Testing & UI Reverse-Engineering)

Playwright is Microsoft's state-of-the-art framework for web automation, cross-browser testing (Chromium, Firefox, WebKit), web scraping, and autonomous AI browser interaction.

---

## 1. Multi-Skill Architecture & Cross-Tool Synergy

Playwright acts as the supreme external automation orchestrator, synergizing directly with:
- **Reticle (`reticle`)**: In-app state verification and agentic micro-assertions.
- **Chrome DevTools & A11y (`a11y-debugging`, `chrome-devtools`, `debug-optimize-lcp`)**: Core Web Vitals profiling and WCAG 2.2 AA accessibility assertions.
- **Security & Pentesting (`strix`, `security-check`)**: Automated security vulnerability scanning, CSRF token verification, and payload injection.
- **Design & UI Porting (`html-to-interaction-prompts`, `video-to-superprompt`, `apple-design`)**: Live component extraction and pixel-perfect design recreation.
- **Backend Data Pipelines (`better-backend`, `database-optimization`)**: Structured scraping pipelines with database persistence.

---

## 2. Core Automation Workflows

### Workflow 1: Enterprise Production E2E Testing & Matrix Sharding

Write resilient, zero-flake tests using user-facing locators (`getByRole`, `getByTestId`, `getByText`).

```typescript
import { test, expect } from '@playwright/test';

test.describe('KhaoPiyo AI / Cal AI Production Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('completes meal logging and updates calorie totals', async ({ page }) => {
    // 1. Open Meal Scanner
    await page.getByRole('button', { name: /add meal|log/i }).click();

    // 2. Fill meal details
    await page.getByTestId('meal-title-input').fill('Chicken Biryani');
    await page.getByTestId('meal-calories-input').fill('650');
    await page.getByRole('button', { name: /save meal|confirm/i }).click();

    // 3. Assert Calorie Counter updates dynamically (Auto-waiting)
    const calorieDisplay = page.getByTestId('total-consumed-calories');
    await expect(calorieDisplay).toContainText('650');

    // 4. Assert accessibility & no console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    expect(errors).toHaveLength(0);
  });
});
```

---

### Workflow 2: Live UI Reverse-Engineering & Component Porting

When the user asks to inspect an external website (e.g. Apple, Stripe, Linear) and extract a specific UI button, hero card, or animation:

1. **Launch Browser & Navigate**:
   ```typescript
   import { chromium } from 'playwright';

   const browser = await chromium.launch({ headless: true });
   const page = await browser.newPage();
   await page.goto('https://apple.com/iphone-16-pro', { waitUntil: 'networkidle' });
   ```
2. **Extract Computed Styles & CSS Properties**:
   ```typescript
   const elementStyles = await page.evaluate(() => {
     const el = document.querySelector('.action-button');
     if (!el) return null;
     const computed = window.getComputedStyle(el);
     return {
       backgroundColor: computed.backgroundColor,
       backdropFilter: computed.backdropFilter,
       boxShadow: computed.boxShadow,
       borderRadius: computed.borderRadius,
       fontFamily: computed.fontFamily,
       padding: computed.padding,
       transition: computed.transition,
       color: computed.color,
     };
   });
   ```
3. **Port into Clean React + Tailwind Component**:
   Convert extracted raw styles into clean Tailwind utilities and save into `src/components/`.

---

### Workflow 3: Stealth Dynamic Web Scraping & Data Extraction

Scrape single-page applications (Next.js/React), infinite scroll lists, and dynamic tables bypassing anti-bot shields:

```typescript
import { chromium } from 'playwright';

export async function scrapeNutritionData(targetUrl: string) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();
  
  // Intercept and extract backend API JSON directly
  const capturedResponses: any[] = [];
  page.on('response', async (response) => {
    if (response.url().includes('/api/foods') && response.status() === 200) {
      try {
        const json = await response.json();
        capturedResponses.push(json);
      } catch (e) {}
    }
  });

  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await browser.close();
  return capturedResponses;
}
```

---

### Workflow 4: Pixel-Perfect PDF Generation & High-Res Screenshots

```typescript
// Generate print-ready PDF invoice or report
await page.pdf({
  path: 'invoice-1001.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
});

// Capture 4K device screenshot for marketing
await page.screenshot({
  path: 'hero-preview.png',
  fullPage: true,
  quality: 100,
});
```

---

### Workflow 5: 24/7 Synthetic Health Monitoring (Uptime Bot)

Deploy periodic headless checks that execute full critical paths and trigger webhooks if checkout/auth fails:

```typescript
async function runHealthCheck() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const start = Date.now();

  try {
    await page.goto('https://app.khaopiyo.ai/login', { timeout: 10000 });
    await page.fill('#email', 'monitor@khaopiyo.ai');
    await page.fill('#password', process.env.MONITOR_PASS!);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 8000 });

    const latency = Date.now() - start;
    console.log(`✓ Health check passed in ${latency}ms`);
  } catch (error) {
    // Send alert to Discord / Telegram / Slack webhook
    await sendAlertWebhook(`🚨 Critical Alert: Production login failure! Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}
```

---

## 3. Fast CLI Recipes

```bash
# Generate tests interactively by clicking in the browser
npx playwright codegen https://localhost:5173

# Run all E2E tests across Chromium, Firefox, WebKit
npx playwright test

# Run tests with interactive UI mode and visual timeline
npx playwright test --ui

# Inspect failing test traces
npx playwright show-trace trace.zip
```
