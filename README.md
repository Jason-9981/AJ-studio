# AJ Studio — 3D 數位人換裝與高精檢視系統

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://Jason-9981.github.io/AJ-studio/)
[![Three.js](https://img.shields.io/badge/Three.js-r164-black?logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

專為 **AJ Studio** 打造的網頁端 3D 數位人換裝與即時檢視系統，基於純原生 WebGL / Three.js 現代前端技術構建，完全開箱即用，可直接透過 GitHub Pages 或任意靜態網頁伺服器向全球展示。

---

## 視覺與核心功能演示

1. **雙參考影片與 3DGS AI 重建工作台**：
   - 內嵌整合使用者提供的雙參考影片：
     - **影片 1 (`1000188533.mp4`)**：衝浪高速動態姿態、水花光影、肌肉紋理與近距微距臉部特寫。
     - **影片 2 (`1000188535.mp4`)**：完整 Show Time 劇情感恩與海灘情境（"Can I ask you out for dinner tonight?"）。
   - 預留 3D Gaussian Splatting (3DGS) 與 AI 3D 重建 API 對接介面，提供即時進度視覺化回饋。
   - 支援拖曳或上傳本地全新環繞影片。

2. **3D 高自由度檢視器 (Three.js WebGL)**：
   - **360 度環繞**：滑鼠左鍵自由拖曳檢視全身與不同角度。
   - **無段式放大縮小**：滾輪支援從全景全身（Zoom Out）到面部毛孔、眼睛鏡框、皮膚水光感（Zoom In，近裁切面設為 0.25）。
   - **一鍵鏡頭快速聚焦導覽**：
     - 🔍 **面部細節**（鎖定 Y=1.71m 面部微距）
     - 🧍 **全身檢視**（鎖定全身體態比例）
     - 👟 **鞋履特寫**（鎖定雙足動態）
   - **攝影棚多風格布光**：支援一鍵切換「攝影棚燈光」、「海灘陽光（還原衝浪烈日）」與「賽博霓虹」。
   - **次表面散射 (SSS) 水光肌膚開關**：切換肌膚高光微光澤與啞光質感。

3. **四大分類換裝控制面板 (Right Wardrobe Sidebar)**：
   - **髮型**：影片同款短碎髮、雅痞微卷中髮、復古側分背頭。
   - **服飾**：
     - *現代新潮*：衝浪黑泳褲（影片同款）、深藍修身休閒西裝。
     - *經典復古*：美式復古工裝外套。
   - **眼鏡**：主角標誌性經典黑框眼鏡（影片同款）、復古金絲無框鏡、摘下眼鏡。
   - **鞋履**：極簡百搭白波鞋、英倫牛津手工皮鞋、陽光沙灘人字拖。
   - 具備即點即換、骨骼身型自動對齊不穿模。

---

## 專案目錄結構

```text
AJ-studio/
├── index.html               # 網頁主入口 (支援 GitHub Pages 直接預覽)
├── css/
│   └── style.css            # 樣式表與玻璃擬態動效
├── js/
│   ├── avatar3d.js          # Three.js 3D 數位人引擎、光影與相機平滑運鏡
│   └── main.js              # UI 交互、換裝邏輯、影片切換與 AI 重建排程
├── assets/
│   ├── videos/              # 存放 1000188533.mp4 與 1000188535.mp4
│   └── models/              # 存放 GLTF / 3DGS .splat 資源
└── README.md
```

---

## 快速推送到 GitHub 倉庫教學

請在本地終端機（Terminal）進入此目錄，直接複製並執行以下指令：

```bash
# 1. 初始化 Git 倉庫
git init

# 2. 加入所有完整版網頁檔案
git add .

# 3. 提交第一個版本
git commit -m "feat: complete AJ-Studio 3D digital human viewer with video & wardrobe system"

# 4. 指定主分支名稱為 main
git branch -M main

# 5. 連接至你的遠端倉庫
git remote add origin https://github.com/Jason-9981/AJ-studio.git

# 6. 推送至 GitHub
git push -u origin main
```

### 開啟 GitHub Pages 免費線上網頁：
1. 進入你的 GitHub 專案頁面：`https://github.com/Jason-9981/AJ-studio`
2. 點擊 **Settings** -> **Pages**。
3. 在 **Branch** 選擇 `main` 分支，資料夾選擇 `/ (root)`，點擊 **Save**。
4. 約 1 分鐘後，即可在線上訪問你的 3D 換裝檢視系統：  
   👉 `https://Jason-9981.github.io/AJ-studio/`
