export function toNumber(v: any): number {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

export function toDateNumber(v: any): number {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

export function isMale(v: any): boolean {
  return v === 'male' || v === '男性';
}

export function isFemale(v: any): boolean {
  return v === 'female' || v === '女性';
}

export function parseFeature(s: any): string {
  if (s == null) return '';
  // already an array
  if (Array.isArray(s)) return s.join(', ');
  // already an object -> stringify
  if (typeof s === 'object') return JSON.stringify(s);
  // string: try parse JSON, otherwise return as-is
  if (typeof s === 'string') {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.join(', ');
      if (typeof parsed === 'object') return JSON.stringify(parsed);
      return String(parsed);
    } catch (e) {
      return s;
    }
  }
  return String(s);
}

export function parseJSON(s: any) {
  return parseFeature(s);
}

export function getSkillTotal(skills: any): number {
  if (skills == null) return 0;
  // Array of skill entries
  if (Array.isArray(skills)) {
    return skills.reduce((acc: number, s: any) => acc + getSkillTotal(s), 0);
  }
  // Single skill object with default/value
  if (typeof skills === 'object') {
    if ('default' in skills || 'value' in skills) {
      const def = Number((skills as any).default ?? (skills as any).value) || 0;
      const ex1 = Number((skills as any).ex1 ?? 0) || 0;
      const ex2 = Number((skills as any).ex2 ?? 0) || 0;
      const ex3 = Number((skills as any).ex3 ?? 0) || 0;
      const ex4 = Number((skills as any).ex4 ?? 0) || 0;
      return def + ex1 + ex2 + ex3 + ex4;
    }
    // Map of skills -> sum recursively
    return Object.values(skills).reduce((acc: number, s: any) => acc + getSkillTotal(s), 0);
  }
  // Primitive number/string
  return Number(skills) || 0;
}
