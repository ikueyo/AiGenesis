/**
 * TerrainGenerator.js - 地形生成器
 * 負責網格系統、河流演算法、體素化地形
 */
import * as THREE from 'three';

export class TerrainGenerator {
    constructor(objectFactory) {
        this.objectFactory = objectFactory;

        // 設定參數
        this.config = {
            gridSize: 16,      // 網格大小 16x16
            cellSize: 1.0,     // 每格寬度
            groundHeight: 0.3, // 地面高度
            waterLevel: 0.05,  // 水面高度
        };

        // 網格狀態 (0:草地, 1:水, 2:障礙物)
        this.grid = [];

        // 水流 Shader 材質
        this.waterMaterial = this.createWaterMaterial();

        // 材質
        this.materials = {
            ground: new THREE.MeshStandardMaterial({ color: 0x8CDD81, roughness: 0.9 }),
            dirt: new THREE.MeshStandardMaterial({ color: 0x8B4513 }),
        };

        // 生成的物件追蹤
        this.terrainObjects = [];
        this.spawnedObjects = {
            trees: [],
            mountains: [],
            houses: [],
            people: []
        };
    }

    /**
     * 建立水流 Shader 材質
     */
    createWaterMaterial() {
        const waterVertexShader = `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            void main() {
                vUv = uv;
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                
                vec3 pos = position;
                pos.z += sin(worldPosition.x * 2.0 + worldPosition.z) * 0.03;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

        const waterFragmentShader = `
            uniform float uTime;
            varying vec3 vWorldPosition;
            
            void main() {
                float streamLines = sin(vWorldPosition.z * 10.0 + sin(vWorldPosition.x * 2.0 - uTime * 3.0));
                float wave = sin(vWorldPosition.x * 3.0 - uTime * 4.0 + vWorldPosition.z * 2.0);
                float combined = streamLines * 0.6 + wave * 0.4;
                
                vec3 baseColor = vec3(0.4, 0.8, 1.0);
                vec3 highlight = vec3(0.55, 0.85, 1.0);
                
                vec3 color = mix(baseColor, highlight, smoothstep(0.5, 0.9, combined));
                gl_FragColor = vec4(color, 0.85);
            }
        `;

        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 }
            },
            vertexShader: waterVertexShader,
            fragmentShader: waterFragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
    }

    /**
     * 生成完整地形
     * @param {THREE.Scene} scene 
     */
    generate(scene) {
        this.clearTerrain(scene);
        this.initGrid();
        this.generateRiver();
        this.buildTerrain(scene);
        // 不自動生成物件，等待語音指令
        // this.spawnInitialObjects(scene);

        console.log('[TerrainGenerator] 地形生成完成 (空白島嶼，等待語音創世)');
    }

    /**
     * 初始化網格
     */
    initGrid() {
        this.grid = Array(this.config.gridSize).fill(null)
            .map(() => Array(this.config.gridSize).fill(0));
    }

    /**
     * 使用 Random Walk 演算法生成河流
     */
    generateRiver() {
        let z = Math.floor(Math.random() * (this.config.gridSize - 4)) + 2;

        for (let x = 0; x < this.config.gridSize; x++) {
            this.grid[x][z] = 1; // 標記為水

            if (Math.random() > 0.6 && x < this.config.gridSize - 1) {
                const dir = Math.random() > 0.5 ? 1 : -1;
                if (z + dir > 1 && z + dir < this.config.gridSize - 2) {
                    z += dir;
                    this.grid[x][z] = 1;
                }
            }
        }
    }

    /**
     * 建構地形網格
     * @param {THREE.Scene} scene 
     */
    buildTerrain(scene) {
        const offset = (this.config.gridSize * this.config.cellSize) / 2 - (this.config.cellSize / 2);

        for (let x = 0; x < this.config.gridSize; x++) {
            for (let z = 0; z < this.config.gridSize; z++) {
                const wx = x * this.config.cellSize - offset;
                const wz = z * this.config.cellSize - offset;

                // 土壤基底
                const baseBlock = new THREE.Mesh(
                    new THREE.BoxGeometry(this.config.cellSize, 0.2, this.config.cellSize),
                    this.materials.dirt
                );
                baseBlock.position.set(wx, -0.1, wz);
                scene.add(baseBlock);
                this.terrainObjects.push(baseBlock);

                if (this.grid[x][z] === 1) {
                    // 河流
                    const waterMesh = new THREE.Mesh(
                        new THREE.PlaneGeometry(this.config.cellSize, this.config.cellSize),
                        this.waterMaterial
                    );
                    waterMesh.rotation.x = -Math.PI / 2;
                    waterMesh.position.set(wx, this.config.waterLevel, wz);
                    scene.add(waterMesh);
                    this.terrainObjects.push(waterMesh);
                } else {
                    // 草地
                    const groundMesh = new THREE.Mesh(
                        new THREE.BoxGeometry(
                            this.config.cellSize,
                            this.config.groundHeight,
                            this.config.cellSize
                        ),
                        this.materials.ground
                    );
                    groundMesh.position.set(wx, this.config.groundHeight / 2, wz);
                    groundMesh.receiveShadow = true;
                    groundMesh.castShadow = true;
                    scene.add(groundMesh);
                    this.terrainObjects.push(groundMesh);
                }
            }
        }
    }

    /**
     * 在隨機位置生成初始物件
     * @param {THREE.Scene} scene 
     */
    spawnInitialObjects(scene) {
        const offset = (this.config.gridSize * this.config.cellSize) / 2 - (this.config.cellSize / 2);

        for (let x = 0; x < this.config.gridSize; x++) {
            for (let z = 0; z < this.config.gridSize; z++) {
                if (this.grid[x][z] !== 0) continue; // 只在草地生成

                const wx = x * this.config.cellSize - offset;
                const wz = z * this.config.cellSize - offset;
                const rand = Math.random();

                if (rand < 0.15) {
                    const tree = this.objectFactory.createTree(wx, this.config.groundHeight, wz);
                    scene.add(tree);
                    this.spawnedObjects.trees.push(tree);
                    this.grid[x][z] = 2; // 阻擋
                } else if (rand < 0.20) {
                    const mountain = this.objectFactory.createMountain(wx, this.config.groundHeight, wz);
                    scene.add(mountain);
                    this.spawnedObjects.mountains.push(mountain);
                    this.grid[x][z] = 2;
                } else if (rand < 0.24) {
                    const house = this.objectFactory.createHouse(wx, this.config.groundHeight, wz);
                    scene.add(house);
                    this.spawnedObjects.houses.push(house);
                    this.grid[x][z] = 2;
                } else if (rand < 0.27) {
                    const person = this.objectFactory.createPerson(wx, this.config.groundHeight, wz);
                    scene.add(person);
                    this.spawnedObjects.people.push(person);
                    // 人不阻擋，他們會移動
                }
            }
        }
    }

    /**
     * 在指定位置生成物件 (語音指令用)
     * @param {THREE.Scene} scene 
     * @param {string} type - 物件類型: tree, mountain, house, person
     * @param {Object} options - 可選設定 (顏色、大小等)
     * @returns {THREE.Group|null}
     */
    spawnObject(scene, type, options = {}) {
        const requiredRadius = (type === 'mountain') ? 1 : 0;
        const availablePositions = [];
        const offset = (this.config.gridSize * this.config.cellSize) / 2 - (this.config.cellSize / 2);

        // 尋找符合半徑需求的可用位置
        for (let x = requiredRadius; x < this.config.gridSize - requiredRadius; x++) {
            for (let z = requiredRadius; z < this.config.gridSize - requiredRadius; z++) {
                // 山脈特殊規則：允許重疊其他山脈 (Grid 3)
                if (type === 'mountain') {
                    if (this.isAreaValidForMountain(x, z, requiredRadius)) {
                        availablePositions.push({ x, z });
                    }
                } else {
                    // 其他物件：只能在空地 (Grid 0) 生成
                    if (this.isAreaFree(x, z, requiredRadius)) {
                        availablePositions.push({ x, z });
                    }
                }
            }
        }

        if (availablePositions.length === 0) {
            console.warn('[TerrainGenerator] 沒有可用的生成位置 (空間不足)');
            return null;
        }

        // 隨機選擇位置
        const pos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        const wx = pos.x * this.config.cellSize - offset;
        const wz = pos.z * this.config.cellSize - offset;

        let object = null;

        switch (type) {
            case 'tree':
                object = this.objectFactory.createTree(wx, this.config.groundHeight, wz, options);
                this.spawnedObjects.trees.push(object);
                if (!options.noBlock) this.markArea(pos.x, pos.z, 0, 2); // 2: 一般障礙物
                break;
            case 'mountain':
                object = this.objectFactory.createMountain(wx, this.config.groundHeight, wz, options);
                this.spawnedObjects.mountains.push(object);
                if (!options.noBlock) this.markArea(pos.x, pos.z, 1, 3); // 3: 山脈 (允許重疊)
                break;
            case 'house':
                object = this.objectFactory.createHouse(wx, this.config.groundHeight, wz, options);
                this.spawnedObjects.houses.push(object);
                if (!options.noBlock) this.markArea(pos.x, pos.z, 0, 2);
                break;
            case 'person':
                object = this.objectFactory.createPerson(wx, this.config.groundHeight, wz, options);
                this.spawnedObjects.people.push(object);
                // 人不阻擋格子
                break;
            default:
                console.warn('[TerrainGenerator] 未知的物件類型:', type);
                return null;
        }

        scene.add(object);
        console.log(`[TerrainGenerator] 生成 ${type} 於 (${wx.toFixed(1)}, ${wz.toFixed(1)})`);
        return object;
    }

    /**
     * 檢查區域是否空閒 (只允許 0)
     */
    isAreaFree(cx, cz, radius) {
        for (let x = cx - radius; x <= cx + radius; x++) {
            for (let z = cz - radius; z <= cz + radius; z++) {
                if (x < 0 || x >= this.config.gridSize || z < 0 || z >= this.config.gridSize) return false;
                if (this.grid[x][z] !== 0) return false;
            }
        }
        return true;
    }

    /**
     * 檢查區域是否適合山脈 (允許 0 或 3)
     */
    isAreaValidForMountain(cx, cz, radius) {
        for (let x = cx - radius; x <= cx + radius; x++) {
            for (let z = cz - radius; z <= cz + radius; z++) {
                if (x < 0 || x >= this.config.gridSize || z < 0 || z >= this.config.gridSize) return false;
                const val = this.grid[x][z];
                // 允許 空地(0) 或 山脈(3)
                if (val !== 0 && val !== 3) return false;
            }
        }
        return true;
    }

    /**
     * 標記區域狀態
     */
    markArea(cx, cz, radius, value) {
        for (let x = cx - radius; x <= cx + radius; x++) {
            for (let z = cz - radius; z <= cz + radius; z++) {
                if (x >= 0 && x < this.config.gridSize && z >= 0 && z < this.config.gridSize) {
                    this.grid[x][z] = value;
                }
            }
        }
    }

    /**
     * 更新水流動畫
     * @param {number} time 
     */
    updateWater(time) {
        this.waterMaterial.uniforms.uTime.value = time;
    }

    /**
     * 清除地形
     * @param {THREE.Scene} scene 
     */
    clearTerrain(scene) {
        for (const obj of this.terrainObjects) {
            scene.remove(obj);
        }
        for (const type in this.spawnedObjects) {
            for (const obj of this.spawnedObjects[type]) {
                scene.remove(obj);
            }
            this.spawnedObjects[type] = [];
        }
        this.terrainObjects = [];
        this.objectFactory.clearAnimations();
    }

    /**
     * 取得物件統計
     * @returns {Object}
     */
    getStats() {
        return {
            trees: this.spawnedObjects.trees.length,
            mountains: this.spawnedObjects.mountains.length,
            houses: this.spawnedObjects.houses.length,
            people: this.spawnedObjects.people.length
        };
    }

    /**
     * 取得網格資訊 (供 AI 避障使用)
     * @returns {Object}
     */
    getGridInfo() {
        return {
            grid: this.grid,
            config: this.config
        };
    }
}
