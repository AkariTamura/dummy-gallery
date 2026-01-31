let headerSp = {
  template: `
  <div class="headerPage">
    <div class="headerCountents">
      <div id="headerTitle">
        DUMMY1
      </div>

      <!-- ハンバーガー -->
      <div class="hamburgerWrap">
        <div
          class="hamburger"
          :class="{ open: menuOpen }"
          @click="toggleMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- メニュー -->
    <div class="menu" :class="{ open: menuOpen }" id="pageChange">
      <a
        v-for="(item, index) in menuItems"
        :key="index"
        :href="item.href"
        :class="{ now: currentIndex === index }"
        @click.prevent="onMenuClick(item.href, index)"
      >
        {{ item.label }}
      </a>
    </div>
  </div>
  `,
  data() {
    return {
      menuOpen: false,
      currentIndex: null,
      menuItems: [
        { href: '#page-0', label: '概要' },
        { href: '#page-1', label: 'シナリオ背景' },
        { href: '#page-2', label: '導入' },
        { href: '#page-3', label: '探索' },
        { href: '#page-4', label: 'クライマックス' },
        { href: '#page-5', label: 'エンディング' },
        { href: '#page-6', label: 'あとがき' },
      ],
    };
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    onMenuClick(targetId, index) {
      const target = document.querySelector(targetId);
      if (!target) return;

      const headerHeight = parseFloat(getComputedStyle(document.documentElement).fontSize) * 5;

      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });

      this.menuOpen = false;
      this.currentIndex = index;
    },

    updateNow() {
      const sections = document.querySelectorAll('[id^="page-"]');
      const windowHeight = window.innerHeight;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();

        if (rect.top <= windowHeight * 0.5 && rect.bottom >= windowHeight * 0.5) {
          this.currentIndex = index;
        }
      });
    },
  },

  mounted() {
    window.addEventListener('scroll', this.updateNow);
    this.updateNow();
  },

  beforeUnmount() {
    window.removeEventListener('scroll', this.updateNow);
  },
};
