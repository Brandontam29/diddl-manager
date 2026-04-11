export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Invert<TObj extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof TObj as TObj[K]]: K;
};
