const Page = require("./helpers/page");
let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3001");
});

afterEach(async () => {
  await page.close();
});

describe("Header", () => {
  test("Has header text", async () => {
    const headerText = await page.getElementText("a.brand-logo");
    expect(headerText).toEqual("Blogster");
  });

  test("Authentication redirects to google", async () => {
    await page.click(".right a");
    const pageUrl = await page.url();

    expect(pageUrl).toContain("accounts.google.com");
  });

  test("should show logout button after user login", async () => {
    await page.login();
    const logoutText = await page.getElementText('a[href="/auth/logout"]');
    expect(logoutText).toEqual("Logout");
  });
});
