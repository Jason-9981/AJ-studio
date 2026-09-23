import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class AvatarScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.lights = {};
    this.avatarGroup = new THREE.Group();
    this.currentLighting = 'studio'; // studio, beach, neon
    this.isAutoRotating = true;

    // 換裝零件儲存參照
    this.parts = {
      body: null,
      hair: null,
      outfit: null,
      glasses: null,
      shoes: null,
    };

    // 目標相機位置與焦點 (用於平滑 Lerp)
    this.targetCameraPos = new THREE.Vector3(0, 1.4, 2.5);
    this.targetLookAt = new THREE.Vector3(0, 1.0, 0);

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Camera (支援無段近距與遠距)
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 50);
    this.camera.position.copy(this.targetCameraPos);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // 3. OrbitControls (支援 360 度旋轉，minDistance 設至 0.25 實現面部微距)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.copy(this.targetLookAt);
    this.controls.minDistance = 0.25; // 可放大至面部看清皮膚細節
    this.controls.maxDistance = 6.0;  // 可縮小至全身
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // 地面防穿透
    this.controls.autoRotate = this.isAutoRotating;
    this.controls.autoRotateSpeed = 1.5;

    // 4. 背景與光照
    this.scene.background = new THREE.Color(0x0c0d10);
    this.scene.fog = new THREE.FogExp2(0x0c0d10, 0.04);
    this.setupLighting();
    this.setupGround();

    // 5. 建立 3D 數位人模型
    this.buildBaseAvatar();
    this.scene.add(this.avatarGroup);

    // 6. 事件監聽
    window.addEventListener('resize', () => this.onResize());

    // 7. 啟動渲染循環
    this.animate();

    // 移除 Loading
    setTimeout(() => {
      const loader = document.getElementById('loading-overlay');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }
    }, 400);
  }

  setupLighting() {
    // 環境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    this.lights.ambient = ambientLight;

    // 主光 Key Light
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    keyLight.position.set(3, 4, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    this.scene.add(keyLight);
    this.lights.key = keyLight;

    // 補光 Fill Light
    const fillLight = new THREE.DirectionalLight(0x8bc34a, 0.8);
    fillLight.position.set(-3, 2.5, 2);
    this.scene.add(fillLight);
    this.lights.fill = fillLight;

    // 輪廓背光 Rim Light
    const rimLight = new THREE.DirectionalLight(0x40c4ff, 1.8);
    rimLight.position.set(0, 3, -3.5);
    this.scene.add(rimLight);
    this.lights.rim = rimLight;
  }

  setupGround() {
    // 地面反光陰影接收圓盤
    const groundGeo = new THREE.CircleGeometry(4, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x14161d,
      roughness: 0.6,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 圓環光圈裝飾
    const ringGeo = new THREE.RingGeometry(3.9, 4.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x2563eb, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;
    this.scene.add(ring);
  }

  buildBaseAvatar() {
    // 依據使用者上傳的衝浪影片建立健美身型數位人模型
    // 1. 肌膚材質 (具備次表面散射感、水光微光感)
    this.skinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd69b76,
      roughness: 0.38,
      metalness: 0.04,
      clearcoat: 0.3,
      clearcoatRoughness: 0.25,
      reflectivity: 0.6,
    });

    const bodyGroup = new THREE.Group();

    // 頭部與面部
    const headGeo = new THREE.SphereGeometry(0.14, 32, 32);
    headGeo.scale(1, 1.25, 1.05);
    const headMesh = new THREE.Mesh(headGeo, this.skinMaterial);
    headMesh.position.set(0, 1.68, 0);
    headMesh.castShadow = true;
    bodyGroup.add(headMesh);

    // 頸部
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.14, 24);
    const neckMesh = new THREE.Mesh(neckGeo, this.skinMaterial);
    neckMesh.position.set(0, 1.52, 0);
    neckMesh.castShadow = true;
    bodyGroup.add(neckMesh);

    // 健美胸膛與軀幹 (還原影片胸肌與六塊腹肌比例)
    const chestGeo = new THREE.CylinderGeometry(0.24, 0.19, 0.38, 32);
    chestGeo.scale(1.15, 1, 0.75);
    const chestMesh = new THREE.Mesh(chestGeo, this.skinMaterial);
    chestMesh.position.set(0, 1.32, 0);
    chestMesh.castShadow = true;
    bodyGroup.add(chestMesh);

    const waistGeo = new THREE.CylinderGeometry(0.19, 0.18, 0.28, 32);
    waistGeo.scale(1.05, 1, 0.72);
    const waistMesh = new THREE.Mesh(waistGeo, this.skinMaterial);
    waistMesh.position.set(0, 1.02, 0);
    waistMesh.castShadow = true;
    bodyGroup.add(waistMesh);

    // 手臂與雙手 (手臂微張放鬆姿態)
    const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.68, 20);
    const leftArm = new THREE.Mesh(armGeo, this.skinMaterial);
    leftArm.position.set(-0.31, 1.25, 0);
    leftArm.rotation.z = 0.15;
    leftArm.castShadow = true;
    bodyGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, this.skinMaterial);
    rightArm.position.set(0.31, 1.25, 0);
    rightArm.rotation.z = -0.15;
    rightArm.castShadow = true;
    bodyGroup.add(rightArm);

    // 雙腿
    const legGeo = new THREE.CylinderGeometry(0.09, 0.065, 0.88, 24);
    const leftLeg = new THREE.Mesh(legGeo, this.skinMaterial);
    leftLeg.position.set(-0.13, 0.46, 0);
    leftLeg.castShadow = true;
    bodyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, this.skinMaterial);
    rightLeg.position.set(0.13, 0.46, 0);
    rightLeg.castShadow = true;
    bodyGroup.add(rightLeg);

    this.parts.body = bodyGroup;
    this.avatarGroup.add(bodyGroup);

    // 初始化預設穿戴：短碎髮、衝浪泳褲、黑框眼鏡、極簡白波鞋
    this.setHair('hair_short');
    this.setOutfit('outfit_surf_trunks');
    this.setGlasses('glasses_black_frame');
    this.setShoes('shoes_sneakers_white');
  }

  // ===== 換裝切換方法 =====
  setHair(hairId) {
    if (this.parts.hair) this.avatarGroup.remove(this.parts.hair);

    const hairGroup = new THREE.Group();
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x181716,
      roughness: 0.7,
      metalness: 0.1,
    });

    if (hairId === 'hair_short') {
      // 影片同款：微濕短碎髮
      const topHair = new THREE.SphereGeometry(0.15, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.7);
      const mesh = new THREE.Mesh(topHair, hairMat);
      mesh.position.set(0, 1.76, 0);
      hairGroup.add(mesh);
    } else if (hairId === 'hair_wavy') {
      // 微卷中髮
      const topHair = new THREE.TorusGeometry(0.13, 0.06, 16, 32);
      topHair.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(topHair, hairMat);
      mesh.position.set(0, 1.77, 0);
      hairGroup.add(mesh);
    } else if (hairId === 'hair_pompadour') {
      // 側分背頭
      const topHair = new THREE.ConeGeometry(0.16, 0.22, 24);
      topHair.rotateZ(-0.3);
      const mesh = new THREE.Mesh(topHair, hairMat);
      mesh.position.set(0.04, 1.82, -0.02);
      hairGroup.add(mesh);
    }

    this.parts.hair = hairGroup;
    this.avatarGroup.add(hairGroup);
  }

  setOutfit(outfitId) {
    if (this.parts.outfit) this.avatarGroup.remove(this.parts.outfit);

    const outfitGroup = new THREE.Group();

    if (outfitId === 'outfit_surf_trunks') {
      // 影片 1 & 2 同款黑色專業衝浪短褲
      const trunksMat = new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.45, metalness: 0.1 });
      const waistGeo = new THREE.CylinderGeometry(0.2, 0.21, 0.15, 32);
      const waistMesh = new THREE.Mesh(waistGeo, trunksMat);
      waistMesh.position.set(0, 0.88, 0);
      waistMesh.castShadow = true;
      outfitGroup.add(waistMesh);

      const legTrunkGeo = new THREE.CylinderGeometry(0.11, 0.105, 0.26, 24);
      const lTrunk = new THREE.Mesh(legTrunkGeo, trunksMat);
      lTrunk.position.set(-0.13, 0.72, 0);
      const rTrunk = new THREE.Mesh(legTrunkGeo, trunksMat);
      rTrunk.position.set(0.13, 0.72, 0);
      outfitGroup.add(lTrunk, rTrunk);
    } else if (outfitId === 'outfit_modern_suit') {
      // 現代深藍休閒西裝 + 長褲
      const suitMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
      const jacketGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.58, 32);
      jacketGeo.scale(1.2, 1, 0.8);
      const jacket = new THREE.Mesh(jacketGeo, suitMat);
      jacket.position.set(0, 1.25, 0);
      jacket.castShadow = true;
      outfitGroup.add(jacket);

      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65 });
      const pantLegGeo = new THREE.CylinderGeometry(0.095, 0.075, 0.82, 24);
      const lPant = new THREE.Mesh(pantLegGeo, pantsMat);
      lPant.position.set(-0.13, 0.44, 0);
      const rPant = new THREE.Mesh(pantLegGeo, pantsMat);
      rPant.position.set(0.13, 0.44, 0);
      outfitGroup.add(lPant, rPant);
    } else if (outfitId === 'outfit_vintage_jacket') {
      // 經典復古工裝外套
      const vintageMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
      const jacketGeo = new THREE.CylinderGeometry(0.27, 0.24, 0.6, 32);
      jacketGeo.scale(1.22, 1, 0.85);
      const jacket = new THREE.Mesh(jacketGeo, vintageMat);
      jacket.position.set(0, 1.25, 0);
      outfitGroup.add(jacket);
    }

    this.parts.outfit = outfitGroup;
    this.avatarGroup.add(outfitGroup);
  }

  setGlasses(glassesId) {
    if (this.parts.glasses) this.avatarGroup.remove(this.parts.glasses);
    if (glassesId === 'glasses_none') {
      this.parts.glasses = null;
      return;
    }

    const glassesGroup = new THREE.Group();
    let frameColor = 0x171717;
    let isGold = false;

    if (glassesId === 'glasses_gold_rim') {
      frameColor = 0xd4af37;
      isGold = true;
    }

    const frameMat = new THREE.MeshStandardMaterial({
      color: frameColor,
      metalness: isGold ? 0.9 : 0.2,
      roughness: isGold ? 0.2 : 0.5,
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.05,
      transmission: 0.9,
      ior: 1.5,
    });

    // 左眼鏡框與鏡片
    const ringGeo = new THREE.TorusGeometry(0.038, 0.005, 12, 24);
    const lRing = new THREE.Mesh(ringGeo, frameMat);
    lRing.position.set(-0.052, 1.71, 0.13);
    const lLens = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), lensMat);
    lLens.position.set(-0.052, 1.71, 0.13);

    // 右眼鏡框與鏡片
    const rRing = new THREE.Mesh(ringGeo, frameMat);
    rRing.position.set(0.052, 1.71, 0.13);
    const rLens = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), lensMat);
    rLens.position.set(0.052, 1.71, 0.13);

    // 中間鼻樑架
    const bridgeGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.035, 8);
    bridgeGeo.rotateZ(Math.PI / 2);
    const bridge = new THREE.Mesh(bridgeGeo, frameMat);
    bridge.position.set(0, 1.71, 0.13);

    glassesGroup.add(lRing, lLens, rRing, rLens, bridge);

    this.parts.glasses = glassesGroup;
    this.avatarGroup.add(glassesGroup);
  }

  setShoes(shoesId) {
    if (this.parts.shoes) this.avatarGroup.remove(this.parts.shoes);

    const shoesGroup = new THREE.Group();
    let shoeColor = 0xffffff;
    let roughness = 0.4;
    let metalness = 0.1;

    if (shoesId === 'shoes_oxford_leather') {
      shoeColor = 0x3e2723;
      roughness = 0.3;
      metalness = 0.2;
    } else if (shoesId === 'shoes_beach_sandals') {
      shoeColor = 0x2563eb;
    }

    const shoeMat = new THREE.MeshStandardMaterial({ color: shoeColor, roughness, metalness });
    const shoeGeo = new THREE.BoxGeometry(0.09, 0.06, 0.22);

    const lShoe = new THREE.Mesh(shoeGeo, shoeMat);
    lShoe.position.set(-0.13, 0.03, 0.03);
    lShoe.castShadow = true;

    const rShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rShoe.position.set(0.13, 0.03, 0.03);
    rShoe.castShadow = true;

    shoesGroup.add(lShoe, rShoe);
    this.parts.shoes = shoesGroup;
    this.avatarGroup.add(shoesGroup);
  }

  // ===== 視角平滑聚焦控制 =====
  setFocus(focusType) {
    if (focusType === 'face') {
      // 放大至面部看清皮膚細節與黑框眼鏡
      this.targetCameraPos.set(0, 1.71, 0.65);
      this.targetLookAt.set(0, 1.71, 0);
    } else if (focusType === 'body') {
      // 全身居中視角
      this.targetCameraPos.set(0, 1.3, 2.8);
      this.targetLookAt.set(0, 1.0, 0);
    } else if (focusType === 'shoes') {
      // 鞋履近距特寫
      this.targetCameraPos.set(0, 0.35, 1.1);
      this.targetLookAt.set(0, 0.08, 0);
    }
  }

  toggleAutoRotate() {
    this.isAutoRotating = !this.isAutoRotating;
    this.controls.autoRotate = this.isAutoRotating;
    return this.isAutoRotating;
  }

  resetView() {
    this.setFocus('body');
  }

  setLightingPreset(preset) {
    this.currentLighting = preset;
    if (preset === 'studio') {
      this.lights.ambient.intensity = 0.7;
      this.lights.key.color.setHex(0xfffaed);
      this.lights.key.intensity = 2.0;
      this.lights.fill.color.setHex(0x8bc34a);
      this.lights.rim.color.setHex(0x40c4ff);
    } else if (preset === 'beach') {
      // 還原海灘烈日陽光
      this.lights.ambient.intensity = 0.9;
      this.lights.key.color.setHex(0xfff7d6);
      this.lights.key.intensity = 2.8;
      this.lights.fill.color.setHex(0x60a5fa);
      this.lights.rim.color.setHex(0xffedd5);
    } else if (preset === 'neon') {
      // 賽博霓虹風格
      this.lights.ambient.intensity = 0.3;
      this.lights.key.color.setHex(0xec4899);
      this.lights.key.intensity = 2.4;
      this.lights.fill.color.setHex(0x3b82f6);
      this.lights.rim.color.setHex(0x10b981);
    }
  }

  toggleSkinSSS(enabled) {
    if (!this.skinMaterial) return;
    this.skinMaterial.clearcoat = enabled ? 0.35 : 0.05;
    this.skinMaterial.roughness = enabled ? 0.38 : 0.65;
    this.skinMaterial.needsUpdate = true;
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // 相機平滑過渡 (Camera Lerp)
    this.camera.position.lerp(this.targetCameraPos, 0.06);
    this.controls.target.lerp(this.targetLookAt, 0.06);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
