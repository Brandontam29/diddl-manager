/**
 * The slice of `bun:sqlite` the import script uses. The website's tsconfig is
 * node-typed (`types: ["vite/client", "node"]`), and pulling in `bun-types` for
 * one script would change the ambient globals of the whole app.
 */
declare module "bun:sqlite" {
  export class Database {
    constructor(filename: string, options?: { readonly?: boolean; create?: boolean });
    query<T = unknown>(sql: string): { all(): T[] };
    close(): void;
  }
}
