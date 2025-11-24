# Firestore 資料結構說明

## 集合概覽

本系統使用以下 Firestore 集合來儲存資料：

### 1. users (使用者集合)

儲存所有系統使用者的資料。

**欄位結構：**

```typescript
{
  id: string;              // 自動生成的文件 ID (與 Firebase Auth UID 相同)
  email: string;           // 電子郵件 (必填)
  displayName: string;     // 顯示名稱 (必填)
  phone?: string;          // 聯絡電話 (可選)
  role: string;            // 角色：'admin' | 'caregiver' | 'family'
  isActive: boolean;       // 帳號是否啟用
  createdAt: Timestamp;    // 建立時間
  updatedAt: Timestamp;    // 更新時間
  avatar?: string;         // 頭像 URL (可選)
  department?: string;     // 部門 (可選)
}
```

**角色說明：**

- `admin`: 管理員 - 完整權限
- `caregiver`: 照顧者 - 可管理個案、記錄
- `family`: 家屬 - 只能查看指定個案資料

**權限規則：**

- 所有登入者可讀取使用者列表
- 管理員可完整 CRUD
- 用戶可更新自己的資料（role 除外）
- 新用戶註冊時可創建自己的資料（僅限 caregiver 或 family 角色）

---

### 2. classes (班級集合)

儲存班級資訊。

**欄位結構：**

```typescript
{
  id: string;              // 自動生成的文件 ID
  name: string;            // 班級名稱 (必填)
  description?: string;    // 班級描述 (可選)
  instructorIds: string[]; // 負責照顧者 ID 列表
  createdAt: Timestamp;    // 建立時間
  updatedAt: Timestamp;    // 更新時間
}
```

**權限規則：**

- 照顧者和管理員可讀取、建立、更新、刪除

---

### 3. clients (個案集合)

儲存個案（服務對象）的基本資料。

**欄位結構：**

```typescript
{
  id: string;              // 自動生成的文件 ID
  name: string;            // 個案姓名 (必填)
  nickname?: string;       // 暱稱 (可選)
  gender: string;          // 性別：'male' | 'female' | 'other'
  birthDate: Timestamp;    // 出生日期
  photoUrl?: string;       // 照片 URL (可選)
  classId?: string;        // 所屬班級 ID (可選)
  familyIds: string[];     // 家屬 ID 列表
  guardianName?: string;   // 監護人姓名 (可選)
  guardianPhone?: string;  // 監護人電話 (可選)
  emergencyContact?: string; // 緊急聯絡人 (可選)
  emergencyPhone?: string; // 緊急聯絡電話 (可選)
  address?: string;        // 住址 (可選)
  medicalHistory?: string; // 病史 (可選)
  allergies?: string;      // 過敏史 (可選)
  medications?: string;    // 用藥 (可選)
  specialNeeds?: string;   // 特殊需求 (可選)
  notes?: string;          // 備註 (可選)
  isActive: boolean;       // 是否在案
  createdAt: Timestamp;    // 建立時間
  updatedAt: Timestamp;    // 更新時間
}
```

**權限規則：**

- 照顧者和管理員可讀取所有個案
- 家屬只能讀取自己的家人
- 照顧者和管理員可建立、更新、刪除

---

### 4. records (照護紀錄集合)

儲存日常照護紀錄。

**欄位結構：**

```typescript
{
  id: string;              // 自動生成的文件 ID
  clientId: string;        // 個案 ID (必填)
  clientName: string;      // 個案名稱 (冗餘，便於查詢)
  recordDate: Timestamp;   // 記錄日期
  category: string;        // 類別：'meal' | 'bathroom' | 'activity' | 'medication' | 'other'
  title: string;           // 標題 (必填)
  content: string;         // 內容 (必填)
  recordedBy: string;      // 記錄者 ID
  recordedByName: string;  // 記錄者名稱 (冗餘)
  attachments?: string[];  // 附件 URL 列表 (可選)
  tags?: string[];         // 標籤 (可選)
  isPinned: boolean;       // 是否置頂
  pinnedBy: string[];      // 置頂者 ID 列表
  createdAt: Timestamp;    // 建立時間
  updatedAt: Timestamp;    // 更新時間
}
```

**權限規則：**

- 照顧者和管理員可讀取所有紀錄
- 家屬只能讀取自己家人的紀錄
- 照顧者和管理員可建立、更新、刪除

---

### 5. vitalSignRecords (生命徵象紀錄集合)

儲存詳細的生命徵象測量記錄。

**欄位結構：**

```typescript
{
  id: string;              // 自動生成的文件 ID
  clientId: string;        // 個案 ID (必填)
  clientName: string;      // 個案名稱 (冗餘)
  measuredAt: Timestamp;   // 測量時間
  systolic?: number;       // 收縮壓 (mmHg)
  diastolic?: number;      // 舒張壓 (mmHg)
  heartRate?: number;      // 心率 (bpm)
  temperature?: number;    // 體溫 (°C)
  bloodOxygen?: number;    // 血氧 (%)
  bloodSugar?: number;     // 血糖 (mg/dL)
  notes?: string;          // 備註 (可選)
  measuredBy: string;      // 測量者 ID
  measuredByName: string;  // 測量者名稱 (冗餘)
  createdAt: Timestamp;    // 建立時間
  updatedAt: Timestamp;    // 更新時間
}
```

**權限規則：**

- 照顧者和管理員可讀取所有紀錄
- 家屬可讀取自己家人的紀錄
- 照顧者和管理員可建立、更新
- 只有管理員可刪除

---

### 6. monthlyVitalSigns (每月生命徵象集合)

儲存每月匯總的生命徵象資料。

**欄位結構：**

```typescript
{
  id: string;              // 自動生成的文件 ID
  clientId: string;        // 個案 ID (必填)
  clientName: string;      // 個案名稱 (冗餘)
  year: number;            // 年份
  month: number;           // 月份 (1-12)
  height?: number;         // 身高 (cm)
  weight?: number;         // 體重 (kg)
  bloodPressure?: string;  // 血壓 (格式：120/80)
  pulse?: number;          // 脈搏 (bpm)
  temperature?: number;    // 體溫 (°C)
  bloodOxygen?: number;    // 血氧 (%)
  bloodSugar?: number;     // 血糖 (mg/dL)
  notes?: string;          // 備註 (可選)
  recordedBy: string;      // 記錄者 ID
  recordedByName: string;  // 記錄者名稱 (冗餘)
  createdAt: Timestamp;    // 建立時間
  updatedAt: Timestamp;    // 更新時間
}
```

**權限規則：**

- 照顧者和管理員可讀取
- 家屬可讀取自己家人的紀錄
- 照顧者和管理員可建立、更新
- 只有管理員可刪除

---

### 7. physicalRecords (身高體重歷史紀錄集合)

儲存身高體重的歷史變化記錄。

**欄位結構：**

```typescript
{
  id: string;              // 自動生成的文件 ID
  clientId: string;        // 個案 ID (必填)
  clientName: string;      // 個案名稱 (冗餘)
  measuredAt: Timestamp;   // 測量時間
  height?: number;         // 身高 (cm)
  weight?: number;         // 體重 (kg)
  bmi?: number;            // BMI (自動計算)
  notes?: string;          // 備註 (可選)
  recordedBy: string;      // 記錄者 ID
  recordedByName: string;  // 記錄者名稱 (冗餘)
  createdAt: Timestamp;    // 建立時間
  updatedAt: Timestamp;    // 更新時間
}
```

**權限規則：**

- 照顧者和管理員可讀取
- 家屬可讀取自己家人的紀錄
- 照顧者和管理員可建立、更新
- 只有管理員可刪除

---

### 8. notifications (通知集合)

儲存系統通知。

**欄位結構：**

```typescript
{
  id: string;              // 自動生成的文件 ID
  userId: string;          // 接收者 ID (必填)
  type: string;            // 類型：'info' | 'warning' | 'success' | 'error'
  title: string;           // 標題 (必填)
  message: string;         // 訊息內容 (必填)
  isRead: boolean;         // 是否已讀
  link?: string;           // 相關連結 (可選)
  createdAt: Timestamp;    // 建立時間
}
```

**權限規則：**

- 只能讀取自己的通知
- 系統可建立通知（透過 Cloud Functions）
- 可更新自己的通知（標記為已讀）
- 可刪除自己的通知

---

## 資料關聯說明

### 使用者與個案

- `users.id` ↔ `clients.familyIds[]` (家屬關聯)
- `users.id` ↔ `classes.instructorIds[]` (照顧者關聯)

### 個案與記錄

- `clients.id` ↔ `records.clientId` (一對多)
- `clients.id` ↔ `vitalSignRecords.clientId` (一對多)
- `clients.id` ↔ `monthlyVitalSigns.clientId` (一對多)
- `clients.id` ↔ `physicalRecords.clientId` (一對多)

### 個案與班級

- `clients.classId` ↔ `classes.id` (多對一)

---

## 索引建議

為了提升查詢效能，建議在 Firebase Console 設定以下複合索引：

1. **records 集合**

   - `clientId` (升序) + `recordDate` (降序)
   - `clientId` (升序) + `category` (升序) + `recordDate` (降序)

2. **vitalSignRecords 集合**

   - `clientId` (升序) + `measuredAt` (降序)

3. **monthlyVitalSigns 集合**

   - `clientId` (升序) + `year` (降序) + `month` (降序)

4. **physicalRecords 集合**

   - `clientId` (升序) + `measuredAt` (降序)

5. **notifications 集合**
   - `userId` (升序) + `createdAt` (降序)
   - `userId` (升序) + `isRead` (升序) + `createdAt` (降序)

---

## 註冊流程說明

### 使用者註冊時需要提供的資料：

1. **必填欄位：**

   - `displayName`: 姓名
   - `email`: 電子郵件
   - `password`: 密碼（至少 6 個字元）
   - `role`: 角色（caregiver 或 family）
   - 同意服務條款

2. **可選欄位：**
   - `phone`: 聯絡電話

### 註冊後自動建立的欄位：

- `isActive`: true (帳號啟用狀態)
- `createdAt`: 當前時間戳
- `updatedAt`: 當前時間戳

### 權限限制：

- 新用戶只能註冊為 `caregiver` 或 `family` 角色
- `admin` 角色只能由現有管理員建立
- 用戶註冊後無法自行修改角色，需由管理員變更

---

## 最佳實踐

1. **資料冗餘**：部分欄位（如 `clientName`, `recordedByName`）進行冗餘儲存，以減少查詢次數
2. **軟刪除**：使用 `isActive` 欄位標記而非直接刪除資料
3. **時間戳**：統一使用 `serverTimestamp()` 確保時間一致性
4. **ID 命名**：使用 Firebase 自動生成的文件 ID
5. **陣列欄位**：謹慎使用，避免過大的陣列（如 `familyIds` 建議不超過 100 個元素）
