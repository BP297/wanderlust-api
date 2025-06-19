import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => {
  // 啟動 MSW
  server.listen();
});

afterEach(() => {
  // 每次測試後重置處理程序
  server.resetHandlers();
});

afterAll(() => {
  // 清理
  server.close();
}); 