import fs from "node:fs/promises";
import path from "path";

import { Result, ResultAsync, err, ok } from "neverthrow";
import type { Document } from "yaml";
import YAML from "yaml";
import { z } from "zod";

import { AppError, internalAppError, preconditionFailedError } from "../errors";
import { logging } from "../logging";
import ensureFileExists from "../utils/ensureFileExists";

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

export class YamlHandler<TSchema extends z.ZodType> {
  private schema: TSchema;
  private filePath: string;
  private document: Document | null = null;

  constructor(schema: TSchema, filePath: string) {
    this.schema = schema;
    this.filePath = path.resolve(filePath);
  }

  public load() {
    return ResultAsync.fromPromise(fs.readFile(this.filePath, "utf8"), toError)
      .andThen((content) => {
        this.document = YAML.parseDocument(content);

        if (this.document.errors.length > 0) {
          return this.liftResult(
            err(
              preconditionFailedError(
                "CONFIG_INVALID",
                "Configuration file contains invalid YAML",
                {
                  filePath: this.filePath,
                  issues: this.document.errors.map((error) => error.message),
                },
              ),
            ),
          );
        }

        return this.liftResult(ok(null));
      })
      .orElse((e) => {
        if ((e as any).code === "ENOENT") {
          this.document = new YAML.Document({});
          return ok(null);
        }

        if (e instanceof AppError) {
          return err(e);
        }

        logging.error("YamlHandler", e);
        return err(
          internalAppError(
            "CONFIG_READ_FAILED",
            "Failed to read configuration file",
            {
              filePath: this.filePath,
            },
            e,
          ),
        );
      });
  }

  public read() {
    return this.ensureLoaded().andThen(() => {
      const validation = this.validate(this.document!.toJS());
      return this.liftResult(validation);
    });
  }

  public update(keyPath: string[], value: any) {
    return this.ensureLoaded().andThen(() => {
      this.document!.setIn(keyPath, value);

      const validation = this.validate(this.document!.toJS());

      return this.liftResult(validation).andThen(() => this.saveToDisk(this.document!.toString()));
    });
  }

  public set(obj: z.infer<TSchema>) {
    const validation = this.validate(obj);

    return this.liftResult(validation).andThen((validatedData) => {
      this.document = new YAML.Document(validatedData);
      return this.saveToDisk(this.document.toString());
    });
  }

  /**
   * Converts a synchronous Result to ResultAsync
   */
  private liftResult<T, E>(result: Result<T, E>) {
    return new ResultAsync(Promise.resolve(result));
  }

  private ensureLoaded() {
    if (this.document) return this.liftResult(ok(null));
    return this.load();
  }

  private validate(data: unknown) {
    const result = this.schema.safeParse(data);
    if (result.success) {
      return ok(result.data);
    }
    return err(
      preconditionFailedError(
        "CONFIG_INVALID",
        "Configuration file does not match the expected schema",
        {
          filePath: this.filePath,
          issues: result.error.issues.map((issue) => ({
            code: issue.code,
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        result.error,
      ),
    );
  }

  private saveToDisk(content: string) {
    return ResultAsync.fromPromise(
      (async () => {
        await ensureFileExists(this.filePath);
        await fs.writeFile(this.filePath, content, "utf8");
      })(),
      (error) =>
        internalAppError(
          "CONFIG_WRITE_FAILED",
          "Failed to write configuration file",
          {
            filePath: this.filePath,
          },
          toError(error),
        ),
    );
  }
}
