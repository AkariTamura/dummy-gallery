let mainOther = {
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
            <div class="story-line-item w-full">
              <h4>{{ ep.subtitleJp }}</h4>
              <h5>{{ ep.subtitleEn }}</h5>
            </div>
          </div>

          <!-- 本文 -->
          <div
            class="story-line"
            v-for="(story, j) in ep.story"
            :key="j"
          >
            <div class="story-line-item w-full">
              <p :class="bgClass(story.style)" v-html="formatText(story.data)"></p>
            </div>
          </div>
          <hr>

        </div>
      </div>

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

    showToast() {
      this.showCopied = true
      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        this.showCopied = false
      }, 1000)
    }
  }
}
