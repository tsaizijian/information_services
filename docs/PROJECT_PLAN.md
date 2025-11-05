# 身心障礙學生照護紀錄系統 - 專案規劃文件

## 📋 專案概述

本系統旨在協助特教老師記錄與管理身心障礙學生的日常照護資料，提供完整的學生健康與照護追蹤功能。

## 📋 專案概述

本系統旨在協助照護機構的照顧者記錄與管理身心障礙人士的日常照護資料，提供完整的健康與照護追蹤功能。

### 核心功能

- 📝 照護紀錄管理
- � 人員與班級管理
- 📌 重要紀錄釘選
- 📊 資料匯出功能（生命徵象紀錄表等）
- 🔐 權限分級控管

---

## 🎯 使用者角色

### 1. 管理員 (Admin)

- 新增/編輯/刪除照顧者帳號
- 新增/編輯/刪除個案資料
- 管理班級/組別資料
- 查看所有紀錄
- 系統設定

### 2. 照顧者/照服員 (Caregiver)

- 新增照護紀錄
- 查看所屬班級個案紀錄
- 編輯自己的紀錄
- 釘選重要紀錄
- 匯出報表（生命徵象紀錄表等）

### 3. 家屬 (Family) - 選配

- 查看家人的紀錄（唯讀）
- 接收通知

---

## 🗂️ 資料結構設計

### Firestore Collections

#### 1. **users** (使用者集合)

```javascript
{
  userId: "auto-generated-id",
  email: "teacher@school.edu.tw",
  displayName: "王小明",
  role: "teacher|admin|parent", // 角色
  phone: "0912345678",
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: true
}
```

#### 2. **classes** (班級集合)

```javascript
{
  classId: "auto-generated-id",
  className: "甲班",
  teachers: ["teacherId1", "teacherId2"], // 導師/科任老師
  studentCount: 8,
  description: "啟智班甲班",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. **clients** (個案集合)

```javascript
{
  clientId: "auto-generated-id",
  // 不使用學號，改用編號或直接使用姓名
  clientNumber: "C20240001", // 個案編號（選填）
  name: "陳小華",
  gender: "male|female",
  birthDate: timestamp,
  age: 25,
  classId: "class-id",

  // 基本資料
  basicInfo: {
    idNumber: "A123456789", // 身分證字號（加密儲存）
    bloodType: "A",
    emergencyContact: {
      name: "陳大明",
      relationship: "父親",
      phone: "0912345678",
      phone2: "0987654321"
    },
    address: "桃園市...",
    diagnosis: "智能障礙、自閉症", // 診斷
    disabilityLevel: "中度", // 身障程度
    disabilityCard: "有", // 身障手冊
    allergies: "花生過敏",
    medications: "每日服用...",
    dietaryNeeds: "無特殊需求", // 飲食需求
    mobilityAids: "輪椅", // 行動輔具
    communicationMethod: "簡單口語、圖卡", // 溝通方式
    notes: "其他備註"
  },

  // 最新身高體重
  latestPhysical: {
    height: 165.5, // cm
    weight: 58.2, // kg
    bmi: 21.3,
    measuredDate: timestamp
  },

  // 正常血壓範圍（個人化設定）
  normalBloodPressure: {
    systolicMin: 90,
    systolicMax: 140,
    diastolicMin: 50,
    diastolicMax: 90
  },

  familyIds: ["familyId1", "familyId2"], // 家屬帳號
  isActive: true,
  admissionDate: timestamp, // 入住/開案日期
  dischargeDate: null, // 結案日期
  createdAt: timestamp,
  updatedAt: timestamp
}
```

```javascript
{
  studentId: "auto-generated-id",
  studentNumber: "S20240001", // 學號
  name: "陳小華",
  gender: "male|female",
  birthDate: timestamp,
  classId: "class-id",

  // 基本資料
  basicInfo: {
    bloodType: "A",
    emergencyContact: {
      name: "陳大明",
      relationship: "父親",
      phone: "0912345678",
      phone2: "0987654321"
    },
    address: "台北市中正區...",
    specialNeeds: "自閉症、注意力不足",
    allergies: "花生過敏",
    medications: "每日服用...",
    notes: "其他備註"
  },

  // 最新身高體重
  latestPhysical: {
    height: 150.5, // cm
    weight: 45.2, // kg
    bmi: 20.1,
    measuredDate: timestamp
  },

  parentIds: ["parentId1", "parentId2"],
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 4. **records** (照護紀錄集合 - 核心)

````javascript
#### 4. **records** (照護紀錄集合 - 核心)
```javascript
{
  recordId: "auto-generated-id",
  clientId: "client-id",
  clientName: "陳小華", // 冗餘欄位，方便查詢
  classId: "class-id",

  // 紀錄基本資訊
  recordedBy: "caregiverId", // 紀錄者
  recordedByName: "王照服員",
  handoverTo: "caregiverId2", // 交接給（可選）
  handoverToName: "李照服員",
  recordDate: timestamp, // 紀錄時間

  // 分類與內容
  category: "sleep|water|medical|physical|physiological|family_contact|care|other",
  title: "午睡紀錄",
  content: "詳細照護內容...",

  // 詳細資料（依分類不同）
  details: {
    // 睡眠紀錄
    sleep: {
      startTime: timestamp,
      endTime: timestamp,
      duration: 60, // 分鐘
      quality: "good|fair|poor",
      notes: ""
    },

    // 喝水紀錄
    water: {
      amount: 200, // ml
      time: timestamp,
      type: "water|milk|juice"
    },

    // 回診/醫療紀錄
    medical: {
      hospitalName: "台大醫院",
      department: "復健科",
      doctor: "張醫師",
      appointmentDate: timestamp,
      diagnosis: "診斷內容",
      prescription: "處方內容",
      nextAppointment: timestamp
    },

    // 身高體重紀錄
    physical: {
      height: 150.5,
      weight: 45.2,
      bmi: 20.1,
      headCircumference: 52.0, // 頭圍（選填）
      measuredDate: timestamp
    },

    // 生理紀錄
    physiological: {
      temperature: 36.5, // 體溫
      bloodPressure: "120/80",
      heartRate: 75,
      respiratoryRate: 18,
      urination: 5, // 排尿次數
      bowelMovement: "normal|constipation|diarrhea",
      menstruation: true, // 月經（女生）
      notes: ""
    },

    // 家長聯絡
    parentContact: {
      contactMethod: "phone|line|in_person|note",
      contactPerson: "陳媽媽",
      topic: "聯絡主題",
      result: "聯絡結果"
    }
  },

  // 附件
  attachments: [
    {
      fileName: "photo.jpg",
      fileUrl: "firebase-storage-url",
      fileType: "image|pdf|doc",
      uploadedAt: timestamp
    }
  ],

  // 釘選與標記
  isPinned: false, // 是否釘選
  pinnedBy: ["caregiverId1"], // 釘選者列表
  tags: ["重要", "追蹤"],

  // 交接確認
  handoverConfirmed: false,
  handoverConfirmedAt: timestamp,

  createdAt: timestamp,
  updatedAt: timestamp
}
````

#### 5. **physicalRecords** (身高體重歷史紀錄)

```javascript
{
  recordId: "auto-generated-id",
  studentId: "student-id",
  height: 150.5,
  weight: 45.2,
  bmi: 20.1,
  headCircumference: 52.0,
  measuredDate: timestamp,
  measuredBy: "teacherId",
  notes: "",
  createdAt: timestamp
}
```

#### 6. **notifications** (通知集合 - 選配)

```javascript
{
  notificationId: "auto-generated-id",
  userId: "user-id",
  type: "handover|medical|important",
  title: "交接通知",
  content: "王老師交接了學生陳小華的照護事項",
  relatedRecordId: "record-id",
  isRead: false,
  createdAt: timestamp
}
```

---

## 📱 頁面結構規劃

### 前台頁面

#### 1. **首頁 / 儀表板** (`/`)

- **總紀錄列表**
  - 時間軸顯示
  - 篩選功能：日期、班級、學生、分類、紀錄者
  - 搜尋功能
  - 釘選紀錄置頂顯示
- **統計概覽**
  - 今日紀錄數
  - 待交接事項
  - 近期回診提醒
- **快速操作**
  - 新增紀錄
  - 查看班級
  - 待辦事項

#### 2. **新增/編輯紀錄** (`/records/new`, `/records/[id]/edit`)

- 表單欄位：
  - 學生選擇（下拉選單，依班級分組）
  - 紀錄日期時間
  - 分類選擇
  - 交接對象（可選）
  - 內容編輯器
  - 依分類顯示對應詳細欄位
  - 附件上傳
  - 標籤設定
  - 釘選選項

#### 3. **紀錄詳情** (`/records/[id]`)

- 完整紀錄內容
- 學生基本資料卡片
- 附件預覽/下載
- 編輯/刪除按鈕（權限控管）
- 釘選/取消釘選
- 交接確認按鈕
- 相關紀錄推薦

#### 4. **學生管理** (`/students`)

- **學生列表**
  - 依班級分組顯示
  - 搜尋功能
  - 卡片或表格檢視切換
- **學生詳情頁** (`/students/[id]`)
  - 基本資料
  - 最新身高體重
  - 特殊需求與注意事項
  - 該學生的紀錄歷史（時間軸）
  - 身高體重成長曲線圖
  - 快速新增紀錄

#### 5. **班級管理** (`/classes`)

- **班級列表**
  - 班級卡片
  - 學生人數統計
- **班級詳情** (`/classes/[id]`)
  - 班級資訊
  - 學生列表
  - 班級紀錄統計
  - 導師資訊

#### 6. **人員管理** (`/users`) - 僅管理員

- 教師列表
- 新增/編輯教師
- 權限設定
- 啟用/停用帳號

#### 7. **匯出報表** (`/export`)

- 匯出條件設定：
  - 日期區間
  - 班級/學生
  - 紀錄分類
  - 匯出格式（Excel / PDF / CSV）
- 報表範本選擇：
  - 完整照護紀錄
  - 生理數據統計
  - 家長聯絡記錄
  - 回診記錄彙整

#### 8. **個人設定** (`/profile`)

- 個人資料編輯
- 密碼變更
- 通知設定
- 顯示偏好

#### 9. **登入/登出** (`/login`, `/logout`)

- Firebase Authentication
- Email + Password
- Google Sign-In（選配）

---

## 🎨 UI/UX 設計建議

### 使用 PrimeVue 元件

#### 主要元件選用

- **DataTable**: 紀錄列表、學生列表
- **Timeline**: 照護紀錄時間軸
- **Card**: 資訊卡片展示
- **Dialog**: 彈窗表單
- **Dropdown**: 下拉選單（學生、分類選擇）
- **Calendar**: 日期時間選擇
- **Chart**: 身高體重成長曲線
- **FileUpload**: 附件上傳
- **Tag**: 標籤顯示
- **Badge**: 狀態標記
- **Button**: 操作按鈕
- **InputText / Textarea**: 表單輸入
- **Toast**: 操作提示訊息
- **ConfirmDialog**: 確認對話框
- **Skeleton**: 載入骨架屏

### 色彩規劃（參考特教友善色彩）

- **主色調**: 溫暖的藍色 (#4A90E2) - 專業、信賴
- **輔助色**: 柔和的綠色 (#7ED321) - 健康、成長
- **警示色**: 橙色 (#F5A623) - 提醒、注意
- **危險色**: 柔和的紅色 (#E57373) - 警告
- **中性色**: 灰色系 (#F5F5F5, #E0E0E0)

### 分類圖示與顏色

- 😴 **睡眠**: #9C88FF (紫色)
- 💧 **喝水**: #4FC3F7 (淺藍)
- 🏥 **回診**: #EF5350 (紅色)
- 📏 **身高體重**: #66BB6A (綠色)
- 🩺 **生理紀錄**: #FFA726 (橙色)
- 👪 **家長聯絡**: #42A5F5 (藍色)
- ❤️ **照護內容**: #EC407A (粉紅)
- 📝 **其他**: #78909C (灰色)

---

## 🔧 技術架構

### 前端 (Nuxt 3)

```
frontend/
├── app/
│   ├── app.vue                 # 主應用
│   ├── layouts/
│   │   ├── default.vue         # 預設布局（含側邊欄）
│   │   └── auth.vue            # 登入頁面布局
│   ├── pages/
│   │   ├── index.vue           # 首頁儀表板
│   │   ├── login.vue           # 登入頁
│   │   ├── records/
│   │   │   ├── index.vue       # 紀錄列表
│   │   │   ├── new.vue         # 新增紀錄
│   │   │   ├── [id]/
│   │   │   │   ├── index.vue   # 紀錄詳情
│   │   │   │   └── edit.vue    # 編輯紀錄
│   │   ├── students/
│   │   │   ├── index.vue       # 學生列表
│   │   │   └── [id].vue        # 學生詳情
│   │   ├── classes/
│   │   │   ├── index.vue       # 班級列表
│   │   │   └── [id].vue        # 班級詳情
│   │   ├── users/
│   │   │   └── index.vue       # 人員管理
│   │   ├── export.vue          # 匯出報表
│   │   └── profile.vue         # 個人設定
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppSidebar.vue
│   │   │   └── AppFooter.vue
│   │   ├── records/
│   │   │   ├── RecordCard.vue
│   │   │   ├── RecordForm.vue
│   │   │   ├── RecordTimeline.vue
│   │   │   ├── RecordFilters.vue
│   │   │   └── CategoryForms/
│   │   │       ├── SleepForm.vue
│   │   │       ├── WaterForm.vue
│   │   │       ├── MedicalForm.vue
│   │   │       ├── PhysicalForm.vue
│   │   │       ├── PhysiologicalForm.vue
│   │   │       └── ParentContactForm.vue
│   │   ├── students/
│   │   │   ├── StudentCard.vue
│   │   │   ├── StudentForm.vue
│   │   │   ├── StudentInfo.vue
│   │   │   └── GrowthChart.vue
│   │   ├── classes/
│   │   │   ├── ClassCard.vue
│   │   │   └── ClassForm.vue
│   │   └── common/
│   │       ├── FileUploader.vue
│   │       ├── DateRangePicker.vue
│   │       └── ConfirmButton.vue
│   ├── composables/
│   │   ├── useAuth.ts          # 認證管理
│   │   ├── useFirestore.ts     # Firestore 操作
│   │   ├── useRecords.ts       # 紀錄管理
│   │   ├── useStudents.ts      # 學生管理
│   │   ├── useClasses.ts       # 班級管理
│   │   ├── useUsers.ts         # 使用者管理
│   │   └── useExport.ts        # 匯出功能
│   ├── middleware/
│   │   ├── auth.ts             # 認證中介層
│   │   └── role.ts             # 權限檢查
│   └── plugins/
│       ├── firebase.ts         # Firebase 初始化
│       └── primevue.ts         # PrimeVue 設定
├── server/
│   └── api/
│       └── export/             # 匯出 API（選配）
├── assets/
│   └── css/
│       └── main.css
├── public/
└── nuxt.config.ts
```

### 後端 (Firebase)

- **Authentication**: 使用者認證
- **Firestore**: 資料庫
- **Storage**: 附件儲存
- **Cloud Functions**:
  - 資料匯出（背景處理）
  - 通知推送
  - 定期備份
  - 資料統計

---

## 🚀 開發階段規劃

### Phase 1: 基礎建置（2 週）

- [ ] Firebase 專案設定
- [ ] Nuxt + Firebase 整合
- [ ] 認證系統（登入/登出）
- [ ] 基本路由與布局
- [ ] Firestore 資料結構建立

### Phase 2: 核心功能（3 週）

- [ ] 個案管理（CRUD）
- [ ] 班級管理（CRUD）
- [ ] 照護紀錄新增/編輯
- [ ] 紀錄列表與篩選
- [ ] 紀錄詳情頁
- [ ] 每月生命徵象紀錄功能

### Phase 3: 進階功能（2 週）

- [ ] 分類表單（各種照護類型）
- [ ] 附件上傳功能
- [ ] 釘選功能
- [ ] 交接功能
- [ ] 搜尋功能

### Phase 4: 資料視覺化（1 週）

- [ ] 儀表板統計
- [ ] 生命徵象趨勢圖（體重、血壓、脈搏、血氧）
- [ ] 照護紀錄時間軸
- [ ] 統計圖表

### Phase 5: 匯出與報表（1.5 週）

- [ ] **生命徵象紀錄表匯出（重點功能）**
- [ ] Excel 匯出
- [ ] PDF 匯出
- [ ] 客製化報表範本
- [ ] 批次匯出

### Phase 6: 優化與測試（1 週）

- [ ] 權限細化
- [ ] 效能優化
- [ ] RWD 響應式調整
- [ ] 使用者測試與修正
- [ ] 部署上線

---

## 📦 必要套件安裝

```bash
# Firebase
pnpm add firebase

# 日期處理
pnpm add dayjs

# 匯出功能
pnpm add xlsx jspdf jspdf-autotable

# 圖表
pnpm add chart.js vue-chartjs

# 表單驗證
pnpm add vee-validate @vee-validate/zod zod

# 工具函式
pnpm add lodash-es

# 開發工具
pnpm add -D @types/lodash-es
```

---

## 🔐 權限控管規則

### Firestore Security Rules 範例

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 使用者必須登入
    function isAuthenticated() {
      return request.auth != null;
    }

    // 檢查是否為管理員
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // 檢查是否為教師或管理員
    function isTeacherOrAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['teacher', 'admin'];
    }

    // 使用者集合
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // 班級集合
    match /classes/{classId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // 個案集合
    match /clients/{clientId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAdmin();
    }

    // 每月生命徵象集合
    match /monthlyVitalSigns/{recordId} {
      allow read: if isAuthenticated();
      allow create, update: if isTeacherOrAdmin();
      allow delete: if isAdmin();
    }

    // 紀錄集合
    match /records/{recordId} {
      allow read: if isAuthenticated();
      allow create: if isTeacherOrAdmin();
      allow update, delete: if isTeacherOrAdmin() &&
                               (resource.data.recordedBy == request.auth.uid || isAdmin());
    }

    // 身高體重紀錄
    match /physicalRecords/{recordId} {
      allow read: if isAuthenticated();
      allow create, update: if isTeacherOrAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

---

## 📊 匯出功能規劃

### Excel 匯出格式

#### 1. 完整照護紀錄

| 日期 | 時間 | 學生 | 班級 | 分類 | 紀錄者 | 交接給 | 內容 | 備註 |
| ---- | ---- | ---- | ---- | ---- | ------ | ------ | ---- | ---- |

#### 2. 生理數據統計

| 學生 | 測量日期 | 身高(cm) | 體重(kg) | BMI | 體溫(°C) | 血壓 | 心跳 |
| ---- | -------- | -------- | -------- | --- | -------- | ---- | ---- |

#### 3. 家長聯絡記錄

| 日期 | 學生 | 聯絡人 | 聯絡方式 | 主題 | 內容 | 結果 |
| ---- | ---- | ------ | -------- | ---- | ---- | ---- |

### PDF 報表範本

- 封面：學校名稱、班級、學期
- 目錄
- 學生基本資料摘要
- 照護紀錄彙整（依日期排序）
- 生理數據圖表
- 附錄：特殊事項說明

---

## 🎯 特色功能建議

### 1. 智慧提醒

- 回診日期前 3 天提醒
- 定期量測身高體重提醒（每月）
- 長時間未更新紀錄提醒

### 2. 快速記錄範本

- 常用紀錄範本儲存
- 一鍵複製前一次紀錄
- 語音輸入（未來功能）

### 3. 數據分析

- 睡眠品質趨勢圖
- 飲水量統計
- 生理數值變化追蹤
- 照護頻率分析

### 4. 協作功能

- 交接任務追蹤
- 團隊備註共享
- 重要事項標記提醒

### 5. 家長功能（選配）

- 家長專屬帳號（唯讀）
- 每日照護摘要推送
- 重要事項通知

---

## 🔒 資料安全與備份

### 安全措施

1. **認證機制**: Firebase Authentication
2. **資料加密**: Firestore 自動加密
3. **權限控管**: 細緻的 Security Rules
4. **操作日誌**: 記錄重要操作

### 備份策略

1. **每日自動備份**: Cloud Functions 定時備份至 Storage
2. **版本控制**: 重要紀錄保留編輯歷史
3. **匯出備份**: 定期匯出資料到本地保存

---

## 📱 響應式設計

### 支援裝置

- 💻 **桌面**: 1920x1080 以上
- 💻 **筆電**: 1366x768
- 📱 **平板**: iPad (768x1024)
- 📱 **手機**: iPhone / Android (375x667 以上)

### 布局策略

- 桌面：側邊欄 + 主內容區
- 平板：可收合側邊欄
- 手機：底部導航列

---

## 🎓 培訓與文件

### 使用者手冊

1. 快速入門指南
2. 功能操作說明
3. 常見問題 FAQ
4. 匯出報表教學

### 開發文件

1. 架構說明
2. API 文件
3. 資料庫 Schema
4. 部署指南

---

## 📈 未來擴充可能

1. **行動 APP**: React Native / Flutter
2. **離線功能**: PWA + IndexedDB
3. **AI 輔助**: 自動分類、異常偵測、生命徵象異常警報
4. **多語系**: 中文、英文、台語
5. **整合其他系統**: 醫療系統、家屬 APP
6. **視訊通話**: 遠距諮詢功能
7. **問卷調查**: 家屬滿意度調查
8. **電子簽名**: 家屬確認簽名功能

---

## 💻 生命徵象紀錄表實作範例

### 1. Composable: `useVitalSigns.ts`

```typescript
// composables/useVitalSigns.ts
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export const useVitalSigns = () => {
  const { $firestore } = useNuxtApp();

  // 取得某個案某年度的12個月生命徵象
  const getYearlyVitalSigns = async (clientId: string, year: number) => {
    const q = query(
      collection($firestore, "monthlyVitalSigns"),
      where("clientId", "==", clientId),
      where("year", "==", year)
    );

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 建立完整的12個月資料（補空白月份）
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const record = records.find((r) => r.month === month);
      monthlyData.push({
        month,
        weight: record?.weight || null,
        bloodPressure: record?.bloodPressure || "/",
        pulse: record?.pulse || null,
        bloodOxygen: record?.bloodOxygen || null,
        measuredBy: record?.measuredByName || "",
        measuredDate: record?.measuredDate || null,
      });
    }

    return monthlyData;
  };

  // 新增或更新月份紀錄
  const saveMonthlyVitalSign = async (data: {
    clientId: string;
    clientName: string;
    year: number;
    month: number;
    weight?: number;
    bloodPressure?: string;
    pulse?: number;
    bloodOxygen?: number;
    measuredBy: string;
    measuredByName: string;
    notes?: string;
  }) => {
    // 檢查是否已存在
    const q = query(
      collection($firestore, "monthlyVitalSigns"),
      where("clientId", "==", data.clientId),
      where("year", "==", data.year),
      where("month", "==", data.month)
    );

    const snapshot = await getDocs(q);

    const recordData = {
      ...data,
      measuredDate: new Date(),
      updatedAt: new Date(),
    };

    if (snapshot.empty) {
      // 新增
      await addDoc(collection($firestore, "monthlyVitalSigns"), {
        ...recordData,
        createdAt: new Date(),
      });
    } else {
      // 更新
      const docRef = doc($firestore, "monthlyVitalSigns", snapshot.docs[0].id);
      await updateDoc(docRef, recordData);
    }
  };

  return {
    getYearlyVitalSigns,
    saveMonthlyVitalSign,
  };
};
```

### 2. 匯出功能: `useExport.ts`

```typescript
// composables/useExport.ts
import * as XLSX from "xlsx";

export const useExport = () => {
  const { $firestore } = useNuxtApp();

  // 匯出生命徵象紀錄表（Excel）
  const exportVitalSignsToExcel = async (
    clientId: string,
    clientName: string,
    year: number,
    gender: string,
    normalBP?: {
      systolicMin: number;
      systolicMax: number;
      diastolicMin: number;
      diastolicMax: number;
    }
  ) => {
    const { getYearlyVitalSigns } = useVitalSigns();
    const monthlyData = await getYearlyVitalSigns(clientId, year);

    // 建立工作簿
    const wb = XLSX.utils.book_new();

    // 準備表格資料
    const tableData = [
      ["財團法人桃園市私立寶貝潛能發展中心"],
      [],
      ["生命徵象紀錄表"],
      [],
      [`${year}年    姓名：${clientName}    性別：${gender}`],
      [],
      ["月份", "體重", "血壓", "脈搏", "血氧", "紀錄者"],
    ];

    // 填入12個月資料
    const monthNames = [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ];
    monthlyData.forEach((data, index) => {
      tableData.push([
        monthNames[index],
        data.weight ? `${data.weight} kg` : "",
        data.bloodPressure || "/",
        data.pulse ? `${data.pulse} 分/次` : "分/次",
        data.bloodOxygen ? `${data.bloodOxygen} %` : "%",
        data.measuredBy || "",
      ]);
    });

    // 備註
    const bpNote = normalBP
      ? `※備註: 正常血壓 ${normalBP.systolicMin}-${normalBP.systolicMax}mmHg  舒張壓 ${normalBP.diastolicMin}-${normalBP.diastolicMax} mmHg`
      : "※備註: 正常血壓 90-140mmHg  舒張壓 50-90 mmHg";

    tableData.push([]);
    tableData.push([bpNote]);

    // 轉換為工作表
    const ws = XLSX.utils.aoa_to_sheet(tableData);

    // 設定欄寬
    ws["!cols"] = [
      { wch: 8 }, // 月份
      { wch: 12 }, // 體重
      { wch: 12 }, // 血壓
      { wch: 12 }, // 脈搏
      { wch: 10 }, // 血氧
      { wch: 15 }, // 紀錄者
    ];

    // 合併儲存格
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // 標題
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, // 生命徵象紀錄表
      { s: { r: 4, c: 0 }, e: { r: 4, c: 5 } }, // 年份姓名性別
    ];

    // 加入工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, "生命徵象紀錄表");

    // 下載
    XLSX.writeFile(wb, `生命徵象紀錄表_${clientName}_${year}年.xlsx`);
  };

  // 批次匯出整個班級
  const exportClassVitalSigns = async (classId: string, year: number) => {
    // 取得班級所有個案
    const clientsQuery = query(
      collection($firestore, "clients"),
      where("classId", "==", classId),
      where("isActive", "==", true)
    );

    const snapshot = await getDocs(clientsQuery);

    // 為每個個案匯出
    for (const doc of snapshot.docs) {
      const client = doc.data();
      await exportVitalSignsToExcel(
        doc.id,
        client.name,
        year,
        client.gender,
        client.normalBloodPressure
      );
    }
  };

  return {
    exportVitalSignsToExcel,
    exportClassVitalSigns,
  };
};
```

### 3. 元件: `MonthlyVitalSignsForm.vue`

```vue
<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="輸入生命徵象"
    :style="{ width: '500px' }"
  >
    <div class="flex flex-col gap-4">
      <div>
        <label class="block mb-2">個案</label>
        <p class="font-semibold">{{ clientName }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-2">年份</label>
          <InputNumber v-model="formData.year" :min="2020" :max="2050" />
        </div>
        <div>
          <label class="block mb-2">月份</label>
          <Dropdown
            v-model="formData.month"
            :options="monthOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="選擇月份"
          />
        </div>
      </div>

      <div>
        <label class="block mb-2">體重 (kg)</label>
        <InputNumber
          v-model="formData.weight"
          :min-fraction-digits="1"
          :max-fraction-digits="1"
        />
      </div>

      <div>
        <label class="block mb-2">血壓</label>
        <div class="flex items-center gap-2">
          <InputNumber v-model="systolic" placeholder="收縮壓" />
          <span>/</span>
          <InputNumber v-model="diastolic" placeholder="舒張壓" />
        </div>
      </div>

      <div>
        <label class="block mb-2">脈搏 (分/次)</label>
        <InputNumber v-model="formData.pulse" />
      </div>

      <div>
        <label class="block mb-2">血氧 (%)</label>
        <InputNumber v-model="formData.bloodOxygen" :min="0" :max="100" />
      </div>

      <div>
        <label class="block mb-2">備註</label>
        <Textarea v-model="formData.notes" rows="3" />
      </div>
    </div>

    <template #footer>
      <Button label="取消" severity="secondary" @click="visible = false" />
      <Button label="儲存" @click="handleSave" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  clientId: string;
  clientName: string;
  modelValue: boolean;
}>();

const emit = defineEmits(["update:modelValue", "saved"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const { saveMonthlyVitalSign } = useVitalSigns();
const { user } = useAuth();

const systolic = ref<number>();
const diastolic = ref<number>();

const formData = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  weight: null,
  bloodPressure: "",
  pulse: null,
  bloodOxygen: null,
  notes: "",
});

const monthOptions = [
  { label: "1月", value: 1 },
  { label: "2月", value: 2 },
  { label: "3月", value: 3 },
  { label: "4月", value: 4 },
  { label: "5月", value: 5 },
  { label: "6月", value: 6 },
  { label: "7月", value: 7 },
  { label: "8月", value: 8 },
  { label: "9月", value: 9 },
  { label: "10月", value: 10 },
  { label: "11月", value: 11 },
  { label: "12月", value: 12 },
];

const handleSave = async () => {
  // 組合血壓
  if (systolic.value && diastolic.value) {
    formData.value.bloodPressure = `${systolic.value}/${diastolic.value}`;
  }

  await saveMonthlyVitalSign({
    clientId: props.clientId,
    clientName: props.clientName,
    ...formData.value,
    measuredBy: user.value.uid,
    measuredByName: user.value.displayName,
  });

  emit("saved");
  visible.value = false;
};
</script>
```

### 4. 頁面使用範例

```vue
<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ client.name }} - 生命徵象</h1>
      <div class="flex gap-2">
        <Button
          label="輸入本月數據"
          icon="pi pi-plus"
          @click="showForm = true"
        />
        <Button
          label="匯出紀錄表"
          icon="pi pi-download"
          severity="success"
          @click="handleExport"
        />
      </div>
    </div>

    <!-- 顯示表格 -->
    <DataTable :value="vitalSignsData" class="mt-4">
      <Column field="month" header="月份" />
      <Column field="weight" header="體重 (kg)" />
      <Column field="bloodPressure" header="血壓" />
      <Column field="pulse" header="脈搏 (分/次)" />
      <Column field="bloodOxygen" header="血氧 (%)" />
      <Column field="measuredBy" header="紀錄者" />
    </DataTable>

    <!-- 輸入表單 -->
    <MonthlyVitalSignsForm
      v-model="showForm"
      :client-id="clientId"
      :client-name="client.name"
      @saved="loadData"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const clientId = route.params.id as string;

const { getYearlyVitalSigns } = useVitalSigns();
const { exportVitalSignsToExcel } = useExport();

const showForm = ref(false);
const client = ref({});
const vitalSignsData = ref([]);
const currentYear = new Date().getFullYear();

const loadData = async () => {
  vitalSignsData.value = await getYearlyVitalSigns(clientId, currentYear);
};

const handleExport = () => {
  exportVitalSignsToExcel(
    clientId,
    client.value.name,
    currentYear,
    client.value.gender,
    client.value.normalBloodPressure
  );
};

onMounted(() => {
  loadData();
});
</script>
```

---

## 📞 聯絡與支援

- **技術支援**: 系統管理員
- **使用問題**: 請洽機構資訊人員
- **緊急聯絡**: [聯絡方式]

---

## 📝 版本記錄

- **v1.0.0** (2025-11) - 初版規劃文件（照護機構版）
  - 調整為照護機構使用情境
  - 新增生命徵象紀錄表功能
  - 提供完整實作範例

---

**最後更新**: 2025-11-04
**文件維護**: 開發團隊
**文件維護**: 開發團隊
