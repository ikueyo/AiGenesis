產品需求文件 (PRD) - AI 雙語創世神 (AI Genesis)

項目

內容

專案名稱

AI Genesis: Bilingual Art Tech Island

適用對象

國小高年級 (5-6 年級)

當前版本

v0.6 (新增雙層咒語系統)

核心技術

Three.js, Web Speech API, Procedural Generation

文件日期

2025-12-18

1. 專案概述 (Executive Summary)

1.1 背景與痛點

傳統雙語教學常將語言視為考核科目，導致學生開口焦慮（Affective Filter）高。而藝術科技課程往往偏重操作，語言僅為事後發表的附屬品。

本專案旨在將英語轉化為「創作工具」，實現「所說即所得」。

1.2 產品願景

打造一款基於 Web 的 3D 生成式藝術應用。

學生扮演「創世神」，透過精準的英語單字與句型指令，即時驅動 AI 演算法，從無到有建立一個活著的微型生態島嶼。

1.3 核心價值：Language is the Brush

即時回饋 (Real-time Feedback)：
發音正確 -> 物件生成；發音錯誤 -> 無反應。

自主迭代 (Self-Correction)：
為了讓畫面更豐富，學生會主動嘗試更複雜的形容詞與句型。

去 LLM 化 (Rule-based)：
不依賴大型語言模型，強迫學生精準使用目標詞彙（Target Vocabulary），而非依賴 AI 的模糊語意推論。

課程整合 (Curriculum Integration)：[NEW]
將課本句型轉化為「魔法咒語」，讓背誦課文成為解鎖隱藏特效的手段。

2. 使用者流程 (User Journey)

喚醒 (Wake Word)：
學生進入空白海洋，按住麥克風按鈕。

基礎建設 (Genesis)：
使用核心單字（如 "Tree", "River"）建立島嶼的基本地貌與生態。

魔法詠唱 (Bonus Spell)：[NEW]
學生念出英語課本上的完整句型（如 "It is a sunny day"），觸發全域特殊效果（如天空放晴、出現彩虹）。

觀察與修正 (Observe & Modify)：
觀察居民 (Agents) 的行為，若發現生態單調，再次下達指令增加物件。

展示 (Exhibit)：
島嶼完成，成為獨一無二的數位藝術品。

3. 功能需求 (Functional Requirements)

3.1 視覺與場景生成 (Visuals & Generation) - 已實作

體素化地形 (Voxel Terrain)：

地面由數百個小方塊 (Cell) 組成。

挖掘式河流：河流區域不生成土塊，僅保留底層泥土與低水面，創造物理高低差。

地層厚度：地面高度設為 0.3 (輕薄感)，與水面 0.05 形成層次。

五大核心元件：

山 (Mountain)：Low-Poly 風格，高聳且帶有雪頂。

樹 (Tree)：圓頂可愛風格，樹葉會隨風搖曳 (Vertex Animation)。

房 (House)：帶煙囪的小木屋，隨機旋轉角度。

人 (Person)：抽象幾何造型，具備自主行動能力。

河 (River)：連貫的水道，非破碎片段。

隨機生成演算法 (Procedural Generation)：

使用網格系統 (Grid System) 進行規劃。

河流採用「隨機遊走 (Random Walk)」演算法，確保從島嶼一側流向另一側。

物件生成需避開河道，並依照權重機率分佈。

3.2 渲染與特效 (Rendering & Shaders) - 已實作

精緻明亮風格：

色調：天空藍 (#87CEEB)、草地綠 (#8CDD81)、明亮水色 (#66CCFF)。

光影：Ambient Light + Directional Light (含陰影運算)。

動態水流 Shader：

使用自定義 ShaderMaterial。

世界座標紋理：利用 vWorldPosition 確保跨方塊的水波紋連貫無縫。

流線感：強調沿 X 軸流動的線條與波光，模擬水流速度。

3.3 AI 智能體 (AI Agents) - 已實作

自主導航：
居民會在島嶼上隨機選點移動。

避障邏輯：

避水：絕對不會踏入 Grid=1 的河流區域。

避物：不會穿過山、樹、房屋 (Grid=2)。

僅在 Grid=0 (草地) 上移動。

動態行為：

Idle (發呆/思考)：隨機停留時間。

Walk (移動)：移動時帶有上下跳躍的動畫 (Sine wave bounce)。

3.4 語音互動與雙層咒語系統 (Dual-Layer Incantation) - 待整合

本系統將語音輸入分為兩個層次，以 UI 顏色與視覺回饋區隔：

Type A: 創世指令 (Core Component Commands)

目的：基礎物件生成。

內容：單字或簡單片語 (e.g., "Tree", "Big Mountain", "Blue River").

UI 回饋：<span style="color:blue">藍色</span> 字幕框。

視覺效果：物件「啵」一聲長出來 (Pop-up animation)。

Type B: 魔法詠唱 (Textbook Bonus Spells) [NEW]

目的：觸發「更酷的」環境特效或全域獎勵。

內容：來自英語課本的完整句子 (e.g., "How's the weather?", "What time is it?", "I like apples.").

UI 回饋：<span style="color:gold">金色</span> 發光字幕框 + 音效 (Chime sound)。

視覺效果 (Examples)：

"It's rainy." -> 觸發粒子降雨系統，河流漲潮。

"Good night." -> 天空變深藍色，房子亮起燈光 (螢火蟲特效)。

"I am happy." -> 所有小人頭上出現愛心粒子，開始跳舞。

"Let's go!" -> 所有小人移動速度加倍。

技術實作：

前端維護一個 TextbookSentenceMap。

語音辨識結果優先比對 Type B (模糊比對，容許些微發音誤差)，若不符合再比對 Type A。

4. 技術架構 (Technical Architecture)

4.1 前端技術棧

語言：HTML5, JavaScript (ES6 Modules)。

3D 引擎：Three.js (r160+)。

語音識別：Browser Web Speech API (無需後端)。

部署：靜態網頁 (Static Web App)，可部署於 GitHub Pages 或任何 Web Server。

4.2 系統模組圖

graph TD
    User[使用者語音/操作] --> InputHandler[輸入處理模組]
    InputHandler -- 語音辨識 --> SpeechRouter[語音分流器]
    
    SpeechRouter -- 單字/短語 --> CoreMatcher[核心指令比對]
    SpeechRouter -- 完整句型 --> TextbookMatcher[課文句型比對]
    
    CoreMatcher -- 觸發物件生成 --> LogicCore[邏輯核心]
    TextbookMatcher -- 觸發特殊事件 --> EventSystem[特效事件系統]
    
    LogicCore -- 生成地形 --> GridSystem[網格生成系統]
    EventSystem -- 改變環境 --> GlobalEffects[全域特效(天氣/時間/粒子)]
    
    GridSystem --> TerrainGen[地形演算法]
    LogicCore --> ObjFactory[3D物件工廠]
    
    LogicCore --> Renderer[Three.js 渲染器]
    Renderer --> Shader[水流Shader & 材質]
    Renderer --> AnimationLoop[動畫迴圈]
    
    AnimationLoop --> AgentAI[居民行為運算]
