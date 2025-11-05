# Vercel 部署指南

## 🚀 為什麼用 Vercel？

- ✅ **專為 Nuxt 優化**，部署超快
- ✅ **完全免費**（個人使用）
- ✅ **自動部署**，推送到 GitHub 就自動更新
- ✅ **全球 CDN**，速度快
- ✅ **自動 HTTPS**，免費 SSL 憑證
- ✅ **環境變數管理**，方便又安全

## 📋 前置準備

1. GitHub 帳號
2. 將專案推送到 GitHub
3. Vercel 帳號（用 GitHub 登入即可）

## 🔧 部署步驟

### 1. 推送專案到 GitHub

```bash
cd /home/jian/Desktop/information_services

# 初始化 git（如果還沒有）
git init

# 加入所有檔案
git add .

# 提交
git commit -m "Initial commit"

# 連結到 GitHub repo（先在 GitHub 建立 repo）
git remote add origin https://github.com/你的帳號/你的repo名稱.git

# 推送
git push -u origin main
```

### 2. 在 Vercel 部署

1. 前往 [Vercel](https://vercel.com/)
2. 用 GitHub 帳號登入
3. 點擊「Add New Project」
4. 選擇你的 GitHub repo
5. 設定：
   - **Framework Preset**: 自動偵測為 Nuxt
   - **Root Directory**: `frontend`（重要！）
   - **Build Command**: `pnpm build`（預設正確）
   - **Output Directory**: `.output`（預設正確）

### 3. 設定環境變數

在 Vercel 專案設定中：

1. 進入 **Settings** > **Environment Variables**
2. 加入以下變數（從你的 `.env` 檔案複製）：

```
NUXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NUXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**重要**：每個變數都要個別加入！

3. 點擊「Save」
4. 重新部署（Deployments > 最新的 > Redeploy）

### 4. 完成！🎉

- 你會得到一個網址，例如：`https://your-project.vercel.app`
- 之後每次推送到 GitHub，Vercel 會自動重新部署

## 🔄 自動部署流程

```bash
# 1. 修改程式碼
# 2. 提交變更
git add .
git commit -m "Update something"
git push

# 3. Vercel 自動偵測並部署（不用做任何事！）
# 4. 1-2 分鐘後網站就更新了
```

## 🌐 自訂網域（選配）

如果你有自己的網域：

1. 在 Vercel 專案設定中
2. 進入 **Domains**
3. 加入你的網域
4. 按照指示設定 DNS

## 📁 專案結構設定

確保你的 `vercel.json` 配置正確（可選，Vercel 通常自動處理）：

```json
{
  "buildCommand": "cd frontend && pnpm build",
  "outputDirectory": "frontend/.output/public",
  "framework": "nuxtjs"
}
```

或者在 Vercel Dashboard 設定：

- **Root Directory**: `frontend`

## 🔐 Firebase 授權網域設定

部署後，需要在 Firebase Console 加入 Vercel 網址：

1. 前往 Firebase Console > Authentication > Settings
2. 找到「Authorized domains」
3. 點擊「Add domain」
4. 加入你的 Vercel 網址：`your-project.vercel.app`

**不加的話會無法登入！**

## 🐛 常見問題

### Q: 部署失敗

**A:** 檢查：

1. Root Directory 是否設為 `frontend`
2. 環境變數是否都加入
3. 建置指令是否正確

### Q: 登入失敗

**A:** 確認已在 Firebase Console 的 Authorized domains 加入 Vercel 網址

### Q: 環境變數沒作用

**A:**

1. 確認變數名稱正確（必須是 `NUXT_PUBLIC_` 開頭）
2. 加入變數後要重新部署
3. 不要把 `.env` 檔案推送到 GitHub

### Q: 想要多個環境（開發/正式）

**A:**

- **Production**: 主分支（main/master）
- **Preview**: 其他分支會自動建立預覽網址
- 可以在 Vercel 為不同環境設定不同的環境變數

## 💰 費用

- **Hobby Plan（免費）**：

  - 無限專案
  - 100 GB 頻寬/月
  - 無限 Serverless Function 執行
  - 對個人專案完全足夠

- **Pro Plan（$20/月）**：
  - 更多頻寬
  - 團隊協作
  - 進階分析

## 📊 監控與分析

Vercel Dashboard 提供：

- ✅ 建置日誌
- ✅ 部署歷史
- ✅ 效能分析
- ✅ 流量統計

## 🎯 最佳實務

1. **使用 Preview Deployments**

   - 每個 PR 都會自動建立預覽網址
   - 測試完成後再合併到主分支

2. **保護主分支**

   - 在 GitHub 設定 branch protection
   - 要求 review 才能合併

3. **環境變數管理**
   - 敏感資訊只存在 Vercel，不要推送到 GitHub
   - 使用不同環境的變數

## 📚 相關資源

- [Vercel 文檔](https://vercel.com/docs)
- [Nuxt on Vercel](https://vercel.com/docs/frameworks/nuxt)
- [環境變數指南](https://vercel.com/docs/concepts/projects/environment-variables)

---

**部署後記得測試登入功能，並在 Firebase 加入授權網域！**
