import { createSignal, Show, For, Suspense } from "solid-js";
import { useAuth, SignedIn, SignedOut, SignInButton } from "clerk-solidjs";
import { useQuery, useMutation } from "convex-solidjs";
import { api } from "../../convex/_generated/api";
import { Effect, pipe, runPromise } from "~/lib/effect";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

function TaskList() {
  const { userId } = useAuth();
  const [newTaskTitle, setNewTaskTitle] = createSignal("");

  const tasks = useQuery(api.tasks.list, () => ({
    userId: userId() ?? "",
  }));

  const createTask = useMutation(api.tasks.create);
  const toggleTask = useMutation(api.tasks.toggle);
  const removeTask = useMutation(api.tasks.remove);

  const handleAddTask = async () => {
    const title = newTaskTitle().trim();
    if (!title || !userId()) return;

    // Use Effect for type-safe task creation
    await runPromise(
      pipe(
        Effect.tryPromise({
          try: () =>
            createTask.mutate({
              userId: userId()!,
              title,
            }),
          catch: (error) => new Error(`Failed to create task: ${error}`),
        }),
        Effect.tap(() => Effect.sync(() => setNewTaskTitle("")))
      )
    );
  };

  const completedCount = () =>
    tasks.data()?.filter((t: any) => t.completed).length ?? 0;
  const totalCount = () => tasks.data()?.length ?? 0;

  return (
    <Card class="w-full">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              Manage your tasks with real-time sync
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {completedCount()}/{totalCount()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <form
          class="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
        >
          <Input
            placeholder="Add a new task..."
            value={newTaskTitle()}
            onInput={(e) => setNewTaskTitle(e.currentTarget.value)}
            class="flex-1"
          />
          <Button type="submit" disabled={!newTaskTitle().trim()}>
            Add
          </Button>
        </form>

        <Show
          when={!tasks.isLoading()}
          fallback={
            <div class="space-y-2">
              {[1, 2, 3].map(() => (
                <div class="h-12 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          }
        >
          <Show
            when={totalCount() > 0}
            fallback={
              <p class="text-center text-sm text-muted-foreground py-8">
                No tasks yet. Add one above!
              </p>
            }
          >
            <div class="space-y-2">
              <For each={tasks.data()}>
                {(task) => (
                  <div class="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50">
                    <div class="flex items-center gap-3">
                      <button
                        onClick={() => toggleTask.mutate({ id: task._id })}
                        class={`h-5 w-5 rounded-full border-2 transition-colors flex items-center justify-center ${
                          task.completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30 hover:border-primary"
                        }`}
                      >
                        <Show when={task.completed}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </Show>
                      </button>
                      <span
                        class={`text-sm ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTask.mutate({ id: task._id })}
                      class="text-destructive hover:text-destructive"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <div class="flex flex-col items-center space-y-8 max-w-2xl mx-auto">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground">
          Your personal task manager with real-time Convex sync
        </p>
      </div>

      <SignedIn>
        <Suspense
          fallback={
            <Card class="w-full">
              <CardContent class="py-12">
                <div class="flex items-center justify-center">
                  <div class="animate-pulse text-muted-foreground">
                    Loading tasks...
                  </div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <TaskList />
        </Suspense>
      </SignedIn>

      <SignedOut>
        <Card class="w-full">
          <CardHeader class="text-center">
            <CardTitle>Sign in to access your dashboard</CardTitle>
            <CardDescription>
              Your tasks are synced in real-time with Convex and secured by Clerk
              authentication.
            </CardDescription>
          </CardHeader>
          <CardFooter class="justify-center">
            <SignInButton>
              <Button size="lg">Sign In</Button>
            </SignInButton>
          </CardFooter>
        </Card>
      </SignedOut>
    </div>
  );
}
