/**
 * WeatherSystem.js - 全域特效系統
 * 負責天氣變化、日夜轉換等全域效果
 */
import * as THREE from 'three';

export class WeatherSystem {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;

        // 當前狀態
        this.currentWeather = 'sunny';
        this.currentTime = 'day';

        // 顏色設定
        this.colors = {
            daySky: 0x87CEEB,
            nightSky: 0x1a1a3e,
            morningSky: 0xFFB6C1,
            rainSky: 0x607D8B
        };

        // 粒子系統
        this.rainParticles = null;
        this.isRaining = false;
    }

    /**
     * 觸發下雨
     */
    triggerRain() {
        if (this.isRaining) return;

        this.currentWeather = 'rainy';
        this.isRaining = true;

        // 變暗天空
        this.sceneManager.setSkyColor(this.colors.rainSky);

        // 建立雨滴粒子
        this.createRainParticles();

        console.log('[WeatherSystem] 開始下雨');
    }

    /**
     * 建立雨滴粒子系統
     */
    createRainParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            // 隨機分布在島嶼上方
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = Math.random() * 10 + 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            velocities.push({
                y: -0.2 - Math.random() * 0.1
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xaaccff,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        this.rainParticles = new THREE.Points(geometry, material);
        this.rainParticles.userData.velocities = velocities;
        this.sceneManager.add(this.rainParticles);

        // 註冊動畫
        this.sceneManager.addAnimationCallback((time, delta) => {
            if (this.rainParticles && this.isRaining) {
                this.updateRain();
            }
        });
    }

    /**
     * 更新雨滴位置
     */
    updateRain() {
        if (!this.rainParticles) return;

        const positions = this.rainParticles.geometry.attributes.position.array;
        const velocities = this.rainParticles.userData.velocities;

        for (let i = 0; i < velocities.length; i++) {
            positions[i * 3 + 1] += velocities[i].y;

            // 重置掉落到地面的雨滴
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = Math.random() * 5 + 10;
            }
        }

        this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * 停止下雨
     */
    stopRain() {
        if (!this.isRaining) return;

        this.isRaining = false;

        if (this.rainParticles) {
            this.sceneManager.remove(this.rainParticles);
            this.rainParticles = null;
        }

        this.sceneManager.setSkyColor(this.colors.daySky);
        this.currentWeather = 'sunny';

        console.log('[WeatherSystem] 停止下雨');
    }

    /**
     * 觸發晴天
     */
    triggerSunny() {
        this.stopRain();
        this.sceneManager.setSkyColor(this.colors.daySky);
        this.currentWeather = 'sunny';
        this.currentTime = 'day';

        console.log('[WeatherSystem] 天氣放晴');
    }

    /**
     * 觸發夜晚
     */
    triggerNight() {
        this.stopRain();
        this.sceneManager.setSkyColor(this.colors.nightSky);
        this.currentTime = 'night';

        // TODO: 房屋亮燈效果

        console.log('[WeatherSystem] 進入夜晚');
    }

    /**
     * 觸發早晨
     */
    triggerMorning() {
        this.stopRain();
        this.sceneManager.setSkyColor(this.colors.morningSky);
        this.currentTime = 'morning';

        console.log('[WeatherSystem] 早晨來臨');
    }

    /**
     * 取得當前狀態
     */
    getState() {
        return {
            weather: this.currentWeather,
            time: this.currentTime
        };
    }
}
