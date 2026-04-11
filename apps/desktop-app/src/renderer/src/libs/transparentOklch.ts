export const transparentOklch = (color: string, transparent: number) =>
  color.replace(")", ` / ${transparent})`);
