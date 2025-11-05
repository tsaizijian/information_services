# 後端設定檢查清單

使用此檢查清單確保後端已正確配置。

## ✅ 專案設定

- [ ] 已安裝所有 npm 套件
  ```bash
  cd frontend && pnpm install
  ```

## ✅ Firebase 專案

### 建立與設定

- [ ] 已在 Firebase Console 建立專案
- [ ] 已啟用 Authentication (Email/Password)
- [ ] 已建立 Firestore Database
- [ ] 已啟用 Storage
- [ ] 已取得 Web App 配置資訊

### CLI 工具

- [ ] 已安裝 Firebase CLI
  ```bash
  npm install -g firebase-tools
  ```
- [ ] 已登入 Firebase
  ```bash
  firebase login
  ```
- [ ] 已初始化 Firebase 專案
  ```bash
  firebase init
  ```

## ✅ 環境變數

- [ ] 已複製 `.env.example` 到 `.env`
  ```bash
  cd frontend && cp .env.example .env
  ```
- [ ] 已填入所有 Firebase 配置
  - [ ] NUXT_PUBLIC_FIREBASE_API_KEY
  - [ ] NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - [ ] NUXT_PUBLIC_FIREBASE_PROJECT_ID
  - [ ] NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - [ ] NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - [ ] NUXT_PUBLIC_FIREBASE_APP_ID
  - [ ] NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID

## ✅ Security Rules

- [ ] 已部署 Firestore Rules
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] 已部署 Storage Rules
  ```bash
  firebase deploy --only storage
  ```
- [ ] 已部署 Firestore Indexes
  ```bash
  firebase deploy --only firestore:indexes
  ```

## ✅ 初始資料

### 管理員帳號

- [ ] 已在 Firebase Authentication 建立管理員使用者
- [ ] 已記錄管理員的 UID
- [ ] 已在 Firestore `users` 集合建立對應文件
  - 文件 ID = Authentication UID
  - role = "admin"
  - 其他必要欄位已填寫

### 測試資料（選配）

- [ ] 已建立測試班級（classes collection）
- [ ] 已建立測試個案（clients collection）

## ✅ 測試連線

- [ ] 已啟動開發伺服器
  ```bash
  cd frontend && pnpm dev
  ```
- [ ] 可以訪問 `http://localhost:3000`
- [ ] 可以使用管理員帳號登入
- [ ] 可以在瀏覽器 Console 看到 Firebase 連線成功

## ✅ 功能測試

### 認證功能

- [ ] 登入功能正常
- [ ] 登出功能正常
- [ ] 未登入時會自動跳轉到登入頁

### Firestore 讀寫

- [ ] 可以讀取 users 資料
- [ ] 可以讀取 classes 資料
- [ ] 可以讀取 clients 資料
- [ ] 可以新增測試記錄

### 權限測試

- [ ] 管理員可以存取所有資料
- [ ] 照顧者可以讀寫照護紀錄
- [ ] 權限不足時會被拒絕

## ✅ 檔案檢查

### 已建立的檔案

- [ ] `frontend/.env` (不在 Git 中)
- [ ] `frontend/.env.example`
- [ ] `frontend/plugins/firebase.client.ts`
- [ ] `frontend/composables/useAuth.ts`
- [ ] `frontend/composables/useFirestore.ts`
- [ ] `frontend/composables/useClients.ts`
- [ ] `frontend/composables/useClasses.ts`
- [ ] `frontend/composables/useRecords.ts`
- [ ] `frontend/composables/useVitalSigns.ts`
- [ ] `frontend/composables/useExport.ts`
- [ ] `frontend/middleware/auth.ts`
- [ ] `frontend/middleware/role.ts`
- [ ] `firestore.rules`
- [ ] `storage.rules`
- [ ] `firestore.indexes.json`
- [ ] `firebase.json`

### 文件檔案

- [ ] `README.md`
- [ ] `PROJECT_PLAN.md`
- [ ] `FIREBASE_SETUP.md`
- [ ] `BACKEND_SUMMARY.md`

## 🔧 故障排除

### 如果登入失敗

1. 檢查 `.env` 檔案配置是否正確
2. 檢查 Firebase Console > Authentication 是否已啟用 Email/Password
3. 檢查瀏覽器 Console 錯誤訊息
4. 確認使用者已在 Authentication 中建立

### 如果 Firestore 操作失敗

1. 檢查 Security Rules 是否已部署
2. 確認使用者在 `users` collection 中有對應文件
3. 確認使用者的 `role` 欄位正確
4. 檢查瀏覽器 Console 錯誤訊息

### 如果查詢很慢或失敗

1. 檢查 Firebase Console 是否提示需要建立 Composite Index
2. 點擊 Console 中的連結自動建立索引
3. 或手動部署索引：`firebase deploy --only firestore:indexes`

### 如果匯出功能失敗

1. 確認已安裝 `xlsx` 和 `jspdf` 套件
2. 檢查瀏覽器是否允許下載
3. 檢查資料是否完整

## 📝 完成確認

當所有項目都打勾後，後端設定即完成！

接下來可以開始：

- ✅ 建立前端頁面
- ✅ 實作 UI 元件
- ✅ 完善業務邏輯

---

**檢查日期**: ****\_****
**檢查人員**: ****\_****
