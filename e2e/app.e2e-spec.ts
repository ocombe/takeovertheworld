import { TakeovertheworldPage } from './app.po';

describe('takeovertheworld App', () => {
  let page: TakeovertheworldPage;

  beforeEach(() => {
    page = new TakeovertheworldPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
