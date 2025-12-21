/**
 * SpellSidebar.js - 咒語側邊欄 UI
 * 負責渲染左側咒語列表、TTS 發音與錄音互動
 */
export class SpellSidebar {
    constructor(commandMatcher, speechRecognizer) {
        this.commandMatcher = commandMatcher;
        this.speechRecognizer = speechRecognizer;

        this.container = null;
        this.list = null;
        this.toggleBtn = null;
        this.closeBtn = null;

        this.activeSpellId = null; // 當前正在錄音的卡片 ID

        // 牌庫系統
        this.poolA = []; // Type A (預設物件)
        this.poolB = []; // Type B (金色 Bonus)
        this.activeSpells = []; // 當前顯示的 6 張卡片
    }

    /**
     * 初始化側邊欄
     */
    init() {
        this.container = document.getElementById('spell-sidebar');
        this.list = document.getElementById('spell-list-container');
        this.toggleBtn = document.getElementById('sidebar-toggle');
        this.closeBtn = document.getElementById('sidebar-close');

        if (!this.container || !this.list) {
            console.error('[SpellSidebar] 找不到 DOM 元素');
            return;
        }

        this.initDeck();
        this.bindEvents();
        this.renderSpells();
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 開啟側邊欄
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                this.container.classList.add('open');
            });
        }

        // 關閉側邊欄
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.container.classList.remove('open');
            });
        }
    }

    // createContainer 已移除，改用 HTML 定義

    /**
     * 初始化牌組
     */
    initDeck() {
        const allSpells = this.commandMatcher.getAllSpells();
        this.poolA = allSpells.filter(s => s.type === 'A');
        this.poolB = allSpells.filter(s => s.type === 'B');

        this.activeSpells = [];

        // 抽取 3 張 Type A
        for (let i = 0; i < 3; i++) {
            const spell = this.drawRandomSpell(this.poolA);
            if (spell) this.activeSpells.push(spell);
        }

        // 抽取 2 張 Type B
        for (let i = 0; i < 2; i++) {
            const spell = this.drawRandomSpell(this.poolB);
            if (spell) this.activeSpells.push(spell);
        }
    }

    /**
     * 從牌池隨機抽取一張 (避免重複)
     */
    drawRandomSpell(pool) {
        // 過濾掉目前已經在場上的卡片
        const candidates = pool.filter(
            candidate => !this.activeSpells.some(active => active.id === candidate.id)
        );

        if (candidates.length === 0) {
            // 如果都抽完了，就從整個池子隨機抽 (允許重複)
            if (pool.length === 0) return null;
            return pool[Math.floor(Math.random() * pool.length)];
        }

        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /**
     * 渲染咒語卡片
     */
    renderSpells() {
        if (!this.list) return;
        this.list.innerHTML = ''; // 清空列表

        this.activeSpells.forEach(spell => {
            const card = this.createSpellCard(spell);
            this.list.appendChild(card);
        });
    }

    /**
     * 建立單張咒語卡片
     */
    createSpellCard(spell) {
        const card = document.createElement('div');
        // Type B 加上 special class 讓他變金色
        const typeClass = spell.type === 'B' ? 'type-b-card' : 'type-a-card';
        card.className = `spell-card ${typeClass}`;
        card.dataset.id = spell.id;
        // card.dataset.type = spell.type; // Removed as typeClass handles visual distinction

        // 圖示
        const icon = document.createElement('div');
        icon.className = 'spell-icon';
        icon.textContent = spell.icon || '✨';
        card.appendChild(icon);

        // 內容區
        const content = document.createElement('div');
        content.className = 'spell-content';

        const sentence = document.createElement('div');
        sentence.className = 'spell-sentence';
        sentence.textContent = spell.sentence;
        content.appendChild(sentence);

        if (spell.chinese) {
            const chinese = document.createElement('div');
            chinese.className = 'spell-chinese';
            chinese.textContent = spell.chinese;
            content.appendChild(chinese);
        }
        card.appendChild(content);

        // 動作區
        const actions = document.createElement('div');
        actions.className = 'spell-actions';

        // TTS 按鈕
        const ttsBtn = document.createElement('button');
        ttsBtn.className = 'action-btn tts-btn';
        ttsBtn.innerHTML = '🔊';
        ttsBtn.onclick = (e) => {
            e.stopPropagation();
            this.playTTS(spell.sentence);
        };
        actions.appendChild(ttsBtn);

        // 錄音按鈕
        const micBtn = document.createElement('button');
        micBtn.className = 'action-btn mic-btn-small';
        micBtn.innerHTML = '🎤';
        micBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggleRecording(spell.id, micBtn);
        };
        actions.appendChild(micBtn);

        card.appendChild(actions);

        return card;
    }

    /**
     * 播放 TTS 發音
     */
    playTTS(text) {
        if (!window.speechSynthesis) return;

        // 停止目前的發音
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.6; // 慢速朗讀模式
        window.speechSynthesis.speak(utterance);
    }

    /**
     * 開啟作弊模式
     */
    enableCheatMode() {
        this.cheatMode = true;
        console.log('[SpellSidebar] Cheat Mode Enabled');
        // 可選：視覺回饋讓使用者知道
        const debugBtn = document.getElementById('debug-btn');
        if (debugBtn) {
            debugBtn.style.opacity = '0.5';
            debugBtn.style.background = 'gold';
        }
    }

    /**
     * 切換錄音狀態
     */
    toggleRecording(spellId, btn) {
        if (this.activeSpellId === spellId) {
            // 停止錄音
            this.stopRecording();
        } else {
            // 開始錄音 (如果別的正在錄，先停止)
            if (this.activeSpellId) {
                this.stopRecording();
            }
            this.startRecording(spellId, btn);
        }
    }

    /**
     * 開始錄音 (UI 互動)
     * @param {string} spellId 
     * @param {HTMLElement} btn 
     */
    startRecording(spellId, btn) {
        this.activeSpellId = spellId;

        // 作弊模式：直接觸發
        if (this.cheatMode) {
            console.log('[Cheat] 直接觸發咒語:', spellId);
            window.dispatchEvent(new CustomEvent('spell-cheat', { detail: { spellId } }));
            return;
        }

        // 更新 UI 狀態
        if (this.activeBtn) {
            this.activeBtn.classList.remove('active');
            this.activeBtn.textContent = '🎤';
        }

        this.activeBtn = btn;
        this.activeBtn.classList.add('active');
        this.activeBtn.textContent = '⏺️'; // 錄音中圖示

        // 視覺化：該卡片進入錄音狀態
        const card = btn.closest('.spell-card');
        document.querySelectorAll('.spell-card').forEach(c => c.classList.remove('recording'));
        if (card) card.classList.add('recording');

        // 觸發語音辨識
        if (this.speechRecognizer) {
            this.speechRecognizer.start();
        }
    }

    stopRecording() {
        if (!this.activeSpellId) return;

        const spellId = this.activeSpellId;

        // Visual Update
        const card = document.querySelector(`.spell-card[data-id="${spellId}"]`);
        if (card) card.classList.remove('recording');

        const btn = card?.querySelector('.mic-btn-small');
        if (btn) btn.classList.remove('active');

        this.activeSpellId = null;

        // 停止語音辨識
        if (this.speechRecognizer) {
            this.speechRecognizer.stop();
        }
    }

    /**
     * 標記卡片為完成，並執行消耗/補充邏輯
     */
    markCompleted(spellId) {
        const cardIndex = this.activeSpells.findIndex(s => s.id === spellId);
        if (cardIndex === -1) return false; // 該卡片不在當前列表中

        const card = document.querySelector(`.spell-card[data-id="${spellId}"]`);
        if (card) {
            card.classList.add('completed');

            // 1.5秒後執行補充邏輯
            setTimeout(() => {
                this.consumeAndRefill(cardIndex);
            }, 1500);
        }
        return true;
    }

    /**
     * 消耗並補充卡片
     */
    consumeAndRefill(index) {
        const oldSpell = this.activeSpells[index];
        const pool = oldSpell.type === 'A' ? this.poolA : this.poolB;

        // 移除舊卡片 (Visual)
        // 但其實 renderSpells 會重繪，這裡主要處理數據
        const newSpell = this.drawRandomSpell(pool);

        if (newSpell) {
            this.activeSpells[index] = newSpell;
            this.renderSpells(); // 重新渲染整個列表 (簡單暴力)

            // 可以加個新卡片閃爍動畫
            setTimeout(() => {
                const newCard = document.querySelector(`.spell-card[data-id="${newSpell.id}"]`);
                if (newCard) newCard.classList.add('new-arrival');
            }, 100);
        }
    }

    /**
     * 檢查此 ID 是否在當前牌組中
     */
    hasSpellRequest(spellId) {
        return this.activeSpells.some(s => s.id === spellId);
    }
}
