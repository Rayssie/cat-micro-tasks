# AGENTS.md - 像素貓咪「拖延症微任務拆解器」開發與擴充規範

## 1. 專案目的 (Project Purpose)
本專案為「拖延症患者微任務拆解器（Cat Micro-Task Breaker）」。旨在將令人想逃避的大型任務（如寫報告、整理房間），拆解為 5 個極度簡單、耗時不超過 5 分鐘的「無痛啟動微任務」。透過可愛的像素貓咪陪伴與 RPG 闖關機制，降低使用者的心理阻力。

## 2. 網頁整體風格 (Visual & Tone Style)
- **視覺風格：** 8-bit 復古掌機（Game Boy / 紅白機）像素風。
- **色彩規範：**
  - 背景主色：溫暖燕麥奶白 `#FDF6E3`
  - 卡片底色：純白 `#FFFFFF` 搭配 `4px solid #2C2C2C` 像素黑框與硬陰影（`box-shadow: 4px 4px 0px #2C2C2C`）
  - 強調色（按鈕/進度條）：橘貓橘 `#FF9F1C`、肉球粉 `#FFBF69`、破關綠 `#2EC4B6`
- **文字語氣：** 像一隻「慵懶但溫柔鼓勵主人的橘貓」，語氣輕鬆、零壓力、帶有少量貓咪元素（如「喵」、「伸個懶腰」），嚴禁說教或製造焦慮。

## 3. 頁面結構與運作邏輯 (Page Architecture)
本網站為單頁式應用（SPA）結構，由 `index.html` 與 `js/app.js` 動態渲染，分為兩個狀態視圖：
1. **大廳視圖 (Lobby View)：** 讀取 `data/manifest.json`，將所有任務渲染為可點擊的「關卡卡片」。
2. **關卡視圖 (Quest View)：** 點擊卡片後，讀取對應的 `data/<task-id>.json`，顯示頂部貓咪狀態圖、血條（進度條），以及一次只顯示一個的「微任務步驟（Step 1 ~ Step 5）」。完成所有步驟後顯示破關畫面。

## 4. 檔案命名與放置規則 (File Naming & Placement)
- **新增任務資料：** 必須放置於 `/data/` 資料夾下，檔名一律使用 **全小寫英文與連字號（kebab-case）**，例如 `prepare-interview.json`。
- **更新索引清單：** 每次在 `/data/` 新增任務 JSON 後，**必須同步將該任務的摘要資訊加入 `/data/manifest.json`**，否則首頁無法顯示。
- **禁止修改區域：** 新增任務內容時，**嚴禁修改** `index.html`、`css/pixel-style.css` 與 `js/app.js` 的核心程式碼。

## 5. 新增內容格式規範 (Content Schema & Rules)
當被要求「新增一個任務劇本」時，必須嚴格遵守以下 JSON 格式與內容限制：

### JSON 結構模板 (`data/<task-id>.json`)
```json
{
  "id": "task-id-here",
  "title": "任務標題（限 12 字以內）",
  "category": "學業 | 生活 | 職場 | 自我照顧",
  "difficulty": "★☆☆☆☆",
  "cat_intro": "貓咪開場白（限 35 字以內，安撫焦慮用）",
  "steps": [
    {
      "step_number": 1,
      "action": "動詞開頭的極小動作（限 20 字以內）",
      "duration_mins": 2,
      "cat_tip": "貓咪的無痛小提示（限 30 字以內）"
    }
  ],
  "cat_outro": "破關祝賀詞（限 35 字以內）"
}