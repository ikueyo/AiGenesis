/**
 * ObjectFactory.js - 3D 物件工廠
 * 負責生成五大核心元件：樹、山、房、人、河
 */
import * as THREE from 'three';

export class ObjectFactory {
    constructor() {
        // 材質定義
        this.materials = {
            ground: new THREE.MeshStandardMaterial({ color: 0x8CDD81, roughness: 0.9 }),
            dirt: new THREE.MeshStandardMaterial({ color: 0x8B4513 }),
            stone: new THREE.MeshStandardMaterial({ color: 0x808B96, flatShading: true }),
            snow: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, flatShading: true }),
            wood: new THREE.MeshStandardMaterial({ color: 0x8B4513 }),
            leaf: new THREE.MeshStandardMaterial({ color: 0x2ECC71, flatShading: true }),
            wall: new THREE.MeshStandardMaterial({ color: 0xFFF8E7 }),
            roof: new THREE.MeshStandardMaterial({ color: 0xE74C3C, flatShading: true }),
            skin: new THREE.MeshStandardMaterial({ color: 0xF5CBA7 }),
            shirt: new THREE.MeshStandardMaterial({ color: 0xF39C12 }),
            // 粒子特效材質
            sparkle: new THREE.MeshBasicMaterial({ color: 0xFFD700 })
        };

        // 追蹤動畫物件
        this.animatedObjects = [];

        // 追蹤 spawn 動畫 (絢麗的彈出效果)
        this.spawnAnimations = [];
    }

    /**
     * 建立樹木
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {Object} options - 可選參數 { scale, leafColor }
     * @returns {THREE.Group}
     */
    createTree(x, y, z, options = {}) {
        const group = new THREE.Group();
        const scale = options.scale || (0.5 + Math.random() * 0.5);

        // 樹幹
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1 * scale, 0.2 * scale, 0.6 * scale, 6),
            this.materials.wood
        );
        trunk.position.y = 0.3 * scale;
        trunk.castShadow = true;
        group.add(trunk);

        // 樹葉
        const leafMaterial = options.leafColor
            ? new THREE.MeshStandardMaterial({ color: options.leafColor, flatShading: true })
            : this.materials.leaf;

        const leaf = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.6 * scale, 0),
            leafMaterial
        );
        leaf.position.y = 0.8 * scale;
        leaf.castShadow = true;
        group.add(leaf);

        group.position.set(x, y, z);

        // 加入動畫追蹤
        this.animatedObjects.push({
            mesh: leaf,
            type: 'sway',
            offset: Math.random() * 100
        });

        return group;
    }

    /**
     * 建立山脈
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {Object} options - 可選參數 { scale }
     * @returns {THREE.Group}
     */
    createMountain(x, y, z, options = {}) {
        const group = new THREE.Group();
        const scale = options.scale || (1.0 + Math.random() * 0.4);

        // 主山體 (Low-Poly 風格)
        const mountain = new THREE.Mesh(
            new THREE.ConeGeometry(2.5 * scale * 0.5, 4.0 * scale * 0.5, 7),
            this.materials.stone
        );
        mountain.position.y = 1.0 * scale;
        mountain.castShadow = true;
        group.add(mountain);

        // 雪頂 (縮小並提高位置，避免 z-fighting)
        const snowCapRadius = 2.5 * scale * 0.5 * 0.3;  // 略小於山體頂部
        const snowCapHeight = 4.0 * scale * 0.5 * 0.3;
        const snowCap = new THREE.Mesh(
            new THREE.ConeGeometry(snowCapRadius, snowCapHeight, 7),
            this.materials.snow
        );
        // 計算雪頂位置：主山體高度的 70% 處開始
        const mountainHeight = 4.0 * scale * 0.5;
        snowCap.position.y = 1.0 * scale + mountainHeight * 0.42;
        group.add(snowCap);

        group.position.set(x, y, z);
        group.rotation.y = Math.random() * Math.PI * 2;

        return group;
    }

    /**
     * 建立房屋
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {Object} options - 可選參數 { roofColor }
     * @returns {THREE.Group}
     */
    createHouse(x, y, z, options = {}) {
        const group = new THREE.Group();

        // 房身
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.8, 0.8),
            this.materials.wall
        );
        body.position.y = 0.4;
        body.castShadow = true;
        group.add(body);

        // 屋頂
        const roofMaterial = options.roofColor
            ? new THREE.MeshStandardMaterial({ color: options.roofColor, flatShading: true })
            : this.materials.roof;

        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(0.7, 0.6, 4),
            roofMaterial
        );
        roof.position.y = 1.1;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        group.position.set(x, y, z);
        group.rotation.y = (Math.floor(Math.random() * 4) * Math.PI / 2);

        if (options.icon) {
            const iconSprite = this.createFloatingIcon(options.icon);
            const iconY = 1.6;
            iconSprite.position.y = iconY;
            group.add(iconSprite);

            this.animatedObjects.push({
                mesh: iconSprite,
                type: 'bob',
                baseY: iconY, // 記錄基準高度供動畫使用
                offset: Math.random() * 100
            });
        }

        return group;
    }

    /**
     * 建立居民
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {Object} options - 可選參數 { shirtColor }
     * @returns {THREE.Group}
     */
    createPerson(x, y, z, options = {}) {
        const group = new THREE.Group();

        // 身體
        const shirtMaterial = options.shirtColor
            ? new THREE.MeshStandardMaterial({ color: options.shirtColor })
            : this.materials.shirt;

        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.15, 0.35, 8),
            shirtMaterial
        );
        body.position.y = 0.175;
        body.castShadow = true;
        group.add(body);

        // 頭
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            this.materials.skin
        );
        head.position.y = 0.45;
        head.castShadow = true;
        group.add(head);

        group.position.set(x, y, z);

        if (options.icon) {
            const iconSprite = this.createFloatingIcon(options.icon);
            const iconY = 0.8;
            iconSprite.position.y = iconY;
            group.add(iconSprite);

            this.animatedObjects.push({
                mesh: iconSprite,
                type: 'bob',
                baseY: iconY,
                offset: Math.random() * 100
            });
        }

        return group;
    }

    /**
     * 建立飄浮 Icon Sprite
     * @param {string} iconChar 
     * @returns {THREE.Sprite}
     */
    createFloatingIcon(iconChar) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.font = '80px "Segoe UI Emoji", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.fillText(iconChar, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.6, 0.6, 0.6); // Icon 大小
        return sprite;
    }

    /**
     * 更新動畫物件 (樹葉搖曳等)
     * @param {number} time - 經過時間
     */
    updateAnimations(time) {
        // 樹葉搖曳動畫
        for (const obj of this.animatedObjects) {
            if (obj.type === 'sway') {
                obj.mesh.rotation.z = Math.sin(time * 2 + obj.offset) * 0.1;
                obj.mesh.rotation.x = Math.cos(time * 1.5 + obj.offset) * 0.1;
            } else if (obj.type === 'bob') {
                // 上下浮動
                obj.mesh.position.y = obj.baseY + Math.sin(time * 3 + obj.offset) * 0.1;
            }
        }

        // Spawn 彈出動畫... (unchanged)
        for (let i = this.spawnAnimations.length - 1; i >= 0; i--) {
            const anim = this.spawnAnimations[i];
            anim.progress += anim.speed;

            if (anim.progress >= 1) {
                // 動畫完成
                anim.object.scale.set(1, 1, 1);
                anim.object.position.y = anim.targetY;

                // 移除粒子
                if (anim.particles) {
                    anim.object.parent?.remove(anim.particles);
                }

                this.spawnAnimations.splice(i, 1);
            } else {
                // 彈跳緩動函數 (easeOutElastic)
                const t = anim.progress;
                const c4 = (2 * Math.PI) / 3;
                const elasticScale = t === 0 ? 0 : t === 1 ? 1
                    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;

                // 套用縮放
                const scale = elasticScale;
                anim.object.scale.set(scale, scale, scale);

                // 從地下彈出
                const yOffset = (1 - elasticScale) * -0.5;
                anim.object.position.y = anim.targetY + yOffset;

                // 更新粒子
                if (anim.particles) {
                    this.updateSpawnParticles(anim.particles, anim.progress, time);
                }
            }
        }
    }

    /**
     * 為物件添加 spawn 動畫 (絢麗的彈出效果)
     * @param {THREE.Object3D} object - 要動畫的物件
     * @param {THREE.Scene} scene - 場景 (用於添加粒子)
     */
    addSpawnAnimation(object, scene) {
        const targetY = object.position.y;

        // 初始狀態：縮放為 0，藏在地下
        object.scale.set(0, 0, 0);
        object.position.y = targetY - 0.5;

        // 建立閃光粒子
        const particles = this.createSpawnParticles(object.position, scene);

        this.spawnAnimations.push({
            object: object,
            targetY: targetY,
            progress: 0,
            speed: 0.025,  // 動畫速度
            particles: particles
        });

        console.log('[ObjectFactory] 開始 spawn 動畫');
    }

    /**
     * 建立 spawn 閃光粒子
     * @param {THREE.Vector3} position 
     * @param {THREE.Scene} scene 
     * @returns {THREE.Points}
     */
    createSpawnParticles(position, scene) {
        const particleCount = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = [];

        // 閃亮的金色/白色粒子
        const sparkleColors = [
            new THREE.Color(0xFFD700),  // 金色
            new THREE.Color(0xFFFFFF),  // 白色
            new THREE.Color(0x00FFFF),  // 青色
            new THREE.Color(0xFF69B4),  // 粉紅
        ];

        for (let i = 0; i < particleCount; i++) {
            // 從中心點向外擴散
            positions[i * 3] = position.x + (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] = position.y + Math.random() * 0.5;
            positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.5;

            // 隨機顏色
            const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            // 向外擴散速度
            velocities.push({
                x: (Math.random() - 0.5) * 0.1,
                y: Math.random() * 0.15 + 0.05,
                z: (Math.random() - 0.5) * 0.1,
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,  // 發光混合
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData.velocities = velocities;
        particles.userData.baseY = position.y;
        scene.add(particles);

        return particles;
    }

    /**
     * 更新 spawn 粒子
     * @param {THREE.Points} particles 
     * @param {number} progress 
     * @param {number} time 
     */
    updateSpawnParticles(particles, progress, time) {
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.userData.velocities;

        for (let i = 0; i < velocities.length; i++) {
            positions[i * 3] += velocities[i].x;
            positions[i * 3 + 1] += velocities[i].y;
            positions[i * 3 + 2] += velocities[i].z;

            // 重力效果
            velocities[i].y -= 0.005;
        }

        particles.geometry.attributes.position.needsUpdate = true;

        // 淡出效果
        particles.material.opacity = 1 - progress;
    }

    /**
     * 清除動畫追蹤
     */
    clearAnimations() {
        this.animatedObjects = [];
        this.spawnAnimations = [];
    }
}
