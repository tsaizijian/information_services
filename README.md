# 身心障礙照護紀錄系統

基於 Nuxt 3 + Firebase 的照護機構管理系統，專為身心障礙照護機構設計。

## ✨ 主要功能

- 📝 **照護紀錄管理** - 完整的日常照護記錄
- 🩺 **生命徵象追蹤** - 每月體重、血壓、脈搏、血氧記錄
- 👥 **個案管理** - 個案基本資料、健康資訊管理
- 🏫 **班級管理** - 組別/班級分組管理
- 📊 **資料匯出** - 生命徵象紀錄表、照護記錄匯出（Excel/PDF）
- 📌 **釘選功能** - 重要紀錄快速存取
- 🔄 **交接功能** - 班次交接記錄與確認
- 🔐 **權限管理** - 管理員、照顧者、家屬三級權限

## 🚀 快速開始

### 前置需求

- Node.js 18+
- pnpm 9+
- Firebase 專案

### 1. 安裝依賴

```bash
cd frontend
pnpm install
```

### 2. 設定 Firebase

#### 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案
3. 啟用以下服務：
   - Authentication (Email/Password)
   - Firestore Database
   - Storage

#### 設定環境變數

```bash
cd frontend
cp .env.example .env
```

編輯 `.env` 並填入 Firebase 配置資訊。

### 3. 部署 Firebase 規則

```bash
# 安裝 Firebase CLI（如果還沒安裝）
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 在專案根目錄初始化
cd /home/jian/Desktop/information_services
firebase init

# 部署 Firestore 規則和索引
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# 部署 Storage 規則
firebase deploy --only storage
```

### 4. 建立管理員帳號

1. 在 Firebase Console > Authentication 建立第一個使用者
2. 在 Firestore Database 中新增對應的 user 文件：

```json
{
  "email": "admin@example.com",
  "displayName": "系統管理員",
  "role": "admin",
  "phone": "0912345678",
  "isActive": true,
  "createdAt": "2025-11-04T00:00:00Z",
  "updatedAt": "2025-11-04T00:00:00Z"
}
```

**重要**：文件 ID 必須與 Authentication 中的 UID 相同！

### 5. 啟動開發伺服器

```bash
cd frontend
pnpm dev
```

訪問 `http://localhost:3000`

## 📁 專案結構

```
information_services/
├── frontend/                    # Nuxt 前端應用
│   ├── app/                    # 應用程式主要檔案
│   ├── composables/            # 可組合式函數（業務邏輯）
│   │   ├── useAuth.ts         # 認證管理
│   │   ├── useClients.ts      # 個案管理
│   │   ├── useRecords.ts      # 照護紀錄
│   │   ├── useVitalSigns.ts   # 生命徵象（核心）
│   │   └── useExport.ts       # 匯出功能
│   ├── middleware/             # 路由中介層
│   ├── plugins/                # Nuxt 插件
│   └── .env.example           # 環境變數範本
├── firestore.rules             # Firestore 安全規則
├── storage.rules               # Storage 安全規則
├── firestore.indexes.json      # Firestore 索引
├── firebase.json               # Firebase 配置
├── PROJECT_PLAN.md            # 詳細專案規劃
├── FIREBASE_SETUP.md          # Firebase 設定指南
└── BACKEND_SUMMARY.md         # 後端功能總覽
```

## 🎯 核心功能使用

### 登入系統

```typescript
const { login } = useAuth();
await login("admin@example.com", "password");
```

### 管理個案

```typescript
const { createClient, getClients } = useClients();

// 新增個案
await createClient({
  name: "張三",
  gender: "male",
  classId: "class-id",
  basicInfo: {
    /* ... */
  },
});

// 取得個案列表
const clients = await getClients();
```

### 記錄生命徵象 ⭐

```typescript
const { saveMonthlyVitalSign } = useVitalSigns();

await saveMonthlyVitalSign({
  clientId: "client-id",
  clientName: "張三",
  year: 2025,
  month: 11,
  weight: 60.5,
  bloodPressure: "120/80",
  pulse: 75,
  bloodOxygen: 98,
});
```

### 匯出生命徵象紀錄表

```typescript
const { exportVitalSignsToExcel } = useExport();

// 匯出單一個案
await exportVitalSignsToExcel("client-id", "張三", 2025, "male");

// 批次匯出整個班級
await exportClassVitalSigns("class-id", 2025);
```

## 🔐 使用者角色

### 管理員 (admin)

- 完整系統權限
- 管理使用者、個案、班級
- 查看和匯出所有資料

### 照顧者 (caregiver)

- 新增和編輯照護紀錄
- 記錄生命徵象
- 查看所屬班級資料
- 匯出報表

### 家屬 (family)

- 查看家人的照護記錄（唯讀）
- 查看生命徵象數據

## 📊 資料庫集合

- `users` - 使用者帳號
- `classes` - 班級/組別
- `clients` - 個案資料
- `records` - 照護紀錄
- `monthlyVitalSigns` - 每月生命徵象 ⭐
- `physicalRecords` - 身高體重歷史
- `notifications` - 系統通知

## 🛠️ 技術棧

- **前端框架**: Nuxt 3
- **UI 元件庫**: PrimeVue 4
- **樣式**: Tailwind CSS
- **後端服務**: Firebase
  - Authentication
  - Firestore Database
  - Storage
- **圖表**: Chart.js + vue-chartjs
- **匯出**: xlsx, jspdf
- **日期處理**: dayjs

## 📖 文件

- [專案規劃文件](./PROJECT_PLAN.md) - 完整的系統設計與規劃
- [Firebase 設定指南](./FIREBASE_SETUP.md) - 詳細的 Firebase 配置步驟
- [Vercel 部署指南](./VERCEL_DEPLOYMENT.md) - Vercel 部署教學 ⭐
- [後端功能總覽](./BACKEND_SUMMARY.md) - 後端 API 使用說明

## 🔧 開發指令

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 建置生產版本
pnpm build

# 預覽生產版本
pnpm preview

# 程式碼檢查
pnpm lint
```

## 🚢 部署

### 部署到 Vercel（推薦）✨

```bash
# 1. 推送到 GitHub
git add .
git commit -m "Ready for deployment"
git push

# 2. 在 Vercel 網站上
# - 連結 GitHub repo
# - 設定 Root Directory: frontend
# - 加入環境變數
# - 自動部署完成！

# 詳細步驟請參考 VERCEL_DEPLOYMENT.md
```

**重要**：部署後記得在 Firebase Console > Authentication > Settings > Authorized domains 加入你的 Vercel 網址！

### 部署到其他平台

Nuxt 支援多種部署目標，詳見 [Nuxt Deployment](https://nuxt.com/docs/getting-started/deployment)。

## 📝 待辦事項

- [ ] 建立前端頁面 UI
- [ ] 實作表單驗證
- [ ] 新增圖表視覺化
- [ ] 完善 PDF 匯出樣式
- [ ] 新增通知功能
- [ ] 建立使用者手冊
- [ ] 單元測試
- [ ] E2E 測試

## 🐛 問題回報

如有任何問題或建議，請聯繫系統管理員。

## 📄 授權

此專案為內部使用系統。

---

**最後更新**: 2025-11-04
