let header = {
  template: `<div class="headerPage">
    <div class="headerCountents">
      <div id="headerTitle">
        DUMMY1
      </div>
      <div id="pageChange">
        <span v-bind:class="{ now: page===0 }" @click="pageChange(0)">概要</span> | <span v-bind:class="{ now: page===1}" @click="pageChange(1)">シナリオ背景</span> | <span v-bind:class="{ now: page===2}" @click="pageChange(2)">導入</span> | <span v-bind:class="{ now: page===3}" @click="pageChange(3)">探索</span> | <span v-bind:class="{ now: page===4}" @click="pageChange(4)">クライマックス</span> | <span v-bind:class="{ now: page===5}" @click="pageChange(5)">エンディング</span> | <span v-bind:class="{ now: page===6}" @click="pageChange(6)">あとがき</span>
      </div>
    </div>
  </div>`,
  props: {
    page: {
      type: Number,
    },
  },
  methods: {
    pageChange(num) {
      this.$emit('page-change', num);
    },
  },
};
