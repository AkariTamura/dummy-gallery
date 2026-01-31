let mainInfo = {
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
    json: {
      type: Object,
      required: true
    },
  },

  data() {
    return {
      showCopied: false,
      timeoutId: null
    }
  },

  methods: {
    formatText(data) {
      if (!data) return ''
      let replaced = data
      .replaceAll(/〈/g, '<span class="ep-dice">〈')
      .replaceAll(/〉/g, '〉</span>')
      .replaceAll(/《/g, '<span class="danger">')
      .replaceAll(/》/g, '</span>')
      .replaceAll(/【/g, '<h5>【')
      .replaceAll(/】/g, '】</h5>')
      .replaceAll(/〔/g, '<span class="bold">')
      .replaceAll(/〕/g, '</span>')
      return replaced.replace(/\n/g, '<br>')
    },

    formatTextKp(data) {
      if (!data) return ''
      return data.replace(/\n/g, '<br>')
    },

    bgClass(style) {
      let styleMap = ""
      if(style === undefined){
        style = ""
      }
      if(style.includes("info")){
        styleMap += " ep-info"
      }
      if(style.includes("branch")){
        styleMap += " ep-branch"
      }
      if(style.includes("ho1")){
        styleMap += " ep-ho1"
      }
      if(style.includes("ho2")){
        styleMap += " ep-ho2"
      }
      if(style.includes("hide")){
        styleMap += " ep-hide"
      }
      if(style.includes("indent")){
        styleMap += " indent"
      }
      return styleMap || ''
    },

    copyText(data) {
      if (!data) return
      let replaced = data
      .replaceAll(/《/g, '')
      .replaceAll(/》/g, '')
      .replaceAll(/〔/g, '')
      .replaceAll(/〕/g, '')
      navigator.clipboard.writeText(replaced)
        .then(() => this.showToast())
        .catch(err => console.error('コピーに失敗しました:', err))
    },

    showToast() {
      this.showCopied = true
      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        this.showCopied = false
      }, 1000)
    }
  }
}
