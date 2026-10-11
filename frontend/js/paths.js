const base = new URL('../', import.meta.url);
export const frontendUrl = path => new URL(path, base).href;
export const assetUrl = name => frontendUrl(`assets/${name}`);
export const contentImageUrl = url => url.startsWith('/assets/') ? assetUrl(url.slice(8)) : url;
