let mainQandA = {
  template: `
      <div>
        <div class="story-contents" :id="json.id ? json.id : null">
          <h2>{{ json.titleEn }}</h2>
          <h3>{{ json.titleJp }}</h3>
  
          <!-- ep生成 -->
          <div
            class="story-ep"
            v-for="(ep, k) in json.ep"
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
            >
              <div class="story-line-item">
  
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
  
                <!-- 通常表示 -->
                <p
                  v-else
                  :class="bgClass(story.style)"
                  v-html="formatText(story.data)"
                ></p>
  
              </div>
  
              <div class="story-line-kp" v-html="formatTextKp(story.kp)"></div>
            </div>
            <hr>
  
          </div>
        </div>
      </div>
    `,

  props: {
    json: {
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
    formatText(data) {
      if (!data) return '';
      let replaced = data
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
      return data.replace(/\n/g, '<br>');
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

    showToast() {
      this.showCopied = true;
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.showCopied = false;
      }, 1000);
    },
  },
};
