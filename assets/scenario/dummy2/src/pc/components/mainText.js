let mainText = {
  template: `
    <div>
      <div
        class="story-contents"
        v-for="(js, i) in jsonList"
        :key="i"
        :id="js.id ? js.id : null"
      >
        <h2>{{ js.titleEn }}</h2>
        <h3>{{ js.titleJp }}</h3>

        <!-- ep生成 -->
        <div
          class="story-ep"
          v-for="(ep, k) in js.ep"
          :key="k"
          :id="ep.id ? ep.id : null"
        >
          <!-- 中見出し -->
          <div class="story-line sub-title">
            <div class="story-line-item">
              <h4>{{ ep.subtitleJp }}</h4>
              <h5>{{ ep.subtitleEn }}</h5>
            </div>
            <div class="story-line-kp">
              <h4>KP情報</h4>
              <h5>Keeper’s Notes</h5>
            </div>
          </div>

          <!-- 本文 -->
          <div
            class="story-line"
            v-for="(story, j) in ep.story"
            :key="j"
            v-if="shouldShowStory(story)"
          >
            <div class="story-line-item" :id="story.id">

              <!-- styleがbranchのとき -->
              <details v-if="story.style && story.style.includes('branch')" :class="bgClass(story.style)">
                <summary>{{ story.branch }}</summary>
                <p v-html="formatText(story.data)"></p>
              </details>

              <!-- styleがinfoのとき -->
              <div v-else-if="story.style && story.style.includes('info')" class="info-contents">
                <h6 v-if="story.infoTitle">{{ story.infoTitle }}</h6>
                <p :class="bgClass(story.style)" v-html="formatText(story.data)"></p>
              </div>

              <!-- styleがho1のとき -->
              <div v-else-if="story.style && story.style.includes('ho1')" :class="bgClass(story.style)">
                <h6>HO1秘匿</h6>
                <p v-html="formatText(story.data)"></p>
              </div>

              <!-- styleがho2のとき -->
              <div v-else-if="story.style && story.style.includes('ho2')" :class="bgClass(story.style)">
                <h6>HO2秘匿</h6>
                <p v-html="formatText(story.data)"></p>
              </div>

              <!-- imgがあるとき -->
              <div v-else-if="story.img" class="img-contents">
                <img :src="story.img" alt="">
                <p v-html="formatText(story.data)"></p>
              </div>

              <!-- 通常表示 -->
              <p
                v-else
                :class="bgClass(story.style)"
                v-html="formatText(story.data)"
              ></p>

              <button class="copy-btn" @click="copyText(story.data)"></button>
            </div>

            <div class="story-line-kp" v-html="formatTextKp(story.kp)"></div>
          </div>

          <hr>
        </div>
      </div>

      <!-- コピー通知 -->
      <div v-if="showCopied" class="copy-toast">コピーしました</div>
    </div>
  `,

  props: {
    common: {
      type: Object,
      required: true,
    },
    jsonList: {
      type: Array,
      required: true,
    },
    flg: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      showCopied: false,
      timeoutId: null,
    };
  },

  methods: {
    shouldShowStory(story) {
      // story に flgT / flgF がない場合は常に表示
      if (!story.flgT && !story.flgF) return true;

      let show = true;

      // flgが存在する場合
      if (story.flgT) {
        // 空白で分割して配列にする
        const flgTArray = story.flgT.split(/\s+/);
        // どれか一つでも true なら表示
        show = flgTArray.some((flgName) => !!this.flg[flgName]);
      }

      // flgが存在しない場合
      if (story.flgF) {
        const flgFArray = story.flgF.split(/\s+/);
        // どれか一つでもfalseなら表示
        if (!flgFArray.some((flgName) => !!this.flg[flgName])) {
          show = true;
        } else {
          // すべて true なら非表示
          show = false;
        }
      }
      return show;
    },

    formatText(data) {
      if (this.common.ho1bro === undefined) {
        console.trace('ho1bro undefined');
      }
      if (!data) return '';
      let replaced = data
        .replaceAll('{ho1}', this.common.ho1)
        .replaceAll('{ho2}', this.common.ho2)
        .replaceAll('{父親}', this.common.dad)
        .replaceAll('{ho2のNPC}', this.common.ho2Npc)
        .replaceAll('{彼1}', this.common.ho1Sex)
        .replaceAll('{彼2}', this.common.ho2Sex)
        .replaceAll('{彼3}', this.common.npcSex)
        .replaceAll('{兄}', this.common.ho1bro)
        .replaceAll('{弟}', this.common.ho2bro)
        .replaceAll(/〈/g, '<span class="ep-dice">〈')
        .replaceAll(/〉/g, '〉</span>')
        .replaceAll(/《/g, '<span class="danger">')
        .replaceAll(/》/g, '</span>')
        .replaceAll(/【/g, '<h5>【')
        .replaceAll(/】/g, '】</h5>')
        .replaceAll(/〔/g, '<span class="bold">')
        .replaceAll(/〕/g, '</span>');
      return replaced.replace(/\n/g, '<br>');
    },

    formatTextKp(data) {
      if (!data) return '';
      let replaced = data
        .replaceAll(/《/g, '<span class="danger">')
        .replaceAll(/》/g, '</span>')
        .replaceAll(/〔/g, '<span class="bold">')
        .replaceAll(/〕/g, '</span>');
      return replaced.replace(/\n/g, '<br>');
    },

    bgClass(style) {
      let styleMap = '';
      if (style === undefined) {
        style = '';
      }
      if (style.includes('info')) {
        styleMap += ' ep-info';
      }
      if (style.includes('branch')) {
        styleMap += ' ep-branch';
      }
      if (style.includes('ho1')) {
        styleMap += ' ep-ho1';
      }
      if (style.includes('ho2')) {
        styleMap += ' ep-ho2';
      }
      if (style.includes('hide')) {
        styleMap += ' ep-hide';
      }
      if (style.includes('indent')) {
        styleMap += ' indent';
      }
      return styleMap || '';
    },

    copyText(data) {
      if (!data) return;

      // 変数展開・タグ置換など
      let replaced = data
        .replaceAll('{ho1}', this.common.ho1)
        .replaceAll('{ho2}', this.common.ho2)
        .replaceAll('{父親}', this.common.dad)
        .replaceAll('{ho2のNPC}', this.common.ho2Npc)
        .replaceAll('{彼1}', this.common.ho1Sex)
        .replaceAll('{彼2}', this.common.ho2Sex)
        .replaceAll('{彼3}', this.common.npcSex)
        .replaceAll('{兄}', this.common.ho1bro)
        .replaceAll('{弟}', this.common.ho2bro)
        .replaceAll(/《/g, '')
        .replaceAll(/》/g, '')
        .replaceAll(/〔/g, '')
        .replaceAll(/〕/g, '');

      const temp = document.createElement('div');
      temp.innerHTML = replaced;
      // <a>タグ → テキストに変換
      temp.querySelectorAll('a').forEach((a) => {
        a.replaceWith(document.createTextNode(a.textContent));
      });
      // <br>タグ → 改行に変換
      temp.querySelectorAll('br').forEach((br) => {
        br.replaceWith('\n');
      });
      // プレーンテキストとして抽出
      const plainText = temp.textContent
        .replace(/\u00A0/g, ' ') // &nbsp; → 半角スペース
        .replace(/\s+\n/g, '\n') // 改行周りの余計な空白を削除
        .trim();

      navigator.clipboard
        .writeText(plainText)
        .then(() => this.showToast())
        .catch((err) => console.error('コピーに失敗しました:', err));
    },

    showToast() {
      this.showCopied = true;
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.showCopied = false;
      }, 1000);
    },
  },
};
