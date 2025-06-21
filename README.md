# Wanderlust Travel API

一個現代化的旅遊查詢和預訂系統，提供 RESTful API 和 React TypeScript 前端應用程式。

## 專案概述

Wanderlust Travel 是一個新興的旅遊代理機構，旨在為客戶提供無縫的平台來探索飯店和機票資訊。本專案包含：

- **後端 API**: Node.js + TypeScript + Express + MongoDB
- **前端應用**: React + TypeScript + Material-UI
- **API 文檔**: OpenAPI/Swagger 規格
- **測試套件**: Jest + Supertest + Cypress

## 功能特色

### 核心功能 (Essential)
- ✅ 員工註冊、登入和飯店管理
- ✅ 公開飯店瀏覽、搜尋和篩選
- ✅ 身份驗證和授權系統
- ✅ OpenAPI 規格文檔
- ✅ 完整的 API 測試套件
- ✅ 專案和程式碼文檔

### 重要功能 (Important)
- ✅ 用戶個人資料照片上傳
- ✅ 用戶註冊和收藏功能
- ✅ 用戶與員工之間的訊息系統

### 實用功能 (Useful)
- 🔄 社交媒體自動發布 (可選)
- 🔄 Google OAuth 登入 (可選)
- 🔄 外部 API 整合 (可選)

## 技術架構

### 後端技術棧
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Validation**: express-validator

### 前端技術棧
- **Framework**: React 18
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library + Cypress

## 快速開始

### 環境需求
- Node.js 16+
- MongoDB 4.4+
- npm 或 yarn

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd wanderlust-api
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **環境配置**
   ```bash
   cp env.example .env
   ```
   
   編輯 `.env` 檔案，設定必要的環境變數：
   ```env
   MONGODB_URI=mongodb://localhost:27017/wanderlust
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   EMPLOYEE_SIGNUP_CODE=WANDERLUST2024
   ```

4. **啟動開發伺服器**
   ```bash
   # 後端 API
   npm run dev
   
   # 前端應用 (新終端)
   npm start
   ```

5. **查看 API 文檔**
   ```
   http://localhost:5000/api-docs
   ```

## API 端點

### 認證端點
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/profile` - 獲取用戶資料
- `PUT /api/auth/profile` - 更新用戶資料

### 飯店端點
- `GET /api/hotels` - 獲取飯店列表 (支援搜尋和篩選)
- `GET /api/hotels/:id` - 獲取飯店詳情
- `POST /api/hotels` - 新增飯店 (僅員工)
- `PUT /api/hotels/:id` - 更新飯店 (僅員工)
- `DELETE /api/hotels/:id` - 刪除飯店 (僅員工)

### 訊息端點
- `GET /api/messages` - 獲取訊息列表
- `GET /api/messages/:id` - 獲取訊息詳情
- `POST /api/messages` - 發送訊息
- `DELETE /api/messages/:id` - 刪除訊息

### 檔案上傳端點
- `POST /api/upload/profile-photo` - 上傳個人資料照片

## 測試

### 執行測試
```bash
# 單元測試
npm test

# 測試覆蓋率
npm run test:coverage

# E2E 測試
npm run test:e2e

# 監控模式
npm run test:watch
```

### 測試覆蓋率目標
- 語句覆蓋率: 80%
- 分支覆蓋率: 80%
- 函數覆蓋率: 80%
- 行覆蓋率: 80%

## 部署

### 生產環境建置
```bash
# 建置後端
npm run build

# 啟動生產伺服器
npm start
```

### 環境變數
生產環境需要設定以下環境變數：
- `NODE_ENV=production`
- `MONGODB_URI` - 生產資料庫連接字串
- `JWT_SECRET` - 強密碼 JWT 密鑰
- `PORT` - 伺服器端口

## 專案結構

```
wanderlust-api/
├── src/
│   ├── config/          # 配置檔案
│   ├── controllers/     # 控制器
│   ├── middlewares/     # 中間件
│   ├── models/          # 資料模型
│   ├── routes/          # 路由定義
│   ├── services/        # 業務邏輯
│   ├── tests/           # API 測試
│   ├── types/           # TypeScript 類型定義
│   ├── utils/           # 工具函數
│   ├── validations/     # 驗證規則
│   ├── components/      # React 組件
│   ├── contexts/        # React Context
│   ├── pages/           # 頁面組件
│   └── index.ts         # 應用程式入口
├── uploads/             # 上傳檔案目錄
├── cypress/             # E2E 測試
├── coverage/            # 測試覆蓋率報告
└── docs/               # 專案文檔
```

## 開發指南

### 程式碼風格
- 使用 ESLint 和 Prettier 保持程式碼一致性
- 遵循 TypeScript 最佳實踐
- 使用有意義的變數和函數名稱
- 添加適當的註釋和文檔

### Git 工作流程
1. 從 main 分支創建功能分支
2. 進行開發和測試
3. 提交變更並推送到遠端
4. 創建 Pull Request
5. 程式碼審查和合併

### 安全性考量
- 所有密碼都使用 bcrypt 加密
- JWT token 有過期時間
- 輸入驗證和清理
- CORS 配置
- 檔案上傳限制

## 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 聯絡資訊

- 專案維護者: [您的姓名]
- 電子郵件: [您的郵箱]
- 專案連結: [GitHub 連結]

## 更新日誌

### v1.0.0 (2024-01-XX)
- 初始版本發布
- 完整的認證系統
- 飯店管理功能
- 訊息系統
- API 文檔和測試套件 