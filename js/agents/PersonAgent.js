/**
 * PersonAgent.js - AI 智能體
 * 負責居民的自主導航與行為
 */
import * as THREE from 'three';

export class PersonAgent {
    constructor(mesh, gridInfo, baseY) {
        this.mesh = mesh;
        this.gridInfo = gridInfo; // { grid, config }
        this.baseY = baseY;

        // 狀態
        this.state = 'idle'; // idle, walk
        this.target = new THREE.Vector3().copy(mesh.position);
        this.timer = Math.random() * 2;

        // 移動參數
        this.speed = 0.03;
        this.speedMultiplier = 1.0; // 可被魔法加速
    }

    /**
     * 更新 AI 行為
     * @param {number} time - 經過時間
     * @param {number} delta - 幀間隔
     */
    update(time, delta) {
        const config = this.gridInfo.config;
        const grid = this.gridInfo.grid;
        const offset = (config.gridSize * config.cellSize) / 2 - (config.cellSize / 2);

        if (this.state === 'idle') {
            this.timer -= delta;

            if (this.timer <= 0) {
                // 嘗試移動
                const currentGx = Math.round((this.mesh.position.x + offset) / config.cellSize);
                const currentGz = Math.round((this.mesh.position.z + offset) / config.cellSize);

                // 四方向移動
                const moves = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                const shuffled = moves.sort(() => Math.random() - 0.5);

                for (const [dx, dz] of shuffled) {
                    const nextGx = currentGx + dx;
                    const nextGz = currentGz + dz;

                    // 邊界檢查
                    if (nextGx < 0 || nextGx >= config.gridSize ||
                        nextGz < 0 || nextGz >= config.gridSize) {
                        continue;
                    }

                    // 只能走草地 (grid = 0)
                    if (grid[nextGx] && grid[nextGx][nextGz] === 0) {
                        this.target.set(
                            nextGx * config.cellSize - offset,
                            this.baseY,
                            nextGz * config.cellSize - offset
                        );
                        this.state = 'walk';

                        // 轉向目標
                        this.mesh.lookAt(this.target.x, this.mesh.position.y, this.target.z);
                        break;
                    }
                }

                // 重設計時器
                this.timer = 1 + Math.random() * 2;
            }
        } else if (this.state === 'walk') {
            const actualSpeed = this.speed * this.speedMultiplier;
            const dir = new THREE.Vector3()
                .subVectors(this.target, this.mesh.position)
                .normalize();
            const dist = this.mesh.position.distanceTo(this.target);

            if (dist < actualSpeed) {
                // 到達目標
                this.mesh.position.copy(this.target);
                this.state = 'idle';
                this.timer = 1 + Math.random() * 2;
            } else {
                // 移動中
                this.mesh.position.add(dir.multiplyScalar(actualSpeed));

                // 跳躍動畫 (Sine wave bounce)
                this.mesh.position.y = this.baseY + Math.abs(Math.sin(time * 15)) * 0.1;
            }
        }
    }

    /**
     * 設定移動速度倍率
     * @param {number} multiplier 
     */
    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
    }

    /**
     * 觸發愛心效果 (預留給粒子系統)
     */
    triggerHappy() {
        // TODO: 頭上生成愛心粒子
        console.log('[PersonAgent] 觸發開心效果');
    }

    /**
     * 觸發揮手效果
     */
    triggerWave() {
        // TODO: 揮手動畫
        console.log('[PersonAgent] 觸發揮手效果');
    }
}

/**
 * AgentManager - 管理所有 AI 智能體
 */
export class AgentManager {
    constructor() {
        this.agents = [];
    }

    /**
     * 新增智能體
     * @param {THREE.Group} mesh 
     * @param {Object} gridInfo 
     * @param {number} baseY 
     */
    addAgent(mesh, gridInfo, baseY) {
        const agent = new PersonAgent(mesh, gridInfo, baseY);
        this.agents.push(agent);
        return agent;
    }

    /**
     * 更新所有智能體
     * @param {number} time 
     * @param {number} delta 
     */
    update(time, delta) {
        for (const agent of this.agents) {
            agent.update(time, delta);
        }
    }

    /**
     * 設定所有智能體速度倍率
     * @param {number} multiplier 
     */
    setAllSpeedMultiplier(multiplier) {
        for (const agent of this.agents) {
            agent.setSpeedMultiplier(multiplier);
        }
    }

    /**
     * 觸發所有智能體開心效果
     */
    triggerAllHappy() {
        for (const agent of this.agents) {
            agent.triggerHappy();
        }
    }

    /**
     * 觸發所有智能體揮手
     */
    triggerAllWave() {
        for (const agent of this.agents) {
            agent.triggerWave();
        }
    }

    /**
     * 清除所有智能體
     */
    clear() {
        this.agents = [];
    }

    /**
     * 取得智能體數量
     * @returns {number}
     */
    getCount() {
        return this.agents.length;
    }
}
