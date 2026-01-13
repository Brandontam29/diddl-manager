import fs from "node:fs/promises";
import path from "path";

import { Result, ResultAsync, err, ok } from "neverthrow";
import type { Document } from "yaml";
import YAML from "yaml";
import { z } from "zod";

import { logging } from "../logging";
import ensureFileExists from "../utils/ensureFileExists";

const toError = (e: unknown): Error => (e instanceof Error ? e : new Error(String(e)));

export class YamlHandler<TSchema extends z.ZodType> {
  private schema: TSchema;
  private filePath: string;
  private document: Document | null = null;

  constructor(schema: TSchema, filePath: string) {
    this.schema = schema;
    this.filePath = path.resolve(filePath);
  }

  public load(): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(fs.readFile(this.filePath, "utf8"), toError)
      .map((content) => {
        this.document = YAML.parseDocument(content);
      })
      .orElse((e) => {
        if ((e as any).code === "ENOENT") {
          this.document = new YAML.Document({});
          return ok(undefined);
        }
        logging.error("YamlHandler", e);
        return err(e);
      });
  }

  public read(): ResultAsync<z.infer<TSchema>, Error> {
    return this.ensureLoaded().andThen(() => {
      // document is guaranteed to be not null by ensureLoaded
      const validation = this.validate(this.document!.toJS());
      return this.liftResult(validation);
    });
  }

  public update(keyPath: string[], value: unknown): ResultAsync<void, Error> {
    return this.ensureLoaded().andThen(() => {
      // 1. Modify the AST (preserves comments)
      this.document!.setIn(keyPath, value);

      // 2. Validate the result
      const validation = this.validate(this.document!.toJS());

      // 3. If valid, save to disk
      return this.liftResult(validation).andThen(() => this.saveToDisk(this.document!.toString()));
    });
  }

  public set(obj: z.infer<TSchema>): ResultAsync<void, Error> {
    const validation = this.validate(obj);

    return this.liftResult(validation).andThen((validatedData) => {
      this.document = new YAML.Document(validatedData);
      return this.saveToDisk(this.document.toString());
    });
  }

  // --- Private Helpers ---

  /**
   * Converts a synchronous Result to ResultAsync
   */
  private liftResult<T>(result: Result<T, Error>): ResultAsync<T, Error> {
    return new ResultAsync(Promise.resolve(result));
  }

  private ensureLoaded(): ResultAsync<void, Error> {
    if (this.document) return this.liftResult(ok(undefined));
    return this.load();
  }

  private validate(data: unknown): Result<z.infer<TSchema>, Error> {
    const result = this.schema.safeParse(data);
    if (result.success) {
      return ok(result.data);
    }
    return err(result.error);
  }

  private saveToDisk(content: string): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        await ensureFileExists(this.filePath);
        await fs.writeFile(this.filePath, content, "utf8");
      })(),
      toError,
    );
  }
}
