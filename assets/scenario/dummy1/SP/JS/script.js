let app = new Vue({
  el: "#app",
  data: {
    kpc: 'KPC',
    pc: 'PC',
    page: 0,
    menuOpen: false,
    spFlg: window.innerWidth <= 960,
  },
  components: {    
    'header-page': header,
    'main-outline': mainOutline,
    'back-story': backStory,
    'introduction': introduction,
    'search': search,
    'climax': climax,
    'main-ending': mainEnding,
    'afterword': afterWord,
    'footer-page': footer,
    'header-page-sp': headerSp,
    'main-outline-sp': mainOutlineSp,
    'back-story-sp': backStorySp,
    'introduction-sp': introductionSp,
    'search-sp': searchSp,
    'climax-sp': climaxSp,
    'main-ending-sp': mainEndingSp,
    'afterword-sp': afterWordSp,
    'footer-page-sp': footer,
  },
  mounted() {
    // 画面サイズ変更を監視
    window.addEventListener('resize', this.checkDevice);

    // 初期判定
    this.checkDevice();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkDevice);
  },
  methods: {
    kpcNameChange(name) {
      this.kpc = String(name);
    },
    pcNameChange(name) {
      this.pc = String(name);
    },
    checkDevice() {
      const isSp = window.innerWidth <= 960;

      // 値が変わったときだけ更新
      if (this.spFlg !== isSp) {
        this.spFlg = isSp;
      }
    },
    pageChange(num) {
      if (num > 6) {
        switch (num) {
          case 7:
            this.page -= 1;
            break;
          case 8:
            this.page += 1;
            break;
        }
        }else {
          this.page = num;
        }
        window.scrollTo( 0, 0);
    },
    copyParagraph(e) {
      const p = e.currentTarget.closest('p');
      if (!p) return;
      const btn = e.currentTarget;

      // ボタンを除外したクローンを作る
      const clone = p.cloneNode(true);
      clone.querySelector('.copy-btn')?.remove();

      // テキスト取得
      let text = clone.textContent || '';

      // 行ごとに分解
      let lines = text.split('\n');

      // 空行を除いた最小インデントを計算
      const indents = lines
      .filter(line => line.trim().length > 0)
      .map(line => line.match(/^(\s*)/)[0].length);

      const minIndent = indents.length ? Math.min(...indents) : 0;

      // 共通インデントを削除
      lines = lines.map(line => line.slice(minIndent));

      // 前後の空行を削除して結合
      text = lines.join('\n').trim();

      // コピー処理
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      // ボタン演出
      btn.classList.add('copied');
      btn.classList.remove('fade-back');

      setTimeout(() => {
      btn.classList.add('fade-back');
      }, 500);

      setTimeout(() => {
      btn.classList.remove('copied', 'fade-back');
      }, 1000);
    }
  }
})
