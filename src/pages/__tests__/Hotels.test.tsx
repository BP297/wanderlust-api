import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Hotels from '../Hotels';

const renderHotels = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Hotels />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Hotels 頁面', () => {
  it('應該正確渲染飯店列表', async () => {
    renderHotels();

    // 檢查載入狀態
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // 等待飯店資料載入
    await waitFor(() => {
      expect(screen.getByText('測試飯店 1')).toBeInTheDocument();
    });

    // 檢查飯店詳細資訊
    expect(screen.getByText('台北, 台灣')).toBeInTheDocument();
    expect(screen.getByText('NT$ 3,000 /晚')).toBeInTheDocument();
  });

  it('應該可以搜尋飯店', async () => {
    renderHotels();

    // 輸入搜尋關鍵字
    const searchInput = screen.getByPlaceholderText('搜尋飯店名稱、地點...');
    fireEvent.change(searchInput, { target: { value: '台北' } });

    // 提交搜尋
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // 等待搜尋結果
    await waitFor(() => {
      expect(screen.getByText('測試飯店 1')).toBeInTheDocument();
    });
  });

  it('未登入時點擊收藏按鈕應該導向登入頁面', async () => {
    const { container } = renderHotels();

    await waitFor(() => {
      expect(screen.getByText('測試飯店 1')).toBeInTheDocument();
    });

    // 點擊收藏按鈕
    const favoriteButton = container.querySelector('[aria-label="加入收藏"]');
    fireEvent.click(favoriteButton!);

    // 檢查是否導向登入頁面
    expect(window.location.pathname).toBe('/login');
  });

  it('已登入時應該可以收藏/取消收藏飯店', async () => {
    // 模擬已登入狀態
    const mockUser = { id: '1', email: 'test@example.com' };
    jest.spyOn(require('../../contexts/AuthContext'), 'useAuth')
      .mockReturnValue({ user: mockUser });

    renderHotels();

    await waitFor(() => {
      expect(screen.getByText('測試飯店 1')).toBeInTheDocument();
    });

    // 點擊收藏按鈕
    const favoriteButton = screen.getByLabelText('加入收藏');
    fireEvent.click(favoriteButton);

    // 檢查提示訊息
    await waitFor(() => {
      expect(screen.getByText('已加入收藏')).toBeInTheDocument();
    });

    // 再次點擊取消收藏
    fireEvent.click(favoriteButton);

    // 檢查提示訊息
    await waitFor(() => {
      expect(screen.getByText('已從收藏中移除')).toBeInTheDocument();
    });
  });
}); 