/**
 * UIController.js - UI 控制器
 * 負責麥克風按鈕、字幕框、統計面板的管理
 */

export class UIController {
    constructor() {
        // DOM 元素
        this.loadingScreen = document.getElementById('loading-screen');
        this.micBtn = document.getElementById('mic-btn');
        this.micHint = document.getElementById('mic-hint');
        this.subtitle = document.getElementById('subtitle');
        this.regenerateBtn = document.getElementById('regenerate-btn');

        // 統計元素
        this.treeCount = document.getElementById('tree-count');
        this.mountainCount = document.getElementById('mountain-count');
        this.houseCount = document.getElementById('house-count');
        this.personCount = document.getElementById('person-count');

        // 狀態
        this.isRecording = false;
        this.subtitleTimeout = null;

        // 回調
        this.onMicDown = null;
        this.onMicUp = null;
        this.onRegenerate = null;

        this.init();
    }

    /**
     * 初始化 UI 事件
     */
    init() {
        // 麥克風按住事件
        if (this.micBtn) {
            // 滑鼠
            this.micBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.startRecording();
            });
            this.micBtn.addEventListener('mouseup', () => this.stopRecording());
            this.micBtn.addEventListener('mouseleave', () => this.stopRecording());

            // 觸控
            this.micBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startRecording();
            });
            this.micBtn.addEventListener('touchend', () => this.stopRecording());
            this.micBtn.addEventListener('touchcancel', () => this.stopRecording());
        }

        // 重塑世界按鈕
        if (this.regenerateBtn) {
            this.regenerateBtn.addEventListener('click', () => {
                if (this.onRegenerate) {
                    this.onRegenerate();
                }
            });
        }

        console.log('[UIController] 初始化完成');
    }

    /**
     * 開始錄音狀態
     */
    startRecording() {
        if (this.isRecording) return;

        this.isRecording = true;
        this.micBtn.classList.add('recording');
        this.micHint.textContent = '正在聆聽...';

        if (this.onMicDown) {
            this.onMicDown();
        }
    }

    /**
     * 停止錄音狀態
     */
    stopRecording() {
        if (!this.isRecording) return;

        this.isRecording = false;
        this.micBtn.classList.remove('recording');
        this.micHint.textContent = '按住麥克風說話';

        if (this.onMicUp) {
            this.onMicUp();
        }
    }

    /**
     * 顯示字幕
     * @param {string} text - 字幕文字
     * @param {string} type - 'A' 或 'B'
     * @param {number} duration - 顯示時間 (毫秒)
     */
    showSubtitle(text, type = 'A', duration = 3000) {
        if (!this.subtitle) return;

        // 清除之前的計時器
        if (this.subtitleTimeout) {
            clearTimeout(this.subtitleTimeout);
        }

        // 設定類型
        this.subtitle.className = 'subtitle visible';
        this.subtitle.classList.add(type === 'B' ? 'type-b' : 'type-a');
        this.subtitle.textContent = text;

        // 自動隱藏
        this.subtitleTimeout = setTimeout(() => {
            this.subtitle.classList.remove('visible');
        }, duration);
    }

    /**
     * 隱藏字幕
     */
    hideSubtitle() {
        if (this.subtitle) {
            this.subtitle.classList.remove('visible');
        }
    }

    /**
     * 更新統計數據
     * @param {Object} stats - { trees, mountains, houses, people }
     */
    updateStats(stats) {
        if (this.treeCount) this.treeCount.textContent = stats.trees || 0;
        if (this.mountainCount) this.mountainCount.textContent = stats.mountains || 0;
        if (this.houseCount) this.houseCount.textContent = stats.houses || 0;
        if (this.personCount) this.personCount.textContent = stats.people || 0;
    }

    /**
     * 隱藏 Loading 畫面
     */
    hideLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
        }
    }

    /**
     * 顯示 Loading 畫面
     */
    showLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * 顯示錯誤提示
     * @param {string} message 
     */
    showError(message) {
        this.showSubtitle(`⚠️ ${message}`, 'A', 4000);
    }

    /**
     * 顯示成功提示 (Type A)
     * @param {string} message 
     */
    showSuccess(message) {
        this.showSubtitle(message, 'A', 2500);
    }

    /**
     * 顯示魔法效果 (Type B)
     * @param {string} message 
     */
    showMagic(message) {
        this.showSubtitle(message, 'B', 3500);
    }

    /**
     * 檢查語音支援
     * @param {boolean} isSupported 
     */
    setSpeechSupport(isSupported) {
        if (!isSupported) {
            this.micHint.textContent = '⚠️ 此瀏覽器不支援語音辨識';
            this.micBtn.disabled = true;
            this.micBtn.style.opacity = '0.5';
        }
    }
}
