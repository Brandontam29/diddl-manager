import { createSignal, Show, For, Suspense, onMount } from "solid-js";
import { useAuth, useUser, SignedIn, SignedOut, SignInButton } from "clerk-solidjs";
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
import { Separator } from "~/components/ui/separator";

function ChatRoom() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [newMessage, setNewMessage] = createSignal("");
  let messagesEndRef: HTMLDivElement | undefined;

  const messages = useQuery(api.messages.list, () => ({}));
  const sendMessage = useMutation(api.messages.send);
  const removeMessage = useMutation(api.messages.remove);

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when new messages arrive
  onMount(() => {
    const interval = setInterval(scrollToBottom, 500);
    setTimeout(() => clearInterval(interval), 2000);
  });

  const handleSend = async () => {
    const body = newMessage().trim();
    if (!body || !userId()) return;

    const userName = user()?.firstName ?? user()?.username ?? "Anonymous";

    await runPromise(
      pipe(
        Effect.tryPromise({
          try: () =>
            sendMessage.mutate({
              userId: userId()!,
              userName,
              body,
            }),
          catch: (error) => new Error(`Failed to send message: ${error}`),
        }),
        Effect.tap(() =>
          Effect.sync(() => {
            setNewMessage("");
            scrollToBottom();
          }),
        ),
      ),
    );
  };

  return (
    <Card class="flex h-[600px] w-full flex-col">
      <CardHeader class="flex-none">
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Chat</CardTitle>
            <CardDescription>Real-time messaging powered by Convex</CardDescription>
          </div>
          <Badge variant="outline">{messages.data()?.length ?? 0} messages</Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent class="flex-1 space-y-3 overflow-y-auto p-4">
        <Show
          when={!messages.isLoading()}
          fallback={
            <div class="flex h-full items-center justify-center">
              <div class="animate-pulse text-muted-foreground">Loading messages...</div>
            </div>
          }
        >
          <Show
            when={(messages.data()?.length ?? 0) > 0}
            fallback={
              <div class="flex h-full items-center justify-center">
                <p class="text-sm text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            }
          >
            <For each={[...(messages.data() ?? [])].reverse()}>
              {(message) => {
                const isOwn = () => message.userId === userId();
                return (
                  <div class={`flex ${isOwn() ? "justify-end" : "justify-start"}`}>
                    <div
                      class={`max-w-[75%] rounded-lg px-4 py-2 ${
                        isOwn() ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <Show when={!isOwn()}>
                        <p class="mb-1 text-xs font-medium opacity-70">{message.userName}</p>
                      </Show>
                      <p class="text-sm">{message.body}</p>
                      <Show when={isOwn()}>
                        <button
                          onClick={() => removeMessage.mutate({ id: message._id })}
                          class="mt-1 text-xs opacity-50 hover:opacity-100"
                        >
                          delete
                        </button>
                      </Show>
                    </div>
                  </div>
                );
              }}
            </For>
          </Show>
          <div
            ref={(element) => {
              messagesEndRef = element;
            }}
          />
        </Show>
      </CardContent>
      <Separator />
      <CardFooter class="flex-none p-4">
        <form
          class="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            placeholder="Type a message..."
            value={newMessage()}
            onInput={(e) => setNewMessage(e.currentTarget.value)}
            class="flex-1"
          />
          <Button type="submit" disabled={!newMessage().trim()}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

export default function Chat() {
  return (
    <div class="mx-auto flex max-w-2xl flex-col items-center space-y-8">
      <div class="space-y-2 text-center">
        <h1 class="text-3xl font-bold tracking-tight">Chat</h1>
        <p class="text-muted-foreground">Real-time messaging with Convex subscriptions</p>
      </div>

      <SignedIn>
        <Suspense
          fallback={
            <Card class="h-[600px] w-full">
              <CardContent class="flex h-full items-center justify-center">
                <div class="animate-pulse text-muted-foreground">Loading chat...</div>
              </CardContent>
            </Card>
          }
        >
          <ChatRoom />
        </Suspense>
      </SignedIn>

      <SignedOut>
        <Card class="w-full">
          <CardHeader class="text-center">
            <CardTitle>Sign in to join the chat</CardTitle>
            <CardDescription>
              Chat messages are synced in real-time across all connected users via Convex.
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
