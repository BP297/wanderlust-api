import { rest } from 'msw';
import { API_BASE_URL } from '../config';

export const handlers = [
  // 獲取飯店列表
  rest.get(`${API_BASE_URL}/hotels`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        hotels: [
          {
            id: '1',
            name: '測試飯店 1',
            description: '這是一個測試飯店',
            city: '台北',
            country: '台灣',
            price: 3000,
            rating: 4.5,
            images: ['test-image-1.jpg']
          }
        ]
      })
    );
  }),

  // 獲取收藏列表
  rest.get(`${API_BASE_URL}/hotels/favorites`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        hotels: [
          {
            id: '1',
            name: '測試飯店 1',
            description: '這是一個測試飯店',
            city: '台北',
            country: '台灣',
            price: 3000,
            rating: 4.5,
            images: ['test-image-1.jpg']
          }
        ]
      })
    );
  }),

  // 添加收藏
  rest.post(`${API_BASE_URL}/hotels/:id/favorites`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: '成功加入收藏' })
    );
  }),

  // 取消收藏
  rest.delete(`${API_BASE_URL}/hotels/:id/favorites`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: '成功取消收藏' })
    );
  })
]; 