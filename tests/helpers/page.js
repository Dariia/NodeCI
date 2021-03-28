const puppeteer = require('puppeteer');
const sessionFactory = require('../factory/sessionFactory');
const userFactory = require('../factory/userFactory');

class Page {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const originalPage = await browser.newPage();
    const customPage = new Page(originalPage);
    return new Proxy(customPage, {
      get: (target, property) =>
        customPage[property] || browser[property] || originalPage[property],
    });
  }

  constructor(originalPage) {
    this.page = originalPage;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.reload({
      waitUntil: ['networkidle0', 'domcontentloaded'],
    });
  }

  async getElementText(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }

  get(url) {
    return this.page.evaluate(
      (_url) =>
        fetch(_url, {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((res) => res.json()),
      url
    );
  }

  post(url, data) {
    return this.page.evaluate(
      (_url, _data) =>
        fetch(_url, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(_data),
        }).then((res) => res.json()),
      url,
      data
    );
  }

  fetch(url, method, data) {
    return this[method](url, data);
  }
}

module.exports = Page;
