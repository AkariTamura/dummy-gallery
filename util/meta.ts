type MetaKeys =
  | 'og:title'
  | 'og:description'
  | 'og:image'
  | 'og:url'
  | 'twitter:card'
  | 'twitter:title'
  | 'twitter:description'
  | 'twitter:image';

const keys: MetaKeys[] = [
  'og:title',
  'og:description',
  'og:image',
  'og:url',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
];

const defaults: Record<string, string | null> = {};

function findMeta(tag: string) {
  // prefer property attr for og:, otherwise name
  return (
    (document.querySelector(`meta[property="${tag}"]`) as HTMLMetaElement | null) ||
    (document.querySelector(`meta[name="${tag}"]`) as HTMLMetaElement | null)
  );
}

function ensureMeta(tag: string) {
  let m = findMeta(tag);
  if (!m) {
    m = document.createElement('meta');
    if (tag.startsWith('og:')) m.setAttribute('property', tag);
    else m.setAttribute('name', tag);
    document.head.appendChild(m);
  }
  return m;
}

function captureDefaults() {
  keys.forEach(k => {
    const m = findMeta(k);
    defaults[k] = m ? m.getAttribute('content') || null : null;
  });
  // capture title
  defaults['document:title'] = document.title || null;
}

captureDefaults();

export function setMeta(opts: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  card?: string;
}) {
  if (opts.title) document.title = opts.title;
  if (opts.title) {
    const m = ensureMeta('og:title');
    m.setAttribute('content', opts.title);
    const mt = ensureMeta('twitter:title');
    mt.setAttribute('content', opts.title);
  }
  if (opts.description !== undefined) {
    const m = ensureMeta('og:description');
    m.setAttribute('content', opts.description || '');
    const mt = ensureMeta('twitter:description');
    mt.setAttribute('content', opts.description || '');
  }
  if (opts.image) {
    const v = opts.image;
    const m = ensureMeta('og:image');
    m.setAttribute('content', v);
    const mt = ensureMeta('twitter:image');
    mt.setAttribute('content', v);
  }
  if (opts.url) {
    const m = ensureMeta('og:url');
    m.setAttribute('content', opts.url);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', opts.url);
  }
  if (opts.card) {
    const mt = ensureMeta('twitter:card');
    mt.setAttribute('content', opts.card);
  }
}

export function restoreDefaults() {
  if (defaults['document:title']) document.title = defaults['document:title'] as string;
  else document.title = '';
  keys.forEach(k => {
    const m = findMeta(k);
    const val = defaults[k];
    if (m) {
      if (val !== null && val !== undefined) m.setAttribute('content', val);
      else m.remove();
    } else if (val) {
      const nm = document.createElement('meta');
      if (k.startsWith('og:')) nm.setAttribute('property', k);
      else nm.setAttribute('name', k);
      nm.setAttribute('content', val);
      document.head.appendChild(nm);
    }
  });
  // restore canonical if default og:url exists
  const defaultUrl = defaults['og:url'];
  const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (link) {
    if (defaultUrl) link.setAttribute('href', defaultUrl);
    else link.remove();
  }
}

export default { setMeta, restoreDefaults };