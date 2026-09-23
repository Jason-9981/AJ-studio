import { AvatarScene } from './avatar3d.js';

// 資產庫配置 (四大分類與樣式細分)
const ASSET_LIBRARY = {
  hair: [
    { id: 'hair_short', name: '影片同款短碎髮', icon: 'fa-feather', desc: '衝浪微濕清爽短髮' },
    { id: 'hair_wavy', name: '雅痞微卷中髮', icon: 'fa-wind', desc: '層次感蓬鬆捲髮' },
    { id: 'hair_pompadour', name: '復古側分背頭', icon: 'fa-user-tie', desc: '俐落油頭造型' },
  ],
  outfit: [
    // 現代新潮
    { id: 'outfit_surf_trunks', name: '衝浪黑泳褲 (影片款)', style: 'modern', icon: 'fa-water', desc: '海灘速乾專業泳褲' },
    { id: 'outfit_modern_suit', name: '深藍修身休閒西裝', style: 'modern', icon: 'fa-vest', desc: '現代都會商務風格' },
    // 經典復古
    { id: 'outfit_vintage_jacket', name: '美式復古工裝外套', style: 'classic', icon: 'fa-shield', desc: '重磅耐磨硬漢工裝' },
  ],
  glasses: [
    { id: 'glasses_black_frame', name: '經典黑框眼鏡 (影片款)', icon: 'fa-glasses', desc: '主角同款標誌性方框' },
    { id: 'glasses_gold_rim', name: '復古金絲無框鏡', icon: 'fa-glasses', desc: '斯文高質感細框' },
    { id: 'glasses_none', name: '摘下眼鏡', icon: 'fa-eye', desc: '無配飾原生面容' },
  ],
  shoes: [
    { id: 'shoes_sneakers_white', name: '極簡百搭白波鞋', type: 'sneakers', icon: 'fa-shoe-prints', desc: '透氣休閒運動鞋' },
    { id: 'shoes_oxford_leather', name: '英倫牛津手工皮鞋', type: 'leather', icon: 'fa-shoe-prints', desc: '商務正裝深棕真皮' },
    { id: 'shoes_beach_sandals', name: '陽光沙灘人字拖', type: 'sneakers', icon: 'fa-sun', desc: '海濱漫步必備' },
  ],
};

// 狀態管理
let activeCategory = 'outfit';
let activeOutfitStyle = 'all';
let activeShoeType = 'all';
let currentWardrobe = {
  hair: 'hair_short',
  outfit: 'outfit_surf_trunks',
  glasses: 'glasses_black_frame',
  shoes: 'shoes_sneakers_white',
};

// 影片資料 (包含使用者上傳的兩條影片參照)
const VIDEO_DATABASE = {
  vid1: {
    title: '影片 1: 衝浪動態與肌肉細節',
    tag: '檔案: 1000188533.mp4 | 衝浪動態/水滴皮膚/微距臉部',
    url: 'assets/videos/1000188533.mp4',
  },
  vid2: {
    title: '影片 2: Show Time 完整海灘情境',
    tag: '檔案: 1000188535.mp4 | Show Time 劇情感恩 / "Can I ask you out for dinner tonight?"',
    url: 'assets/videos/1000188535.mp4',
  },
};

let currentVideoKey = 'vid1';

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化 3D 數位人引擎
  const avatar = new AvatarScene('canvas-container');

  // 2. 視角按鈕監聽
  document.getElementById('btn-focus-face').addEventListener('click', (e) => {
    updateFocusButtons(e.currentTarget);
    avatar.setFocus('face');
  });
  document.getElementById('btn-focus-body').addEventListener('click', (e) => {
    updateFocusButtons(e.currentTarget);
    avatar.setFocus('body');
  });
  document.getElementById('btn-focus-shoes').addEventListener('click', (e) => {
    updateFocusButtons(e.currentTarget);
    avatar.setFocus('shoes');
  });

  function updateFocusButtons(activeBtn) {
    document.querySelectorAll('#btn-focus-face, #btn-focus-body, #btn-focus-shoes').forEach((btn) => {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow');
      btn.classList.add('text-neutral-300');
    });
    activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow');
    activeBtn.classList.remove('text-neutral-300');
  }

  // 3. 懸浮按鈕：自動旋轉、重設視角、燈光切換
  const btnRotate = document.getElementById('btn-toggle-rotate');
  btnRotate.addEventListener('click', () => {
    const isRotating = avatar.toggleAutoRotate();
    btnRotate.querySelector('span').textContent = `自動旋轉: ${isRotating ? '開' : '關'}`;
  });

  document.getElementById('btn-reset-view').addEventListener('click', () => {
    avatar.resetView();
    updateFocusButtons(document.getElementById('btn-focus-body'));
  });

  const lightingPresets = ['studio', 'beach', 'neon'];
  const lightingNames = { studio: '攝影棚燈光', beach: '海灘陽光', neon: '賽博霓虹' };
  let currentLightIdx = 0;
  document.getElementById('btn-toggle-lighting').addEventListener('click', () => {
    currentLightIdx = (currentLightIdx + 1) % lightingPresets.length;
    const nextPreset = lightingPresets[currentLightIdx];
    avatar.setLightingPreset(nextPreset);
    document.getElementById('lighting-label').textContent = lightingNames[nextPreset];
  });

  // 4. 次表面散射水光感開關
  document.getElementById('toggle-sss').addEventListener('change', (e) => {
    avatar.toggleSkinSSS(e.target.checked);
  });

  // 5. 截圖匯出功能
  document.getElementById('btn-export-image').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `AJ-Studio-Avatar-${Date.now()}.png`;
    link.href = avatar.renderer.domElement.toDataURL('image/png');
    link.click();
  });

  // 6. 側邊欄分類標籤切換
  document.querySelectorAll('.category-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.category-tab').forEach((t) => {
        t.classList.remove('bg-blue-600', 'text-white', 'shadow');
        t.classList.add('text-neutral-400');
      });
      tab.classList.add('bg-blue-600', 'text-white', 'shadow');
      tab.classList.remove('text-neutral-400');

      activeCategory = tab.getAttribute('data-category');
      renderSubFilters();
      renderAssetGrid();
    });
  });

  // 7. 渲染子分類篩選 (新舊風格 / 波鞋皮鞋)
  function renderSubFilters() {
    const container = document.getElementById('sub-filter-buttons');
    const title = document.getElementById('sub-filter-title');
    container.innerHTML = '';

    if (activeCategory === 'outfit') {
      title.textContent = '服飾風格切換：';
      const styles = [
        { key: 'all', label: '全部' },
        { key: 'modern', label: '現代新潮' },
        { key: 'classic', label: '經典復古' },
      ];
      styles.forEach((st) => {
        const btn = document.createElement('button');
        btn.className = `px-2 py-1 rounded transition text-xs ${activeOutfitStyle === st.key ? 'bg-blue-600 text-white font-medium' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`;
        btn.textContent = st.label;
        btn.addEventListener('click', () => {
          activeOutfitStyle = st.key;
          renderSubFilters();
          renderAssetGrid();
        });
        container.appendChild(btn);
      });
    } else if (activeCategory === 'shoes') {
      title.textContent = '鞋履種類篩選：';
      const types = [
        { key: 'all', label: '全部' },
        { key: 'sneakers', label: '波鞋/休閒' },
        { key: 'leather', label: '皮鞋/正裝' },
      ];
      types.forEach((tp) => {
        const btn = document.createElement('button');
        btn.className = `px-2 py-1 rounded transition text-xs ${activeShoeType === tp.key ? 'bg-blue-600 text-white font-medium' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`;
        btn.textContent = tp.label;
        btn.addEventListener('click', () => {
          activeShoeType = tp.key;
          renderSubFilters();
          renderAssetGrid();
        });
        container.appendChild(btn);
      });
    } else {
      title.textContent = `${activeCategory === 'hair' ? '髮型庫選擇' : '眼鏡配飾庫'} (即選即套用)`;
    }
  }

  // 8. 渲染資產網格
  function renderAssetGrid() {
    const grid = document.getElementById('asset-grid');
    grid.innerHTML = '';

    let list = ASSET_LIBRARY[activeCategory] || [];
    if (activeCategory === 'outfit' && activeOutfitStyle !== 'all') {
      list = list.filter((item) => item.style === activeOutfitStyle);
    }
    if (activeCategory === 'shoes' && activeShoeType !== 'all') {
      list = list.filter((item) => item.type === activeShoeType);
    }

    list.forEach((item) => {
      const isSelected = currentWardrobe[activeCategory] === item.id;
      const card = document.createElement('div');
      card.className = `cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-between text-center transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/10'
          : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/60'
      }`;

      card.innerHTML = `
        <div class="w-14 h-14 rounded-lg ${isSelected ? 'bg-blue-600/20 text-blue-400' : 'bg-neutral-800 text-neutral-400'} flex items-center justify-center text-xl mb-2">
          <i class="fa-solid ${item.icon}"></i>
        </div>
        <div class="text-xs font-semibold text-neutral-200">${item.name}</div>
        <div class="text-[10px] text-neutral-500 mt-1">${item.desc}</div>
      `;

      card.addEventListener('click', () => {
        currentWardrobe[activeCategory] = item.id;
        if (activeCategory === 'hair') avatar.setHair(item.id);
        if (activeCategory === 'outfit') avatar.setOutfit(item.id);
        if (activeCategory === 'glasses') avatar.setGlasses(item.id);
        if (activeCategory === 'shoes') avatar.setShoes(item.id);
        renderAssetGrid();
      });

      grid.appendChild(card);
    });
  }

  renderSubFilters();
  renderAssetGrid();

  // 9. 影片與 AI 重建彈窗交互
  const modal = document.getElementById('video-modal');
  const videoElem = document.getElementById('reference-video');
  const videoTag = document.getElementById('video-tag');

  document.getElementById('btn-open-video-modal').addEventListener('click', () => {
    modal.classList.remove('hidden');
    loadVideo(currentVideoKey);
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    videoElem.pause();
  };

  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-close-modal-footer').addEventListener('click', closeModal);

  function loadVideo(key) {
    currentVideoKey = key;
    const vidInfo = VIDEO_DATABASE[key];
    videoElem.src = vidInfo.url;
    videoTag.textContent = vidInfo.tag;

    document.getElementById('btn-vid-1').className = `px-3 py-1.5 rounded-lg text-xs font-medium transition ${
      key === 'vid1' ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
    }`;
    document.getElementById('btn-vid-2').className = `px-3 py-1.5 rounded-lg text-xs font-medium transition ${
      key === 'vid2' ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
    }`;
  }

  document.getElementById('btn-vid-1').addEventListener('click', () => loadVideo('vid1'));
  document.getElementById('btn-vid-2').addEventListener('click', () => loadVideo('vid2'));

  // 本地影片上傳預覽
  document.getElementById('local-video-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      videoElem.src = url;
      videoTag.textContent = `本地自訂影片: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
    }
  });

  // 10. AI 3DGS 重建模擬排程
  const btnReconstruct = document.getElementById('btn-start-ai-reconstruct');
  const progressBox = document.getElementById('ai-progress-box');
  const progressBar = document.getElementById('ai-progress-bar');
  const progressPercent = document.getElementById('ai-progress-percent');
  const statusText = document.getElementById('ai-status-text');

  btnReconstruct.addEventListener('click', () => {
    btnReconstruct.disabled = true;
    progressBox.classList.remove('hidden');
    let pct = 0;

    const stages = [
      { at: 15, text: '影像影格抽樣與特徵點匹配 (COLMAP)...' },
      { at: 40, text: '相機外參估計與點雲初始化...' },
      { at: 70, text: '3D Gaussian Splatting 高斯橢球最佳化...' },
      { at: 90, text: '人體骨架裝配與服裝網格拓撲校正...' },
      { at: 100, text: '重建完成！已自動同步至 3D 檢視器。' },
    ];

    const timer = setInterval(() => {
      pct += 4;
      if (pct > 100) pct = 100;

      progressBar.style.width = `${pct}%`;
      progressPercent.textContent = `${pct}%`;

      const curStage = stages.find((s) => pct <= s.at);
      if (curStage) statusText.textContent = curStage.text;

      if (pct >= 100) {
        clearInterval(timer);
        btnReconstruct.disabled = false;
        // 重建完成自動切換至面部微距視角檢視
        setTimeout(() => {
          closeModal();
          avatar.setFocus('face');
          updateFocusButtons(document.getElementById('btn-focus-face'));
        }, 1200);
      }
    }, 150);
  });
});
