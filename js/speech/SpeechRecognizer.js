/**
 * SpeechRecognizer.js - 語音辨識模組
 * 封裝 Web Speech API，提供按住說話功能
 *
 * iOS Safari 相容性說明：
 *  - 每次 start() 必須建立全新實例（iOS 的 SpeechRecognition 不可重用）
 *  - 使用 abort() 取代 stop()，確保 iOS 狀態完全清除
 *  - isStarting 旗標防止 onstart 延遲時的重複觸發競態問題
 */

export class SpeechRecognizer {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isStarting = false;   // 防止 iOS onstart 延遲造成的競態條件
        this.isSupported = false;

        // 回調函式
        this.onResult = null;
        this.onStart = null;
        this.onEnd = null;
        this.onError = null;

        this._checkSupport();
    }

    /**
     * 只檢查瀏覽器是否支援，不建立實例
     * 實例改為每次 start() 時建立（iOS Safari 相容）
     */
    _checkSupport() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('[SpeechRecognizer] 此瀏覽器不支援 Web Speech API');
            this.isSupported = false;
            return;
        }
        this.isSupported = true;
        console.log('[SpeechRecognizer] Web Speech API 支援確認');
    }

    /**
     * 每次呼叫前建立全新的 SpeechRecognition 實例
     * iOS Safari 不允許重用已結束的實例
     */
    _createInstance() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        // 若舊實例存在，先強制中止
        if (this.recognition) {
            try { this.recognition.abort(); } catch (_) { /* 忽略 */ }
            this.recognition = null;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = this._lang || 'en-US';
        recognition.maxAlternatives = 3;

        recognition.onstart = () => {
            this.isListening = true;
            this.isStarting = false;
            console.log('[SpeechRecognizer] 開始聆聽...');
            if (this.onStart) this.onStart();
        };

        recognition.onend = () => {
            this.isListening = false;
            this.isStarting = false;
            console.log('[SpeechRecognizer] 停止聆聽');
            if (this.onEnd) this.onEnd();
        };

        recognition.onresult = (event) => {
            const results = [];
            for (let i = 0; i < event.results.length; i++) {
                for (let j = 0; j < event.results[i].length; j++) {
                    results.push({
                        transcript: event.results[i][j].transcript.trim().toLowerCase(),
                        confidence: event.results[i][j].confidence
                    });
                }
            }
            console.log('[SpeechRecognizer] 辨識結果:', results);
            if (this.onResult && results.length > 0) {
                this.onResult(results);
            }
        };

        recognition.onerror = (event) => {
            console.error('[SpeechRecognizer] 錯誤:', event.error);
            this.isListening = false;
            this.isStarting = false;
            if (this.onError) this.onError(event.error);
        };

        this.recognition = recognition;
    }

    /**
     * 開始辨識
     */
    start() {
        if (!this.isSupported) {
            console.warn('[SpeechRecognizer] 語音辨識不支援');
            if (this.onError) this.onError('BROWSER_NOT_SUPPORTED');
            return false;
        }

        // isStarting 防止 iOS onstart 延遲時重複觸發
        if (this.isListening || this.isStarting) {
            console.warn('[SpeechRecognizer] 已在聆聽/啟動中');
            return false;
        }

        // 每次建立全新實例（iOS Safari 核心修復）
        this._createInstance();

        try {
            this.isStarting = true;
            this.recognition.start();
            return true;
        } catch (error) {
            this.isStarting = false;
            console.error('[SpeechRecognizer] 啟動失敗:', error);
            if (this.onError) this.onError('啟動失敗: ' + error.message);
            return false;
        }
    }

    /**
     * 停止辨識
     * iOS Safari 上 abort() 比 stop() 更可靠
     */
    stop() {
        if (!this.isSupported || !this.recognition) return;

        try {
            // abort() 立即終止並觸發 onend，iOS 上比 stop() 更可靠
            this.recognition.abort();
        } catch (error) {
            console.error('[SpeechRecognizer] 停止失敗:', error);
        }
    }

    /**
     * 設定語言
     * @param {string} lang - 語言代碼 (e.g., 'en-US', 'zh-TW')
     */
    setLanguage(lang) {
        this._lang = lang;
    }

    /**
     * 檢查是否支援
     * @returns {boolean}
     */
    checkSupport() {
        return this.isSupported;
    }
}
