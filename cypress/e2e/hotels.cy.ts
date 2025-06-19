describe('飯店功能', () => {
  beforeEach(() => {
    // 訪問首頁
    cy.visit('/');
  });

  it('應該可以瀏覽飯店列表', () => {
    // 檢查頁面標題
    cy.get('h1').should('contain', '飯店列表');

    // 檢查飯店卡片
    cy.get('[data-testid="hotel-card"]').should('have.length.at.least', 1);
  });

  it('應該可以搜尋飯店', () => {
    // 輸入搜尋關鍵字
    cy.get('input[placeholder*="搜尋飯店"]').type('台北');
    
    // 點擊搜尋按鈕
    cy.get('button[type="submit"]').click();

    // 檢查搜尋結果
    cy.get('[data-testid="hotel-card"]').should('exist');
    cy.contains('台北').should('exist');
  });

  it('未登入時點擊收藏應該導向登入頁面', () => {
    // 點擊收藏按鈕
    cy.get('[aria-label="加入收藏"]').first().click();

    // 檢查是否導向登入頁面
    cy.url().should('include', '/login');
  });

  it('已登入用戶應該可以收藏/取消收藏飯店', () => {
    // 登入
    cy.login('test@example.com', 'password123');

    // 點擊收藏按鈕
    cy.get('[aria-label="加入收藏"]').first().click();

    // 檢查提示訊息
    cy.contains('已加入收藏').should('be.visible');

    // 取消收藏
    cy.get('[aria-label="取消收藏"]').first().click();

    // 檢查提示訊息
    cy.contains('已從收藏中移除').should('be.visible');
  });

  it('應該可以查看飯店詳情', () => {
    // 點擊第一個飯店卡片
    cy.get('[data-testid="hotel-card"]').first().click();

    // 檢查詳情頁面內容
    cy.get('h1').should('exist');
    cy.get('[data-testid="hotel-description"]').should('exist');
    cy.get('[data-testid="hotel-amenities"]').should('exist');
    cy.get('[data-testid="hotel-rooms"]').should('exist');
  });
}); 