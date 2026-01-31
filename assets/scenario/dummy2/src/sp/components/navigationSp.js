let navigationSp = {
    template: `
      <div id="navi">
        <nav class="navi-contents">
          <div class="navi-contents-item index">
            <ul>
              <li
                v-for="(menu, index) in menus"
                :key="index"
                :style="{ zIndex: index + 11 }"
                :class="{ 'is-active': activeMenu === index }"
              >
                <div class="menu-title" @click="toggleMenu(index)" v-html="coloredTitle(menu.title)"></div>
  
                <!-- 第1層 -->
                <transition @enter="enter" @leave="leave">
                  <ul v-show="activeMenu === index" class="sub-menu">
                    <li
                      v-for="(item, subIndex) in menu.subItems"
                      :key="subIndex"
                      :class="{ 'is-active': activeSubMenu === subIndex && activeMenu === index }"
                    >
                      <div
                        v-if="item.item"
                        class="menu-subtitle"
                        @click="toggleSubMenu(index, subIndex)"
                      >
                        {{ item.label }}
                      </div>
  
                      <a
                        v-else
                        :href="item.url"
                      >{{ item.label }}</a>
  
                      <!-- 第2層 -->
                      <transition @enter="enter" @leave="leave">
                        <ul
                          v-if="item.item"
                          v-show="activeMenu === index && activeSubMenu === subIndex"
                          class="sub-sub-menu"
                          :style="{ zIndex: subIndex + 1 }"
                        > 
                          <li v-for="(subItem, subSubIndex) in item.item" :key="subSubIndex">
                            <a :href="subItem.url">{{ subItem.subLabel }}</a>
                          </li>
                        </ul>
                      </transition>
                    </li>
                  </ul>
                </transition>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    `,
    data() {
      return {
        menus: [],
        activeMenu: null,
        activeSubMenu: null
      };
    },
    methods: {
      toggleMenu(index) {
        // 第1層切替
        this.activeMenu = this.activeMenu === index ? null : index;
        this.activeSubMenu = null;
      
        this.$nextTick(() => {
          // 現在の activeMenu に対応する sub-menu だけでなく、全ての sub-menu の li をリセット
          const allSubMenus = this.$el.querySelectorAll('.sub-menu');
          allSubMenus.forEach(subMenu => {
            Array.from(subMenu.children).forEach(li => {
              li.style.display = ''; // display を初期化
            });
          });
        });
      },
      
      toggleSubMenu(index, subIndex) {
        if (this.activeMenu !== index) {
          // 第1層切り替え
          this.activeMenu = index;
          this.activeSubMenu = subIndex;
        } else {
          // 第2層トグル
          this.activeSubMenu =
            this.activeSubMenu === subIndex ? null : subIndex;
        }
      
        this.$nextTick(() => {
          const subMenu = this.$el.querySelectorAll('.sub-menu')[index];
          if (!subMenu) return;
      
          Array.from(subMenu.children).forEach(li => {
            // 第2層 li のみ操作
            if (!li.classList.contains('is-active')) {
              // 第2層トグルが閉じられた場合は display を戻す
              if (this.activeSubMenu === null) {
                li.style.display = '';
              } else {
                li.style.display = 'none';
              }
            } else {
              li.style.display = ''; // is-active は常に表示
            }
          });
        });
      },      
      enter(el) {
        const isSecondLayer = el.classList.contains('sub-sub-menu');
      
        if (!isSecondLayer) {
          el.style.maxHeight = '0px';
          requestAnimationFrame(() => {
            el.style.transition = 'max-height 0.5s ease-in-out';
            el.style.maxHeight = el.scrollHeight + 'px';
          });
          return;
        }
      
        const parentSubMenu = el.closest('.sub-menu');
        if (!parentSubMenu) return;
      
        el.style.maxHeight = '0px';
        requestAnimationFrame(() => {
          el.style.transition = 'max-height 0.5s ease-in-out';
          el.style.maxHeight = el.scrollHeight + 'px';
        });
      
        requestAnimationFrame(() => {
          let totalHeight = 0;
          const subItems = parentSubMenu.children;
          for (const item of subItems) {
            totalHeight += item.scrollHeight;
          }
      
          parentSubMenu.style.transition = 'max-height 0.5s ease-in-out';
          parentSubMenu.style.maxHeight = totalHeight + 'px';
        });
      },
      leave(el) {
        const isSecondLayer = el.classList.contains('sub-sub-menu');
        const parentSubMenu = el.closest('.sub-menu');
      
        el.style.maxHeight = el.scrollHeight + 'px';
        void el.offsetHeight;
        el.style.transition = 'max-height 0.3s ease-out';
        requestAnimationFrame(() => {
          el.style.maxHeight = '0px';
        });
      
        if (isSecondLayer && parentSubMenu) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              let totalHeight = 0;
              const subItems = parentSubMenu.children;
      
              for (const item of subItems) {
                if (getComputedStyle(item).display !== 'none') {
                  totalHeight += item.scrollHeight;
                }
              }
      
              parentSubMenu.style.transition = 'max-height 0.3s ease-out';
              parentSubMenu.style.maxHeight = totalHeight + 'px';
            }, 300); 
          });
        }
      },      
      coloredTitle(title) {
        if (!title) return "";
        const main = title.slice(0, -1);
        const last = title.slice(-1);
        return `${main}<span class="menu-title-last">${last}</span>`;
      }
    },
    mounted() {
      if (typeof naviMenu !== 'undefined') {
        this.menus = naviMenu;
      }
    }
  };
  