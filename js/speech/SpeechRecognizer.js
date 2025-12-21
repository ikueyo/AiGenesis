/**
 * SpeechRecognizer.js - 語音辨識模組
 * 封裝 Web Speech API，提供按住說話功能
 */

export class SpeechRecognizer {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = false;

        // 回調函式
        this.onResult = null;
        this.onStart = null;
        this.onEnd = null;
        this.onError = null;

        this.init();
    }

    /**
     * 初始化語音辨識
     */
    init() {
        // 檢查瀏覽器支援
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('[SpeechRecognizer] 此瀏覽器不支援 Web Speech API');
            this.isSupported = false;
            return;
        }

        this.isSupported = true;
        this.recognition = new SpeechRecognition();

        // 設定
        this.recognition.continuous = false;      // 單次辨識
        this.recognition.interimResults = false;  // 只要最終結果
        this.recognition.lang = 'en-US';          // 英語
        this.recognition.maxAlternatives = 3;     // 最多 3 個候選

        // 事件綁定
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('[SpeechRecognizer] 開始聆聽...');
            if (this.onStart) this.onStart();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('[SpeechRecognizer] 停止聆聽');
            if (this.onEnd) this.onEnd();
        };

        this.recognition.onresult = (event) => {
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

        this.recognition.onerror = (event) => {
            console.error('[SpeechRecognizer] 錯誤:', event.error);
            this.isListening = false;

            if (this.onError) {
                this.onError(event.error);
            }
        };

        console.log('[SpeechRecognizer] 初始化完成');
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

        if (this.isListening) {
            console.warn('[SpeechRecognizer] 已在聆聽中');
            return false;
        }

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('[SpeechRecognizer] 啟動失敗:', error);
            if (this.onError) {
                this.onError('啟動失敗: ' + error.message);
            }
            return false;
        }
    }

    /**
     * 停止辨識
     */
    stop() {
        if (!this.isSupported || !this.isListening) {
            return;
        }

        try {
            this.recognition.stop();
        } catch (error) {
            console.error('[SpeechRecognizer] 停止失敗:', error);
        }
    }

    /**
     * 設定語言
     * @param {string} lang - 語言代碼 (e.g., 'en-US', 'zh-TW')
     */
    setLanguage(lang) {
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }

    /**
     * 檢查是否支援
     * @returns {boolean}
     */
    checkSupport() {
        return this.isSupported;
    }
}
