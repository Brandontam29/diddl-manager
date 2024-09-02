export type DeepMutable<T> = T extends (infer R)[]
  ? DeepMutable<R>[]
  : T extends object
    ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
    : T;
