import { test, expect } from '@playwright/test';

// The Web3Forms endpoint is a real third-party API and the access_key is live.
// Tests never hit it: they intercept the request so validation/success/error UI
// can be verified deterministically, offline, and without mailing Gal.
test.describe('Contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
  });

  test('shows a validation error for the empty name and phone, not the optional message', async ({
    page,
  }) => {
    await page.locator('#submit-btn').click();

    await expect(page.locator('#name-error')).toBeVisible();
    await expect(page.locator('#name-error')).toHaveText('שם מלא הוא שדה חובה.');
    await expect(page.locator('#phone-error')).toBeVisible();
    await expect(page.locator('#contact-message')).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contact-message')).not.toHaveAttribute('required', /.*/);
    await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true');
  });

  test('rejects an invalid phone number', async ({ page }) => {
    await page.locator('#contact-name').fill('דנה כהן');
    await page.locator('#contact-phone').fill('abc');
    await page.locator('#contact-message').fill('כאב בגב תחתון כבר שבועיים.');
    await page.locator('#submit-btn').click();

    await expect(page.locator('#phone-error')).toHaveText('אנא הכניסו מספר טלפון תקין.');
  });

  test('clears a field error once corrected and resubmitted', async ({ page }) => {
    await page.locator('#submit-btn').click();
    await expect(page.locator('#name-error')).toBeVisible();

    await page.locator('#contact-name').fill('דנה כהן');
    await page.locator('#contact-phone').fill('0501234567');
    await page.locator('#contact-message').fill('כאב בגב תחתון כבר שבועיים.');
    await page.route('https://api.web3forms.com/submit', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' })
    );
    await page.locator('#submit-btn').click();

    await expect(page.locator('#name-error')).toBeHidden();
  });

  test('shows the success state and WhatsApp fallback on a successful submit', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' })
    );

    await page.locator('#contact-name').fill('דנה כהן');
    await page.locator('#contact-phone').fill('0501234567');
    await page.locator('#contact-message').fill('כאב בגב תחתון כבר שבועיים.');

    // Armed before the click, so this cannot race it. It splits the one way
    // this test used to fail into two that say different things: no request
    // at all means the click never reached the submit handler, while a request
    // with no success panel means the handler mishandled the response. CI hit
    // the first of those on 2026-09-19 and the trace could only say "#form-
    // success is still hidden", which fits both.
    const submitted = page.waitForRequest('https://api.web3forms.com/submit');
    await page.locator('#submit-btn').click();
    await submitted;

    await expect(page.locator('#form-success')).toBeVisible();
    await expect(
      page.locator('#form-success').getByRole('link', { name: /וואטסאפ/ })
    ).toBeVisible();
  });

  test('shows the error state with a WhatsApp fallback when the submit request fails', async ({
    page,
  }) => {
    await page.route('https://api.web3forms.com/submit', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false}' })
    );

    await page.locator('#contact-name').fill('דנה כהן');
    await page.locator('#contact-phone').fill('0501234567');
    await page.locator('#contact-message').fill('כאב בגב תחתון כבר שבועיים.');

    const submitted = page.waitForRequest('https://api.web3forms.com/submit');
    await page.locator('#submit-btn').click();
    await submitted;

    await expect(page.locator('#form-error-state')).toBeVisible();
    await expect(page.locator('#form-error-state')).toBeFocused();
    await expect(page.locator('#submit-btn')).toBeEnabled();
  });

  test('sends without a message, and the email says so instead of arriving blank', async ({
    page,
  }) => {
    let body: Record<string, string> = {};
    await page.route('https://api.web3forms.com/submit', (route) => {
      body = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"success":true}',
      });
    });

    await page.locator('#contact-name').fill('דנה כהן');
    await page.locator('#contact-phone').fill('0501234567');
    await page.locator('#submit-btn').click();

    await expect(page.locator('#form-success')).toBeVisible();
    expect(body.message, 'an empty message must not reach Gal as an empty field').toMatch(
      /לא נכתבה הודעה/
    );
  });

  test('links to the FAQ from the form', async ({ page }) => {
    await expect(
      page.locator('#form-intro').getByRole('link', { name: /שאלות הנפוצות/ })
    ).toHaveAttribute('href', '/faq/');
  });

  // Prettier drops a space that sits only in a line break next to an inline tag,
  // and this sentence once rendered as "בית?התשובות". Compare the rendered text.
  test('keeps a space between the FAQ question and its link', async ({ page }) => {
    const text = await page.locator('#form-intro').innerText();
    expect(text).toContain('טיפולי בית? התשובות');
  });
});
