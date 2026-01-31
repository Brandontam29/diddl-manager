import {
  ColumnUpdateNode,
  IdentifierNode,
  InsertQueryNode,
  KyselyPlugin,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  QueryResult,
  RootOperationNode,
  UnknownRow,
  UpdateQueryNode,
  ValueNode,
} from "kysely";

export class AutoUpdatedAtPlugin implements KyselyPlugin {
  #columnName: string;

  constructor(options?: { columnName?: string }) {
    this.#columnName = options?.columnName ?? "updatedAt";
  }

  // We only need to transform the query before it's sent to the DB
  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    const { node } = args;

    if (node.kind === "UpdateQueryNode") {
      return this.#transformUpdate(node);
    }

    if (node.kind === "InsertQueryNode") {
      return this.#transformInsert(node);
    }

    return node;
  }

  // Required by interface, but we don't need to touch the results
  transformResult(args: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>> {
    return Promise.resolve(args.result);
  }

  #transformUpdate(node: UpdateQueryNode): UpdateQueryNode {
    const now = new Date().toISOString();

    // Check if updatedAt is already being set manually
    const isAlreadySet = node.updates?.some(
      (update) =>
        ColumnUpdateNode.is(update) &&
        IdentifierNode.is(update.column) &&
        update.column.name === this.#columnName,
    );

    if (isAlreadySet) return node;

    // Add the updatedAt column to the update statement
    return {
      ...node,
      updates: [
        ...(node.updates ?? []),
        ColumnUpdateNode.create(IdentifierNode.create(this.#columnName), ValueNode.create(now)),
      ],
    };
  }

  #transformInsert(node: InsertQueryNode): InsertQueryNode {
    // Optional: You can also ensure updatedAt is set on Insert
    // if your DB schema doesn't have a DEFAULT CURRENT_TIMESTAMP
    return node;
  }
}
