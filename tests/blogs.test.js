const Page = require("./helpers/page");
let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3001");
});

afterEach(async () => {
  await page.close();
});

describe("Blogs", () => {
  test("Blogs ", async () => {
    const headerText = await page.getElementText("a.brand-logo");
    expect(headerText).toEqual("Blogster");
  });
});
