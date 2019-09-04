export const propOrDefault = (p, def) => ( p === undefined ? def : p);
export const elementOrNull = (cond, el) => (cond ? el : null);