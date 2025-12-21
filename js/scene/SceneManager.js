/**
 * SceneManager.js - Three.js 場景管理
 * 負責初始化渲染器、相機、光源、動畫迴圈
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.animationCallbacks = [];
        this.clock = new THREE.Clock();
    }

    /**
     * 初始化場景
     */
    init() {
        // 建立場景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 60);

        // 建立相機
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 20, 20);

        // 建立渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.SoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // 建立控制器
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.maxPolarAngle = Math.PI / 2.2;

        // 設定光源
        this.setupLights();

        // 視窗 resize 處理
        window.addEventListener('resize', () => this.onWindowResize());

        // 啟動動畫迴圈
        this.animate();

        console.log('[SceneManager] 場景初始化完成');
    }

    /**
     * 設定光源
     */
    setupLights() {
        // 環境光
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        // 太陽光 (方向光)
        const sun = new THREE.DirectionalLight(0xffffee, 1.2);
        sun.position.set(15, 20, 10);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 60;

        const d = 15;
        sun.shadow.camera.left = -d;
        sun.shadow.camera.right = d;
        sun.shadow.camera.top = d;
        sun.shadow.camera.bottom = -d;

        this.scene.add(sun);
        this.sun = sun;
    }

    /**
     * 視窗大小變更處理
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * 註冊動畫回調
     * @param {Function} callback - 每幀呼叫的函式 (time, delta)
     */
    addAnimationCallback(callback) {
        this.animationCallbacks.push(callback);
    }

    /**
     * 移除動畫回調
     * @param {Function} callback 
     */
    removeAnimationCallback(callback) {
        const index = this.animationCallbacks.indexOf(callback);
        if (index > -1) {
            this.animationCallbacks.splice(index, 1);
        }
    }

    /**
     * 動畫迴圈
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 更新控制器
        this.controls.update();

        // 呼叫所有動畫回調
        for (const callback of this.animationCallbacks) {
            callback(time, delta);
        }

        // 渲染場景
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * 加入物件到場景
     * @param {THREE.Object3D} object 
     */
    add(object) {
        this.scene.add(object);
    }

    /**
     * 從場景移除物件
     * @param {THREE.Object3D} object 
     */
    remove(object) {
        this.scene.remove(object);
    }

    /**
     * 清除場景中的所有 mesh 和 group
     */
    clearMeshes() {
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            const obj = this.scene.children[i];
            if (obj.isMesh || obj.isGroup) {
                this.scene.remove(obj);
            }
        }
    }

    /**
     * 設定天空顏色
     * @param {number} color - 16 進位顏色
     */
    setSkyColor(color) {
        this.scene.background = new THREE.Color(color);
        this.scene.fog.color = new THREE.Color(color);
    }
}
