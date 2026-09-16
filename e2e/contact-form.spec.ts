import { test, expect } from '@playwright/test';

// The Web3Forms endpoint is a real third-party API (and its access_key is
// still a placeholder — see CLAUDE.md "Known issues"). Tests never hit it
// live; they intercept the request so validation/success/error UI can be
// verified deterministically and offline.
test.describe('Contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
  });

  test('shows a validation error per empty required field', async ({ page }) => {
    await page.locator('#submit-btn').click();

    await expect(page.locator('#name-error')).toBeVisible();
    await expect(page.locator('#name-error')).toHaveText('שם מלא הוא שדה חובה.');
    await expect(page.locator('#phone-error')).toBeVisible();
    await expect(page.locator('#message-error')).toBeVisible();
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
    await page.locator('#submit-btn').click();

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
    await page.locator('#submit-btn').click();

    await expect(page.locator('#form-error-state')).toBeVisible();
    await expect(page.locator('#form-error-state')).toBeFocused();
    await expect(page.locator('#submit-btn')).toBeEnabled();
  });
});
