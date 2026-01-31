let helperSp = {
    template:  `
      <div id="helper">
        <div class="helper_items">
            <h3>便利機能各種</h3>
            <div class="helper_item un-select">
                <h4 class="helper_item_title">取り扱い説明</h4>
                <div class="helper_item_contents">
                    <p>
                        本文右横のアイコン<span></span>をクリックすることで、文章を丸ごとコピーできます。<br>
                        <br>
                        【名前変換】で本文中の表示名を変換できます。<br>
                        変換した表示名はブラウザを閉じても保持されます。<br>
                        <br>
                        【フラグ管理】で入力したフラグがエンディングの分岐に反映されます。<br><br>
                    </p>
                </div>
            </div>
                        <div class="helper_item un-select">
                <h4 class="helper_item_title">名前変換</h4>
                <div class="helper_item_contents">
                    デモページのため省略
                </div>
            </div>
            <div class="helper_item un-select">
                <h4 class="helper_item_title">フラグ管理</h4>
                <div class="helper_item_contents">
                    デモページのため省略
                </div>
            </div>
        </div>
      </div>
      `,
    props: {
        common: {
            type: Object,
            required: true
        },
        flg: {
            type: Object,
            required: true
        }
    },
    mounted() {
        //アコーディオンメニュー
        const items = this.$el.querySelectorAll('.helper_item');
        items.forEach(item => {
          const title = item.querySelector('.helper_item_title');
          const content = item.querySelector('.helper_item_contents');
      
          title.addEventListener('click', () => {
            const isActive = item.classList.contains('is-active');
      
            // 現在開いている.is-active要素を探す
            const activeItem = this.$el.querySelector('.helper_item.is-active');
      
            // 閉じる処理の共通関数
            const closeItem = (targetItem) => {
              if (!targetItem) return;
              const targetContent = targetItem.querySelector('.helper_item_contents');
              const height = targetContent.scrollHeight;
              targetContent.style.maxHeight = height + 'px';
              requestAnimationFrame(() => {
                targetContent.style.maxHeight = '0px';
              });
              targetItem.classList.remove('is-active');
            };
      
            if (isActive) {
              // 自分が開いている場合は閉じる
              closeItem(item);
            } else {
              // 他に開いているものがあれば閉じる
              if (activeItem && activeItem !== item) {
                closeItem(activeItem);
              }
              // 自分を開く
              const height = content.scrollHeight;
              content.style.maxHeight = height + 'px';
              item.classList.add('is-active');
      
              // アニメーション
              content.addEventListener('transitionend', function handler() {
                if (item.classList.contains('is-active')) {
                  content.style.maxHeight = 'none';
                }
                content.removeEventListener('transitionend', handler);
              });
            }
          });
        });
        this.setValue('reset');
        this.setValue('resetFlg');
      },          
    methods:{
        valueChange(key) {
            switch(key){
                case "ho1Name":
                    if (typeof ho1Name === 'undefined' || !ho1Name?.value) return;
                    this.$emit("value-change", "ho1", ho1Name.value);
                    break;
                case "ho2Name":
                    if (typeof ho2Name === 'undefined' || !ho2Name?.value) return;
                    this.$emit("value-change", "ho2", ho2Name.value);
                    break;
                case "dadName":
                    if (typeof dadName === 'undefined' || !dadName?.value) return;
                    this.$emit("value-change", "dad", dadName.value);
                    break;
                case "ho2Npc":
                    if (typeof ho2Npc === 'undefined' || !ho2Npc?.value) return;
                    this.$emit("value-change", "ho2Npc", ho2Npc.value);
                    break;
                case "ho1Sex":
                    const ho1SexEl = this.$el.querySelector('input[name="ho1Sex"]:checked');
                    if (!ho1SexEl) return;
                    if(ho1SexEl.value === "true"){
                        this.$emit("value-change", "ho1Sex", "彼")
                    }else{
                        this.$emit("value-change", "ho1Sex", "彼女")
                    }
                    break;
                case "ho2Sex":
                    const ho2SexEl = this.$el.querySelector('input[name="ho2Sex"]:checked');
                    if (!ho2SexEl) return;
                    if(ho2SexEl.value === "true"){
                        this.$emit("value-change", "ho2Sex", "彼")
                    }else{
                        this.$emit("value-change", "ho2Sex", "彼女")
                    }
                    break;
                case "npcSex":
                    const npcSexEl = this.$el.querySelector('input[name="npcSex"]:checked');
                    if (!npcSexEl) return;
                    if(npcSexEl.value === "true"){
                        this.$emit("value-change", "npcSex", "彼")
                    }else{
                        this.$emit("value-change", "npcSex", "彼女")
                    }
                    break;
                case "reset":
                    this.$emit("value-change", "reset", "reset");
                    this.setValue('reset');
                    break;
                case "flg1":
                    const flg1El = this.$el.querySelector('input[name="flg1"]:checked');
                    if (!flg1El) return;
                    if(flg1El.value === 'true'){
                        this.$emit("value-change", "flg1", true)
                    }else{
                        this.$emit("value-change", "flg1", false)
                    }
                    break;
                case "flg2":
                    const flg2El = this.$el.querySelector('input[name="flg2"]:checked');
                    if (!flg2El) return;
                    if(flg2El.value === 'true'){
                        this.$emit("value-change", "flg2", true)
                    }else{
                        this.$emit("value-change", "flg2", false)
                    }
                    break;
                case "flg3":
                    const flg3El = this.$el.querySelector('input[name="flg3"]:checked');
                    if (!flg3El) return;
                    if(flg3El.value === 'true'){
                        this.$emit("value-change", "flg3", true)
                    }else{
                        this.$emit("value-change", "flg3", false)
                    }
                    break;
                case "flg4-1":
                    const flg4Input = this.$el.querySelector('#flg4');
                    if (!flg4Input) return;
                    if(Number(flg4Input.value) === 0){
                        //弾数下限のため処理なし
                    }else{
                        this.$emit("value-change", "flg4", Number(flg4Input.value)-1)
                        this.setValue('flgCount');
                    }
                    break;
                case "flg4-2":
                    const flg4InputPlus = this.$el.querySelector('#flg4');
                    if (!flg4InputPlus) return;
                    if(Number(flg4InputPlus.value) === 4){
                        //弾数上限のため処理なし
                    }else{
                        this.$emit("value-change", "flg4", Number(flg4InputPlus.value)+1)
                        this.setValue('flgCount');
                    }
                    break;
                case "resetFlg":
                    this.$emit("value-change", "resetFlg", "resetFlg");
                    this.setValue('resetFlg');
                    break;
            }
        },
        async setValue(target){
            const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
            await sleep(100);
            switch(target){
                case "reset":
                    //初期値設定
                    if (typeof ho1Name !== 'undefined' && ho1Name?.value !== undefined) {
                        ho1Name.value = this.common.ho1;
                    }
                    if (typeof ho2Name !== 'undefined' && ho2Name?.value !== undefined) {
                        ho2Name.value = this.common.ho2;
                    }
                    if (typeof dadName !== 'undefined' && dadName?.value !== undefined) {
                        dadName.value = this.common.dad;
                    }
                    if (typeof ho2Npc !== 'undefined' && ho2Npc?.value !== undefined) {
                        ho2Npc.value = this.common.ho2Npc;
                    }
                    const ho1Sex1 = this.$el.querySelector('#ho1Sex1');
                    const ho1Sex2 = this.$el.querySelector('#ho1Sex2');
                    if (this.common.ho1Sex === "彼") {
                        if (ho1Sex1) ho1Sex1.checked = true;
                    } else {
                        if (ho1Sex2) ho1Sex2.checked = true;
                    }
                    const ho2Sex1 = this.$el.querySelector('#ho2Sex1');
                    const ho2Sex2 = this.$el.querySelector('#ho2Sex2');
                    if (this.common.ho2Sex === "彼") {
                        if (ho2Sex1) ho2Sex1.checked = true;
                    } else {
                        if (ho2Sex2) ho2Sex2.checked = true;
                    }
                    const npcSex1 = this.$el.querySelector('#npcSex1');
                    const npcSex2 = this.$el.querySelector('#npcSex2');
                    if (this.common.npcSex === "彼") {
                        if (npcSex1) npcSex1.checked = true;
                    } else {
                        if (npcSex2) npcSex2.checked = true;
                    }
                    break;
                case "resetFlg":
                    //フラグ初期値設定
                    const flg1_1 = this.$el.querySelector('#flg1-1');
                    const flg1_2 = this.$el.querySelector('#flg1-2');
                    if (this.flg.flg1 === true) {
                        if (flg1_1) flg1_1.checked = true;
                    } else {
                        if (flg1_2) flg1_2.checked = true;
                    }
                    const flg2_1 = this.$el.querySelector('#flg2-1');
                    const flg2_2 = this.$el.querySelector('#flg2-2');
                    if (this.flg.flg2 === true) {
                        if (flg2_1) flg2_1.checked = true;
                    } else {
                        if (flg2_2) flg2_2.checked = true;
                    }
                    const flg3_1 = this.$el.querySelector('#flg3-1');
                    const flg3_2 = this.$el.querySelector('#flg3-2');
                    if (this.flg.flg3 === true) {
                        if (flg3_1) flg3_1.checked = true;
                    } else {
                        if (flg3_2) flg3_2.checked = true;
                    }
                    const flg4 = this.$el.querySelector('#flg4');
                    if (flg4) flg4.value = this.flg.flg4;
                    break;
                case "flgCount":
                    const flg4Count = this.$el.querySelector('#flg4');
                    if (flg4Count) flg4Count.value = this.flg.flg4;
                    break;
            }
        }
    }
  }