# Firebase 後端部署指南

## 📋 前置準備

### 1. 安裝 Firebase CLI

有兩種安裝方式，選擇其中一種：

#### 方式 A：全域安裝（任何目錄都可以直接用 `firebase` 指令）

```bash
npm install -g firebase-tools
```

#### 方式 B：本地安裝（推薦，已安裝）✅

```bash
# 在 frontend 資料夾
cd /home/jian/Desktop/information_services/frontend
pnpm add firebase-tools
```

如果是本地安裝，執行 Firebase 指令時需要加上 `pnpm exec` 或 `npx`：

```bash
# 本地安裝的執行方式
pnpm exec firebase login
# 或
npx firebase login
```

### 2. 登入 Firebase

```bash
# 如果是全域安裝
firebase login

# 如果是本地安裝（你的情況）
pnpm exec firebase login
# 或
npx firebase login
```

**團隊協作說明**：

- 每個開發者都要用**自己的 Google 帳號**登入
- 專案擁有者需要在 Firebase Console 加入團隊成員
- 登入後可以存取被授權的專案

## 👥 團隊協作設定

### 加入新的開發者

1. **專案擁有者在 Firebase Console 操作**：

   - 前往 [Firebase Console](https://console.firebase.google.com/)
   - 選擇專案
   - 點擊左側齒輪 ⚙️ > 「使用者和權限」
   - 點擊「新增成員」
   - 輸入成員的 Google 帳號 email
   - 選擇角色：
     - **Editor** - 可以部署、修改設定（推薦給開發者）
     - **Viewer** - 只能查看
     - **Owner** - 完整權限

2. **新成員在自己電腦上操作**：

   ```bash
   # 1. Clone 專案
   git clone <repo-url>
   cd information_services/frontend

   # 2. 安裝依賴
   pnpm install

   # 3. 登入自己的 Firebase 帳號
   pnpm exec firebase login

   # 4. 選擇專案（如果有多個專案）
   pnpm exec firebase use <project-id>

   # 5. 就可以部署了
   pnpm exec firebase deploy --only firestore:rules
   ```

## 🚀 初始化專案

### 1. 在 Firebase Console 創建專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」
3. 輸入專案名稱（例如：care-record-system）
4. 按照步驟完成專案建立

### 2. 啟用 Firebase 服務

在 Firebase Console 中啟用以下服務：

- ✅ **Authentication** (Email/Password) - 必須，用於登入系統
- ✅ **Firestore Database** - 必須，用於儲存資料
- ✅ **Storage** - 必須，用於上傳附件
- ❌ **Hosting** - **不需要**（你會用 Vercel 部署）

### 3. 初始化 Firebase（在專案根目錄）

```bash
# 切換到專案根目錄（不是 frontend 資料夾）
cd /home/jian/Desktop/information_services

# 初始化 Firebase
# 全域安裝：
firebase init

# 本地安裝（你的情況）：
pnpm --dir frontend exec firebase init
# 或從 frontend 目錄執行：
cd frontend && pnpm exec firebase init && cd ..
```

選擇（用空白鍵選擇，Enter 確認）：

- ✅ **Firestore** - 必選
- ✅ **Storage** - 必選
- ❌ **Hosting** - 不選（你會用 Vercel 部署）

## 🔐 設定環境變數

### 1. 從 Firebase Console 取得配置

1. 前往 Firebase Console > 專案設定 > 一般
2. 在「您的應用程式」區塊，點擊「網頁」圖示
3. 註冊應用程式，取得配置資訊

### 2. 建立 .env 檔案（在 frontend 資料夾）

```bash
# 切換到 frontend 資料夾
cd frontend
cp .env.example .env
```

### 3. 填入 Firebase 配置

編輯 `frontend/.env` 檔案：

```env
NUXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NUXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 📤 部署 Security Rules（在專案根目錄）

**注意：這些指令要在專案根目錄執行，不是 frontend 資料夾**

```bash
# 確認在專案根目錄
cd /home/jian/Desktop/information_services

# 如果是全域安裝：
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only firestore:indexes

# 如果是本地安裝（你的情況）：
pnpm --dir frontend exec firebase deploy --only firestore:rules
pnpm --dir frontend exec firebase deploy --only storage
pnpm --dir frontend exec firebase deploy --only firestore:indexes

# 或從 frontend 目錄執行：
cd frontend
pnpm exec firebase deploy --only firestore:rules
pnpm exec firebase deploy --only storage
pnpm exec firebase deploy --only firestore:indexes
cd ..
```

## 👤 建立初始管理員帳號

### 方法 1: 使用 Firebase Console

1. 前往 Firebase Console > Authentication > Users
2. 點擊「新增使用者」
3. 輸入 Email 和 Password
4. 記下使用者的 UID

### 方法 2: 使用程式碼

在 Firebase Console > Firestore Database 手動新增：

**Collection: `users`**

建立第一個管理員文件：

```json
{
  "userId": "你的-authentication-uid",
  "email": "admin@example.com",
  "displayName": "系統管理員",
  "role": "admin",
  "phone": "0912345678",
  "isActive": true,
  "createdAt": "現在時間",
  "updatedAt": "現在時間"
}
```

**注意**：文件 ID 必須與 Authentication 中的 UID 相同！

## 🏗️ 建立初始資料結構

### 1. 建立範例班級

在 Firestore 中新增 Collection `classes`：

```json
{
  "className": "甲班",
  "classType": "日間照護",
  "caregivers": [],
  "clientCount": 0,
  "capacity": 12,
  "description": "日間照護甲班",
  "createdAt": "現在時間",
  "updatedAt": "現在時間"
}
```

### 2. 建立範例個案（選配）

在 Firestore 中新增 Collection `clients`：

```json
{
  "clientNumber": "C20250001",
  "name": "測試個案",
  "gender": "male",
  "birthDate": "1990-01-01",
  "age": 35,
  "classId": "班級ID",
  "basicInfo": {
    "bloodType": "A",
    "emergencyContact": {
      "name": "家屬姓名",
      "relationship": "父親",
      "phone": "0912345678"
    },
    "diagnosis": "範例診斷",
    "disabilityLevel": "中度"
  },
  "latestPhysical": {
    "height": null,
    "weight": null,
    "bmi": null,
    "measuredDate": null
  },
  "normalBloodPressure": {
    "systolicMin": 90,
    "systolicMax": 140,
    "diastolicMin": 50,
    "diastolicMax": 90
  },
  "isActive": true,
  "createdAt": "現在時間",
  "updatedAt": "現在時間"
}
```

## 🧪 測試後端連線

### 1. 啟動開發伺服器（在 frontend 資料夾）

```bash
# 切換到 frontend 資料夾
cd frontend

# 啟動開發伺服器
pnpm dev
```

### 2. 測試登入

訪問 `http://localhost:3000/login` 並使用管理員帳號登入。

## 📊 監控與除錯（在專案根目錄）

### 查看 Firestore 資料

```bash
# 在專案根目錄
cd /home/jian/Desktop/information_services
firebase firestore:indexes
```

### 查看 Security Rules

```bash
firebase firestore:rules
```

### 本地模擬器（開發用）

```bash
firebase emulators:start
```

這會啟動本地的 Firestore 和 Authentication 模擬器。

## 🔒 安全性檢查清單

- ✅ 已設定 Firestore Security Rules
- ✅ 已設定 Storage Security Rules
- ✅ 已建立管理員帳號
- ✅ 已在 Firebase Console 啟用 Email/Password 認證
- ✅ 已設定適當的 Firestore Indexes
- ✅ 已將 `.env` 加入 `.gitignore`
- ✅ 已在 Firebase Console 加入團隊成員（如有多人開發）

## 🐛 常見問題

### Q: 無法連線到 Firebase

**A:** 檢查 `.env` 檔案中的配置是否正確。

### Q: Firestore 操作權限不足

**A:** 確認已部署 Security Rules：`pnpm exec firebase deploy --only firestore:rules`

### Q: 部署時出現權限錯誤

**A:** 確認你的 Google 帳號已被加入 Firebase 專案成員，並有 Editor 以上的權限。

### Q: 新成員無法部署

**A:**

1. 確認已在 Firebase Console 加入該成員
2. 成員需要用 `pnpm exec firebase login` 登入自己的帳號
3. 使用 `pnpm exec firebase use <project-id>` 選擇正確的專案

### Q: 查詢太慢

**A:** 檢查是否需要新增 Composite Indexes，Firebase 會在 Console 中提示。

### Q: Authentication 失敗

**A:** 確認在 Firebase Console > Authentication > Sign-in method 中已啟用 Email/Password 方式。

## 📚 相關資源

- [Firebase 文檔](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure)
- [VueFire 文檔](https://vuefire.vuejs.org/)

---

**部署完成後，記得將後端相關資訊更新到專案文件中！**
