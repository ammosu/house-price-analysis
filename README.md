# 房價分析系統

這是一個以 Next.js 開發的房價分析系統，提供房價資料視覺化與分析功能。

## 功能特色

- 📊 資料分析：支援房價趨勢分析與統計
- 🗺️ 地圖視覺化：整合 Leaflet 地圖呈現房價分布
- 📈 互動式圖表：運用 Recharts 和 Tremor 提供豐富的資料視覺化
- 📁 檔案上傳：支援 CSV 格式的房價資料上傳與解析
- 💻 響應式設計：支援各種裝置尺寸的介面

## 技術架構

- **前端框架**：Next.js 15
- **程式語言**：TypeScript
- **使用者介面框架**：
  - Tailwind CSS
  - Radix UI
  - Tremor
- **地圖**：Leaflet / React-Leaflet
- **圖表**：Recharts
- **資料處理**：Papa Parse
- **容器化**：Docker

## 開始使用

### 本機開發

1. 安裝套件：
```bash
npm install
```

2. 啟動開發伺服器：
```bash
npm run dev
```

3. 開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

### Docker 部署

1. 建立 Docker 映像檔：
```bash
docker-compose build
```

2. 啟動容器：
```bash
docker-compose up -d
```

3. 前往 [http://localhost:3000](http://localhost:3000)

## 系統需求

- Node.js 18.0 以上版本
- npm 9.0 以上版本
- Docker（若需容器化部署）

## 開發指令

- `npm run dev` - 啟動開發伺服器
- `npm run build` - 建立正式版本
- `npm run start` - 啟動正式伺服器
- `npm run lint` - 執行程式碼檢查

## 授權條款

本專案採用 MIT 授權條款。詳情請參閱 [LICENSE](LICENSE) 檔案。