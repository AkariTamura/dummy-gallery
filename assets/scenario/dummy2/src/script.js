let app = new Vue({
  el: '#app',
  data: {
    common: {
      ho1: 'HO1',
      ho2: 'HO2',
      ho1Sex: '彼',
      ho2Sex: '彼',
      dad: '父親',
      ho2Npc: 'HO2の大事な人',
      npcSex: '彼',
      ho1bro: '兄',
      ho2bro: '弟',
    },
    flg: {
      flg1: false,
      flg2: false,
      flg3: false,
      flg4: 4,
    },
    sp: {
      menuOpen: false,
      naviOpen: false,
      toolOpen: false,
      spFlg: window.innerWidth <= 960,
    },
  },
  components: {
    navigation: navigation,
    'navigation-sp': navigationSp,
    'main-outline': mainOutLine,
    'main-outline-sp': mainOutLineSp,
    'main-info': mainInfo,
    'main-info-sp': mainInfoSp,
    'main-text': mainText,
    'main-text-sp': mainTextSp,
    'main-q-and-a': mainQandA,
    'main-q-and-a-sp': mainQandASp,
    'main-other': mainOther,
    'main-other-sp': mainOtherSp,
    helper: helper,
    'helper-sp': helperSp,
    outLine: outLine,
    info: info,
    ep00: ep00,
    ep01: ep01,
    ep02: ep02,
    ep03: ep03,
    ep04: ep04,
    other: other,
    qAndA: qAndA,
    naviMenu: naviMenu,
  },
  mounted() {
    // ページ読み込み時にlocalStorageから読み込む
    const savedCommon = localStorage.getItem('common');
    if (savedCommon) {
      try {
        this.common = JSON.parse(savedCommon);
      } catch (e) {
        console.error('変換データの読み込みに失敗しました:', e);
      }
    }
    const savedFlg = localStorage.getItem('flg');
    if (savedFlg) {
      try {
        this.flg = JSON.parse(savedFlg);
      } catch (e) {
        console.error('フラグの読み込みに失敗しました:', e);
      }
    }

    // 値が変わったら自動で保存
    this.$watch(
      'common',
      (newVal) => {
        localStorage.setItem('common', JSON.stringify(newVal));
      },
      { deep: true }
    );
    this.$watch(
      'flg',
      (newVal) => {
        localStorage.setItem('flg', JSON.stringify(newVal));
      },
      { deep: true }
    );

    // 画面サイズ変更を監視
    window.addEventListener('resize', this.checkDevice);

    // 初期判定
    this.checkDevice();
  },
  methods: {
    valueChange(key, val) {
      switch (key) {
        case 'ho1':
          this.common.ho1 = String(val);
          break;
        case 'ho2':
          this.common.ho2 = String(val);
          break;
        case 'ho1Sex':
          this.common.ho1Sex = String(val);
          if (this.common.ho1Sex === '彼') {
            this.common.ho1bro = '兄';
          } else {
            this.common.ho1bro = '姉';
          }
          break;
        case 'ho2Sex':
          this.common.ho2Sex = String(val);
          if (this.common.ho2Sex === '彼') {
            this.common.ho2bro = '弟';
          } else {
            this.common.ho2bro = '妹';
          }
          break;
        case 'dad':
          this.common.dad = String(val);
          break;
        case 'ho2Npc':
          this.common.ho2Npc = String(val);
          break;
        case 'npcSex':
          this.common.npcSex = String(val);
          break;
        case 'reset':
          this.common = {
            ho1: 'HO1',
            ho2: 'HO2',
            ho1Sex: '彼',
            ho2Sex: '彼',
            dad: '父親',
            ho2Npc: 'HO2の大事な人',
            npcSex: '彼',
            ho1bro: '兄',
            ho2bro: '弟',
          };
          break;
        case 'resetFlg':
          this.flg = {
            flg1: false,
            flg2: false,
            flg3: false,
            flg4: 4,
          };
          break;
        case 'flg1':
          this.flg.flg1 = Boolean(val);
          break;
        case 'flg2':
          this.flg.flg2 = Boolean(val);
          break;
        case 'flg3':
          this.flg.flg3 = Boolean(val);
          break;
        case 'flg4':
          this.flg.flg4 = Number(val);
          break;
      }
    },
    checkDevice() {
      const isSp = window.innerWidth <= 960;
      // 値が変わったときだけ更新
      if (this.sp.spFlg !== isSp) {
        this.sp.spFlg = isSp;
      }
      // vhを変更
      this.setVh();
    },
    toggleMenu() {
      this.sp.menuOpen = !this.sp.menuOpen;
      this.sp.naviOpen = false;
      this.sp.toolOpen = false;
    },
    toggleNavi() {
      this.sp.naviOpen = !this.sp.naviOpen;
      this.sp.toolOpen = false;
    },
    toggleTool() {
      this.sp.toolOpen = !this.sp.toolOpen;
      this.sp.naviOpen = false;
    },
    setVh() {
      const vh = window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    },
  },
});
