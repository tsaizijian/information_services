# Firebase 後端設定

## ✅ 已完成的工作

### 1. 套件安裝

- ✅ Firebase SDK
- ✅ VueFire (Vue 3 整合)
- ✅ dayjs (日期處理)
- ✅ xlsx (Excel 匯出)
- ✅ jspdf + jspdf-autotable (PDF 匯出)
- ✅ chart.js + vue-chartjs (圖表)

### 2. Firebase 配置

- ✅ `plugins/firebase.client.ts` - Firebase 初始化插件
- ✅ `.env.example` - 環境變數範本
- ✅ `nuxt.config.ts` - Runtime config 設定

### 3. Composables (業務邏輯)

- ✅ `useAuth.ts` - 認證管理（登入、登出、角色檢查）
- ✅ `useFirestore.ts` - Firestore 通用 CRUD 操作
- ✅ `useClients.ts` - 個案管理
- ✅ `useClasses.ts` - 班級管理
- ✅ `useRecords.ts` - 照護紀錄管理（含釘選、交接功能）
- ✅ `useVitalSigns.ts` - 生命徵象管理（核心功能）
- ✅ `useExport.ts` - 匯出功能（Excel/PDF）

### 4. 中介層 (Middleware)

- ✅ `auth.ts` - 認證保護
- ✅ `role.ts` - 角色權限檢查

### 5. Firebase 安全規則

- ✅ `firestore.rules` - Firestore Security Rules
- ✅ `storage.rules` - Storage Security Rules
- ✅ `firestore.indexes.json` - Firestore 索引配置
- ✅ `firebase.json` - Firebase 專案配置

### 6. 文件

- ✅ `FIREBASE_SETUP.md` - Firebase 部署指南

## 📁 目錄結構

```
information_services/
├── frontend/
│   ├── composables/
│   │   ├── useAuth.ts              ✅ 認證管理
│   │   ├── useFirestore.ts         ✅ Firestore 操作
│   │   ├── useClients.ts           ✅ 個案管理
│   │   ├── useClasses.ts           ✅ 班級管理
│   │   ├── useRecords.ts           ✅ 照護紀錄
│   │   ├── useVitalSigns.ts        ✅ 生命徵象（重點）
│   │   └── useExport.ts            ✅ 匯出功能
│   ├── middleware/
│   │   ├── auth.ts                 ✅ 認證中介層
│   │   └── role.ts                 ✅ 角色權限
│   ├── plugins/
│   │   └── firebase.client.ts      ✅ Firebase 初始化
│   ├── .env.example                ✅ 環境變數範本
│   └── nuxt.config.ts              ✅ 已更新配置
├── firestore.rules                 ✅ Firestore 安全規則
├── storage.rules                   ✅ Storage 安全規則
├── firestore.indexes.json          ✅ Firestore 索引
├── firebase.json                   ✅ Firebase 配置
├── FIREBASE_SETUP.md               ✅ 部署指南
└── PROJECT_PLAN.md                 ✅ 專案規劃
```

## 🎯 核心功能實作

### 1. 認證系統 (`useAuth.ts`)

```typescript
const { user, userProfile, login, logout, isAdmin, isCaregiver } = useAuth();
```

### 2. 個案管理 (`useClients.ts`)

```typescript
const { getClients, getClient, createClient, updateClient } = useClients();
```

### 3. 照護紀錄 (`useRecords.ts`)

```typescript
const { getRecords, createRecord, togglePin, getPinnedRecords } = useRecords();
```

### 4. 生命徵象 (`useVitalSigns.ts`) ⭐ 重點功能

```typescript
const { getYearlyVitalSigns, saveMonthlyVitalSign } = useVitalSigns();
```

### 5. 匯出功能 (`useExport.ts`)

```typescript
const { exportVitalSignsToExcel, exportClassVitalSigns } = useExport();
```

## 🚀 下一步：開始使用

### 1. 設定 Firebase 專案

```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 初始化專案
cd /home/jian/Desktop/information_services
firebase init
```

### 2. 建立 .env 檔案

```bash
cd frontend
cp .env.example .env
# 然後編輯 .env 填入 Firebase 配置
```

### 3. 啟動開發伺服器

```bash
cd frontend
pnpm dev
```

### 4. 部署 Firebase Rules

```bash
# 部署 Firestore Rules
firebase deploy --only firestore:rules

# 部署 Storage Rules
firebase deploy --only storage

# 部署 Indexes
firebase deploy --only firestore:indexes
```

## 📊 資料庫集合

已配置的 Firestore Collections：

1. **users** - 使用者（管理員、照顧者、家屬）
2. **classes** - 班級/組別
3. **clients** - 個案資料
4. **records** - 照護紀錄
5. **monthlyVitalSigns** - 每月生命徵象 ⭐
6. **physicalRecords** - 身高體重歷史
7. **notifications** - 通知（選配）

## 🔐 安全規則

### 權限設計

- **管理員 (admin)**: 完整權限
- **照顧者 (caregiver)**: 可讀寫照護紀錄、生命徵象
- **家屬 (family)**: 只能查看自己家人的紀錄

### 資料保護

- ✅ 所有操作需要認證
- ✅ 角色權限檢查
- ✅ 資料擁有者驗證
- ✅ 防止權限提升

## 💡 使用範例

### 登入

```typescript
const { login } = useAuth();
await login("admin@example.com", "password");
```

### 新增個案

```typescript
const { createClient } = useClients();
await createClient({
  name: "張三",
  gender: "male",
  classId: "class-id",
  // ...其他資料
});
```

### 記錄生命徵象

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

### 匯出生命徵象表

```typescript
const { exportVitalSignsToExcel } = useExport();
await exportVitalSignsToExcel("client-id", "張三", 2025, "male");
```

## 📝 注意事項

1. **環境變數**: 請勿將 `.env` 檔案提交到 Git
2. **Security Rules**: 修改後必須重新部署
3. **Indexes**: Firebase 會在查詢失敗時提示需要建立的索引
4. **認證**: 使用 middleware 保護需要登入的頁面

## 🐛 常見問題

### Q: composables 中的錯誤提示

**A**: 這些是 TypeScript 的提示，Nuxt 會自動匯入這些函數，執行時不會有問題。

### Q: Firebase 連線失敗

**A**: 檢查 `.env` 檔案配置是否正確，並確認 Firebase 專案已正確設定。

### Q: 權限不足

**A**: 確認已部署 Security Rules，並且使用者有正確的 role。

---

**後端設定完成！準備開始前端頁面開發 🎉**
