import { createRouter, createWebHistory } from 'vue-router';
import Top from '@/src/views/Top.vue';
import Profile from '@/src/views/Profile.vue';
import Character from '@/src/views/Character.vue';
import CharacterList from '@/src/components/character/CharacterList.vue';
import CharacterDetail from '@/src/components/character/CharacterDetail.vue';
import Illust from '@/src/views/Illust.vue';
import IllustList from '@/src/components/illust/IllustList.vue';
import IllustDetail from '@/src/components/illust/IllustDetail.vue';
import Login from '@/src/views/Login.vue';
import Admin from '@/src/views/Admin.vue';
import AdminIllustList from '@/src/components/admin/AdminIllustList.vue';
import AdminIllustUpload from '@/src/components/admin/AdminIllustUpload.vue';
import AdminInvestigators from '@/src/components/admin/AdminInvestigators.vue';
import AdminInvestigatorEntry from '@/src/components/admin/AdminInvestigatorEntry.vue';
import { check } from '@/util/api.js';

const routes = [
  { path: '/', component: Top },
  { path: '/profile', component: Profile },
  {
    path: '/character',
    component: Character,
    children: [
      { path: '', component: CharacterList },
      { path: 'view/:id', component: CharacterDetail },
    ],
  },
  {
    path: '/illust',
    component: Illust,
    children: [
      { path: '', component: IllustList },
      { path: 'view/:id', component: IllustDetail },
    ],
  },
  { path: '/login', component: Login },
  {
    path: '/admin',
    component: Admin,
    children: [
      { path: '', redirect: '/admin/list' },
      { path: 'list', component: AdminIllustList },
      { path: 'upload', component: AdminIllustUpload },
      { path: 'character', component: AdminInvestigators },
      {
        path: 'entry/:id?',
        component: AdminInvestigatorEntry,
        props: (route) => ({ editId: route.params.id ?? null }),
      },
    ],
    meta: { requiresAdmin: true },
  },
];

const base = import.meta.env.DEV ? '/' : '/dummy/';
const router = createRouter({
  history: createWebHistory(base),
  routes,
});

router.beforeEach(async (to, from, next) => {
  let res = { ok: false };

  try {
    res = await check();
  } catch (e) {
    // API エラー時は未ログイン扱い
    console.warn('認証チェックに失敗しました');
  }

  // 管理者専用ページに未ログインでアクセス
  if (to.meta.requiresAdmin && !res.ok) {
    return next('/login');
  }

  // ログイン済みでログインページにアクセス
  if (to.path === '/login' && res.ok) {
    return next('/admin');
  }

  next();
});

export default router;
