/**
 * SpellDatabase.js - 咒語資料庫
 * 定義 Type A (創世指令) 和 Type B (魔法詠唱) 的比對規則
 */

/**
 * SPELL_DATABASE - 統一咒語資料庫 v2.0
 * 整合所有創世指令與魔法詠唱，皆為完整句型 (Sentence-based)
 */
export const SPELL_DATABASE = [
    // --- Type A: 創世指令 (由單字轉化為句型) ---
    {
        id: 'tree_1',
        sentence: "There is a big tree.",
        keywords: ['tree', 'big tree'],
        chinese: "這裡有一棵大樹。",
        type: 'A',
        action: 'spawn',
        object: 'tree',
        icon: '🌲'
    },
    {
        id: 'mountain_1',
        sentence: "I see a high mountain.",
        keywords: ['mountain', 'high mountain'],
        chinese: "我看見一座高山。",
        type: 'A',
        action: 'spawn',
        object: 'mountain',
        icon: '⛰️'
    },
    {
        id: 'house_1',
        sentence: "Look at the small house.",
        keywords: ['house', 'small house', 'home'],
        chinese: "看那間小屋子。",
        type: 'A',
        action: 'spawn',
        object: 'house',
        icon: '🏠'
    },
    {
        id: 'person_1',
        sentence: "Hello, my friend.",
        keywords: ['person', 'people', 'friend', 'hello'],
        chinese: "哈囉，我的朋友。",
        type: 'A',
        action: 'spawn',
        object: 'person',
        icon: '👤'
    },

    // --- Type B: 魔法詠唱 (原本的課本句型) ---
    {
        id: 'weather_ask',
        sentence: "How's the weather?",
        keywords: ["how's the weather", "weather"],
        chinese: "天氣如何？",
        type: 'B',
        effect: 'random_weather',
        description: '隨機天氣',
        icon: '🌦️'
    },
    {
        id: 'weather_sunny_hot',
        sentence: "It's sunny and hot.",
        keywords: ["sunny", "hot"],
        chinese: "天氣晴朗炎熱。",
        type: 'B',
        effect: 'sunny',
        description: '大晴天',
        icon: '☀️'
    },
    {
        id: 'weather_rainy',
        sentence: "It's rainy today.",
        keywords: ["rainy"],
        chinese: "今天下雨了。",
        type: 'B',
        effect: 'rain',
        description: '粒子降雨',
        icon: '☔'
    },
    {
        id: 'weather_cloudy',
        sentence: "Is it cloudy?",
        keywords: ["cloudy"],
        chinese: "是陰天嗎？",
        type: 'B',
        effect: 'cloudy',
        description: '陰天模式',
        icon: '☁️'
    },
    {
        id: 'weather_windy',
        sentence: "It's windy here.",
        keywords: ["windy"],
        chinese: "這裡風很大。",
        type: 'B',
        effect: 'windy',
        description: '強風模式',
        icon: '🍃'
    },

    // 時間相關
    {
        id: 'time_ask',
        sentence: "What time is it?",
        keywords: ["what time", "what time is it"],
        chinese: "現在幾點了？",
        type: 'B',
        effect: 'random_time',
        description: '隨機時間',
        icon: '⏰'
    },
    {
        id: 'time_five',
        sentence: "It's five o'clock.",
        keywords: ["five o'clock", "5 o'clock", "five o clock", "5 o clock"],
        chinese: "現在五點鐘。",
        type: 'B',
        effect: 'sunset',
        description: '黃昏時刻',
        icon: '🌇'
    },
    {
        id: 'time_noon',
        sentence: "It's twelve thirty.",
        keywords: ["twelve thirty", "12:30", "12 30"],
        chinese: "現在十二點半。",
        type: 'B',
        effect: 'sunny',
        description: '正午時刻',
        icon: '🕛'
    },
    {
        id: 'time_lunch',
        sentence: "It's time for lunch.",
        keywords: ["lunch", "time for lunch"],
        chinese: "午餐時間到了。",
        type: 'B',
        effect: 'spawn_food',
        spawnId: 'burger',
        description: '午餐時間',
        icon: '🍱'
    },
    {
        id: 'time_bed',
        sentence: "It's time for bed.",
        keywords: ["bed", "sleep", "time for bed"],
        chinese: "該睡覺了。",
        type: 'B',
        effect: 'night',
        description: '進入夜晚',
        icon: '🛌'
    },

    // 飲食與慾望
    {
        id: 'want_ask',
        sentence: "What do you want?",
        keywords: ["what do you want"],
        chinese: "你想要什麼？",
        type: 'B',
        effect: 'question_mark',
        description: '問號特效',
        icon: '❓'
    },
    {
        id: 'want_burger',
        sentence: "I want a hamburger.",
        keywords: ["hamburger", "burger"],
        chinese: "我想要一個漢堡。",
        type: 'B',
        effect: 'spawn_food',
        spawnId: 'burger',
        description: '召喚漢堡',
        icon: '🍔'
    },
    {
        id: 'want_noodles',
        sentence: "I want some noodles.",
        keywords: ["noodles", "noodle"],
        chinese: "我想要一些麵。",
        type: 'B',
        effect: 'spawn_food',
        spawnId: 'noodles',
        description: '召喚麵食',
        icon: '🍜'
    },
    {
        id: 'want_egg',
        sentence: "Do you want an egg?",
        keywords: ["egg"],
        chinese: "你想要蛋嗎？",
        type: 'B',
        effect: 'spawn_food',
        spawnId: 'egg',
        description: '召喚雞蛋',
        icon: '🥚'
    },

    // 物品位置
    {
        id: 'loc_bag',
        sentence: "Where is my bag?",
        keywords: ["bag"],
        chinese: "我的包包在哪？",
        type: 'B',
        effect: 'spawn_item',
        spawnId: 'bag',
        description: '召喚包包',
        icon: '👜'
    },
    {
        id: 'loc_chair',
        sentence: "It's on the chair.",
        keywords: ["chair"],
        chinese: "它在椅子上。",
        type: 'B',
        effect: 'spawn_item',
        spawnId: 'chair',
        description: '召喚椅子',
        icon: '🪑'
    },
    {
        id: 'loc_desk',
        sentence: "Is it under the desk?",
        keywords: ["desk", "table"],
        chinese: "它在書桌下嗎？",
        type: 'B',
        effect: 'spawn_item',
        spawnId: 'desk',
        description: '召喚書桌',
        icon: '🏫'
    },
    {
        id: 'loc_box',
        sentence: "It's by the box.",
        keywords: ["box"],
        chinese: "它在箱子旁。",
        type: 'B',
        effect: 'spawn_item',
        spawnId: 'box',
        description: '召喚箱子',
        icon: '📦'
    },

    // 其他情緒與動作
    {
        id: 'emotion_happy',
        sentence: "I am so happy.",
        keywords: ["happy", "i am happy"],
        chinese: "我好開心。",
        type: 'B',
        effect: 'happy',
        description: '愛心粒子',
        icon: '💕'
    },
    {
        id: 'action_run',
        sentence: "Let's go running.",
        keywords: ["let's go", "run"],
        chinese: "我們去跑步吧。",
        type: 'B',
        effect: 'speed',
        description: '加速移動',
        icon: '🏃'
    }
];

// 向下相容的 OBJECT_NAMES (如果還有地方用到的話)
export const OBJECT_NAMES = {
    'tree': '🌲 樹木',
    'mountain': '⛰️ 山脈',
    'house': '🏠 房屋',
    'person': '👤 居民',
    'river': '💧 河流'
};

/**
 * 計算 Levenshtein 距離 (編輯距離)
 * 用於模糊比對，容許些微發音誤差
 */
export function levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * 計算相似度 (0-1)
 */
export function similarity(a, b) {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshteinDistance(a, b) / maxLen;
}
