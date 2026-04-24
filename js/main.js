/**
 * main.js - AI Genesis 主程式入口
 * 整合所有模組，實現完整的語音驅動 3D 生成系統
 */

// 場景模組
import { SceneManager } from './scene/SceneManager.js';
import { ObjectFactory } from './scene/ObjectFactory.js';
import { TerrainGenerator } from './scene/TerrainGenerator.js';

// 語音模組
import { SpeechRecognizer } from './speech/SpeechRecognizer.js';
import { CommandMatcher } from './speech/CommandMatcher.js';

// AI 模組
import { AgentManager } from './agents/PersonAgent.js';

// 特效模組
import { WeatherSystem } from './effects/WeatherSystem.js';

// UI 模組
import { UIController } from './ui/UIController.js';
import { SpellSidebar } from './ui/SpellSidebar.js';

/**
 * AI Genesis 主應用程式
 */
class AIGenesisApp {
    constructor() {
        // 核心模組
        this.sceneManager = new SceneManager();
        this.objectFactory = new ObjectFactory();
        this.terrainGenerator = null;
        this.speechRecognizer = new SpeechRecognizer();
        this.commandMatcher = new CommandMatcher();
        this.agentManager = new AgentManager();
        this.weatherSystem = null;
        this.uiController = new UIController();
        this.spellSidebar = new SpellSidebar(this.commandMatcher, this.speechRecognizer);

        // 狀態
        this.isInitialized = false;

        // 進度追蹤：已成功說出的唯一咒語 ID
        this.completedSpellIds = new Set();
    }

    /**
     * 初始化應用程式
     */
    async init() {
        console.log('[AIGenesis] 開始初始化...');

        try {
            // 初始化場景
            this.sceneManager.init();

            // 初始化地形生成器
            this.terrainGenerator = new TerrainGenerator(this.objectFactory);

            // 初始化天氣系統
            this.weatherSystem = new WeatherSystem(this.sceneManager);

            // 生成初始地形
            this.regenerateWorld();

            // 初始化側邊欄 (v2.0)
            this.spellSidebar.init();

            // 設定語音辨識回調
            this.setupSpeechRecognition();

            // 設定 UI 回調
            this.setupUICallbacks();

            // 設定作弊模式
            this.setupDebugMode();

            // 設定動畫回調
            this.setupAnimationCallbacks();

            // 隱藏 Loading
            setTimeout(() => {
                this.uiController.hideLoading();
            }, 1000);

            this.isInitialized = true;
            console.log('[AIGenesis] 初始化完成！');

        } catch (error) {
            console.error('[AIGenesis] 初始化失敗:', error);
            this.uiController.showError('初始化失敗，請重新整理頁面');
        }
    }

    /**
     * 設定語音辨識回調
     */
    setupSpeechRecognition() {
        // 檢查支援
        this.uiController.setSpeechSupport(this.speechRecognizer.checkSupport());

        // 辨識結果處理
        this.speechRecognizer.onResult = (results) => {
            this.handleSpeechResult(results);
        };

        // 辨識結束 (重置側邊欄錄音狀態)
        this.speechRecognizer.onEnd = () => {
            this.spellSidebar.stopRecording();
        };

        // 錯誤處理
        this.speechRecognizer.onError = (error) => {
            if (error === 'no-speech') {
                this.uiController.showError('沒有偵測到語音，請再試一次');
            } else if (error === 'not-allowed' || error === 'permission-denied') {
                this.uiController.showError('請允許麥克風權限');
                alert('⚠️ 麥克風權限被拒絕\n\n請在瀏覽器網址列旁點擊「允許麥克風」\n或前往 設定 > Safari > 麥克風 > 允許');
            } else if (error === 'BROWSER_NOT_SUPPORTED') {
                this.uiController.showError('瀏覽器不支援語音功能');
                alert('⚠️ 您的瀏覽器不支援 Web Speech API\n\n推薦使用：\n🤖 Android: Chrome\n🍎 iOS/iPadOS: Safari 14.5 以上');
            } else if (error === 'service-not-allowed') {
                // iOS Safari 兩種常見原因：
                // 1. 頁面在 HTTP（非 HTTPS）下執行
                // 2. 系統設定中「聽寫」功能未啟用
                const isHttp = location.protocol === 'http:' && location.hostname !== 'localhost';
                if (isHttp) {
                    this.uiController.showError('需要 HTTPS 才能使用語音');
                    alert('⚠️ iOS Safari 語音辨識需要 HTTPS\n\n請使用 https:// 網址開啟本應用程式');
                } else {
                    this.uiController.showError('語音服務未啟用，請檢查設定');
                    alert('⚠️ iPad 語音服務無法使用\n\n請依序檢查：\n1. 設定 > 一般 > 鍵盤 > 啟用聽寫\n2. 設定 > 隱私權與安全性 > 麥克風 > Safari（允許）\n3. 確認網址為 https:// 開頭');
                }
            } else if (error === 'aborted') {
                // abort() 主動中止，非錯誤，靜默處理
            } else {
                this.uiController.showError('語音錯誤: ' + error);
            }
            this.spellSidebar.stopRecording();
        };
    }

    /**
     * 設定除錯/作弊模式
     */
    setupDebugMode() {
        console.log('[Main] 設定除錯模式...');
        // 1. UI 元素
        const btn = document.getElementById('debug-btn');
        const modal = document.getElementById('debug-modal');
        const pwdInput = document.getElementById('debug-pwd');
        const submitBtn = document.getElementById('debug-submit');
        const cancelBtn = document.getElementById('debug-cancel');

        if (btn && modal) {
            console.log('[Main] 找到除錯按鈕，已啟用監聽');

            // 開啟 Modal
            btn.addEventListener('click', () => {
                console.log('[Main] 除錯按鈕被點擊');
                modal.style.display = 'flex';
                pwdInput.value = '';
                pwdInput.focus();
            });

            // 提交密碼
            const checkPassword = () => {
                const pwd = pwdInput.value;
                if (pwd === 'ikueyo') {
                    this.spellSidebar.enableCheatMode();
                    alert('Cheat Mode Enabled! (Click Mic to instant cast)');
                    modal.style.display = 'none';
                } else {
                    alert('Access Denied');
                    pwdInput.value = '';
                    pwdInput.focus();
                }
            };

            submitBtn.addEventListener('click', checkPassword);

            // 支援 Enter 鍵
            pwdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') checkPassword();
            });

            // 取消
            cancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });

        } else {
            console.warn('[Main] 找不到除錯按鈕 (#debug-btn) 或 Modal');
        }

        // 2. 監聽作弊觸發事件
        window.addEventListener('spell-cheat', (e) => {
            const { spellId } = e.detail;
            const allSpells = this.commandMatcher.getAllSpells();
            const targetSpell = allSpells.find(s => s.id === spellId);

            if (targetSpell) {
                console.log(`[Main] Cheat Triggered: ${targetSpell.sentence}`);
                // 偽造語音辨識結果
                this.handleSpeechResult([{
                    transcript: targetSpell.sentence,
                    confidence: 1.0,
                    isFinal: true
                }]);
            }
        });
    }

    /**
     * 設定 UI 回調
     */
    setupUICallbacks() {
        // 重塑世界
        this.uiController.onRegenerate = () => {
            this.regenerateWorld();
        };
    }

    /**
     * 設定動畫回調
     */
    setupAnimationCallbacks() {
        this.sceneManager.addAnimationCallback((time, delta) => {
            // 更新水流
            this.terrainGenerator.updateWater(time);

            // 更新樹葉搖曳
            this.objectFactory.updateAnimations(time);

            // 更新 AI 智能體
            this.agentManager.update(time, delta);
        });
    }

    /**
     * 處理語音辨識結果
     * @param {Array} results 
     */
    handleSpeechResult(results) {
        // [Strict Mode] 如果正在針對某張卡片錄音，只比對該卡片
        const targetId = this.spellSidebar.activeSpellId;
        const match = this.commandMatcher.match(results, targetId);

        if (!match) {
            const transcript = results[0]?.transcript || '';

            // Strict Mode：直接提示應唸的句子
            if (targetId) {
                const targetSpell = this.spellSidebar.activeSpells.find(s => s.id === targetId);
                if (targetSpell) {
                    this.uiController.showSuggestion(transcript, targetSpell.sentence);
                } else {
                    this.uiController.showSubtitle(`"${transcript}" - 無法辨識`, 'A', 2500);
                }
                return;
            }

            // 一般模式：尋找最相近的咒語作為建議
            const suggestion = this.commandMatcher.getSuggestion(transcript);
            if (suggestion) {
                this.uiController.showSuggestion(transcript, suggestion.spell.sentence);
            } else {
                this.uiController.showSubtitle(`"${transcript}" - 無法辨識`, 'A', 2500);
            }
            return;
        }

        // 成功匹配：通知側邊欄標記完成
        if (match.id) {
            this.spellSidebar.markCompleted(match.id);
            this.completedSpellIds.add(match.id);
            this._updateProgress();
        }

        if (match.type === 'A') {
            // Type A: 創世指令 - 生成物件
            this.handleCoreCommand(match);
        } else if (match.type === 'B') {
            // Type B: 魔法詠唱 - 觸發特效
            this.handleSpell(match);
        }
    }

    /**
     * 處理 Type A 創世指令
     * @param {Object} match 
     */
    handleCoreCommand(match) {
        const { object, objectName } = match;

        // 生成物件
        const spawnedObject = this.terrainGenerator.spawnObject(
            this.sceneManager.scene,
            object
        );

        if (spawnedObject) {
            // 🎆 添加絢麗的 spawn 動畫
            this.objectFactory.addSpawnAnimation(spawnedObject, this.sceneManager.scene);

            // 如果是人，加入 AI 管理
            if (object === 'person') {
                const gridInfo = this.terrainGenerator.getGridInfo();
                this.agentManager.addAgent(
                    spawnedObject,
                    gridInfo,
                    this.terrainGenerator.config.groundHeight
                );
            }

            // 顯示成功字幕 + 歷史記錄
            const successMsg = `✨ 生成 ${objectName}`;
            this.uiController.showSuccess(successMsg);
            this.uiController.addToHistory(`${match.icon || '✨'} ${objectName}`, 'A');

            // 更新統計
            this.updateStats();
        } else {
            this.uiController.showError('沒有空間可以生成！');
        }
    }

    /**
     * 處理 Type B 魔法詠唱
     * @param {Object} match 
     */
    handleSpell(match) {
        const { effect, displayText } = match;

        // 顯示魔法字幕 (金色) + 歷史記錄
        this.uiController.showMagic(`✨ ${displayText}`);
        this.uiController.addToHistory(`${match.icon || '✨'} ${displayText}`, 'B');

        // 觸發對應效果
        switch (effect) {
            case 'rain':
                this.weatherSystem.triggerRain();
                break;
            case 'sunny':
                this.weatherSystem.triggerSunny();
                break;
            case 'cloudy': // New
            case 'windy': // New (visual only for now)
                this.weatherSystem.triggerMorning(); // Reset to neutral
                // TODO: Add specific cloudy/windy visuals
                break;

            case 'night':
                this.weatherSystem.triggerNight();
                break;
            case 'morning':
                this.weatherSystem.triggerMorning();
                break;
            case 'noon': // New
            case 'sunset': // New
                // Map to closest existing time or add new logic
                if (effect === 'sunset') this.weatherSystem.triggerNight(); // Approximation
                else this.weatherSystem.triggerSunny();
                break;

            case 'random_weather': // New
                const weathers = ['rain', 'sunny'];
                const randomW = weathers[Math.floor(Math.random() * weathers.length)];
                if (randomW === 'rain') this.weatherSystem.triggerRain();
                else this.weatherSystem.triggerSunny();
                break;

            case 'random_time': // New
                const times = ['morning', 'night'];
                const randomT = times[Math.floor(Math.random() * times.length)];
                if (randomT === 'night') this.weatherSystem.triggerNight();
                else this.weatherSystem.triggerMorning();
                break;

            case 'happy':
                this.agentManager.triggerAllHappy();
                break;
            case 'speed':
                this.agentManager.setAllSpeedMultiplier(2.0);
                setTimeout(() => {
                    this.agentManager.setAllSpeedMultiplier(1.0);
                }, 10000); // 10 秒後恢復
                break;
            case 'wave':
                this.agentManager.triggerAllWave();
                break;

            case 'spawn_food': // New: 生成特色商店
                const foodObj = this.terrainGenerator.spawnObject(
                    this.sceneManager.scene,
                    'house',
                    {
                        roofColor: 0xF39C12, // 橘色屋頂 (Food Shop)
                        icon: match.icon     // 飄浮圖示
                    }
                );
                if (foodObj) {
                    this.objectFactory.addSpawnAnimation(foodObj, this.sceneManager.scene);
                    this.uiController.showMagic(`✨ ${match.icon} Shop 出現了！`);
                } else {
                    this.uiController.showError('沒有空間開店了！');
                }
                this.agentManager.triggerAllHappy();
                break;

            case 'spawn_item': // New: 生成守護者
                const itemObj = this.terrainGenerator.spawnObject(
                    this.sceneManager.scene,
                    'person',
                    {
                        shirtColor: 0x9B59B6, // 紫色衣服 (Keeper)
                        icon: match.icon      // 飄浮圖示
                    }
                );
                if (itemObj) {
                    this.objectFactory.addSpawnAnimation(itemObj, this.sceneManager.scene);
                    const gridInfo = this.terrainGenerator.getGridInfo();
                    this.agentManager.addAgent(itemObj, gridInfo, this.terrainGenerator.config.groundHeight);
                    this.uiController.showMagic(`✨ ${match.icon} Keeper 出現了！`);
                } else {
                    this.uiController.showError('守護者迷路了！');
                }
                break;

            case 'question_mark':
            case 'question_where':
                // Just visual feedback
                break;

            case 'spawn_multiple':
                if (match.spawnType && match.count) {
                    for (let i = 0; i < match.count; i++) {
                        this.terrainGenerator.spawnObject(
                            this.sceneManager.scene,
                            match.spawnType
                        );
                    }
                }
                break;

            default:
                console.warn('Unknown effect:', effect);
        }
    }

    /**
     * 重新生成世界
     */
    regenerateWorld() {
        console.log('[AIGenesis] 重塑世界...');

        // 清除 AI 智能體
        this.agentManager.clear();

        // 重設天氣
        this.weatherSystem?.triggerSunny();

        // 重新生成地形
        this.terrainGenerator.generate(this.sceneManager.scene);

        // 為初始生成的人加入 AI
        const gridInfo = this.terrainGenerator.getGridInfo();
        for (const person of this.terrainGenerator.spawnedObjects.people) {
            this.agentManager.addAgent(
                person,
                gridInfo,
                this.terrainGenerator.config.groundHeight
            );
        }

        // 更新統計
        this.updateStats();

        console.log('[AIGenesis] 世界重塑完成！');
    }

    /**
     * 更新統計數據
     */
    updateStats() {
        const stats = this.terrainGenerator.getStats();
        this.uiController.updateStats(stats);
    }

    /**
     * 更新咒語完成進度
     */
    _updateProgress() {
        const total = this.commandMatcher.getAllSpells().length;
        this.uiController.updateProgress(this.completedSpellIds.size, total);
    }
}

// 啟動應用程式
document.addEventListener('DOMContentLoaded', () => {
    const app = new AIGenesisApp();
    app.init();

    // 暴露到全域 (方便除錯)
    window.aiGenesis = app;
});
