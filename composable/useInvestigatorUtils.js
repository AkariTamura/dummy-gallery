export function toNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

export function toDateNumber(val) {
  if (!val) return null;
  if (typeof val === 'string' && /^\d{8}$/.test(val)) {
    const y = Number(val.slice(0, 4));
    const m = Number(val.slice(4, 6)) - 1;
    const d = Number(val.slice(6, 8));
    const date = new Date(y, m, d);
    const t = date.getTime();
    return Number.isNaN(t) ? null : t;
  }
  const t = Date.parse(val);
  return Number.isNaN(t) ? null : t;
}

export function isMale(sex) {
  return sex === '男' || sex === '男性' || sex === 'male' || sex === 'Male';
}

export function isFemale(sex) {
  return sex === '女' || sex === '女性' || sex === 'female' || sex === 'Female';
}

export function parseFeature(text) {
  try {
    const arr = JSON.parse(text);
    return Array.isArray(arr) ? arr.join(',\n') : text;
  } catch {
    return text;
  }
}

export function parseJSON(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export function getSkillTotal(item) {
  const toNum = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v));
  return (
    toNum(item?.default) + toNum(item?.ex1) + toNum(item?.ex2) + toNum(item?.ex3) + toNum(item?.ex4)
  );
}

export default {
  toNumber,
  toDateNumber,
  isMale,
  isFemale,
  parseFeature,
  parseJSON,
  getSkillTotal,
};
