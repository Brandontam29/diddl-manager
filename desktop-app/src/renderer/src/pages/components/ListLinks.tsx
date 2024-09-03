import { PopoverTriggerProps } from '@kobalte/core/popover';
import { Button } from '@renderer/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger
} from '@renderer/components/ui/popover';
import { TrackerListItem } from '@shared/index';
import { BsCaretDown, BsCaretRight } from 'solid-icons/bs';
import { Component, createMemo, createSignal, For } from 'solid-js';
import CreateListDialog from './CreateListDialog';

const ListLinks: Component<{ trackerListItems: TrackerListItem[] }> = (props) => {
  const [open, setOpen] = createSignal(false);

  const first4List = createMemo(() =>
    props.trackerListItems
      .filter((item) => item.name !== 'Collection')
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 4)
  );
  return (
    <Popover open={open()} onOpenChange={setOpen}>
      <PopoverTrigger
        as={(props: PopoverTriggerProps) => (
          <Button variant="outline" {...props}>
            {open() ? <BsCaretDown /> : <BsCaretRight />}
            Lists
          </Button>
        )}
      />
      <PopoverContent class="">
        <PopoverTitle class="sr-only">List Popover</PopoverTitle>
        <PopoverDescription class="">
          <CreateListDialog />

          <For each={first4List()}>{(item) => <div>{item.name}</div>}</For>
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  );
};

export default ListLinks;
