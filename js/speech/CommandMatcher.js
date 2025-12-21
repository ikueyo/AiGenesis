import {
    SPELL_DATABASE,
    OBJECT_NAMES,
    similarity
} from './SpellDatabase.js';

export class CommandMatcher {
    constructor() {
        // 比對閾值 (用於整句模糊比對)
        this.similarityThreshold = 0.75;
    }

    /**
     * 比對語音結果
     * @param {Array} results - 語音辨識結果陣列
     * @returns {Object|null} - 比對結果
     */
    /**
     * 比對語音結果
     * @param {Array} results - 語音辨識結果陣列
     * @param {string} targetSpellId - (Optional) 指定要比對的咒語 ID
     * @returns {Object|null} - 比對結果
     */
    match(results, targetSpellId = null) {
        if (!results || results.length === 0) {
            return null;
        }

        // 取得最佳候選
        const bestResult = results[0];
        const transcript = bestResult.transcript.toLowerCase().trim();

        console.log(`[CommandMatcher] 比對: "${transcript}" (Target: ${targetSpellId || 'All'})`);

        // 如果有點擊特定卡片，只比對該咒語
        if (targetSpellId) {
            const targetSpell = SPELL_DATABASE.find(s => s.id === targetSpellId);
            if (!targetSpell) return null;

            return this.checkSpellMatch(targetSpell, transcript);
        }

        // 否則遍歷資料庫尋找匹配
        for (const spell of SPELL_DATABASE) {
            const result = this.checkSpellMatch(spell, transcript);
            if (result) return result;
        }

        console.log('[CommandMatcher] 無比對結果');
        return null;
    }

    /**
     * 檢查單一咒語是否匹配
     */
    checkSpellMatch(spell, transcript) {
        // 1. 嘗試關鍵字比對
        if (spell.keywords) {
            for (const keyword of spell.keywords) {
                if (transcript.includes(keyword)) {
                    console.log(`[CommandMatcher] 關鍵字命中: "${keyword}" -> ${spell.id}`);
                    return this.formatResult(spell, transcript);
                }
            }
        }

        // 2. 嘗試整句相似度比對
        const sim = similarity(transcript, spell.sentence.toLowerCase());
        if (sim >= this.similarityThreshold) {
            console.log(`[CommandMatcher] 相似度命中 (${sim.toFixed(2)}): "${spell.sentence}"`);
            return this.formatResult(spell, transcript);
        }

        return null;
    }

    /**
     * 格式化比對結果
     */
    formatResult(spell, transcript) {
        const result = {
            type: spell.type,
            transcript: transcript, // 實際語音
            ...spell                // 包含 action, object, effect 等
        };

        // 補上 objectName (如果是 Type A)
        if (spell.type === 'A' && spell.object && OBJECT_NAMES[spell.object]) {
            result.objectName = OBJECT_NAMES[spell.object];
        }

        // 補上 displayText
        if (!result.displayText) {
            // 如果有 description (Type B 常見)，優先使用
            if (spell.description) {
                result.displayText = spell.description;
            }
            // 否則使用中文 (Type B/A)
            else if (spell.chinese) {
                result.displayText = spell.chinese;
            }
            // 最後 fallback 到英文原句
            else {
                result.displayText = spell.sentence;
            }
        }

        return result;
    }

    /**
     * 取得所有咒語
     */
    getAllSpells() {
        return SPELL_DATABASE;
    }
}
