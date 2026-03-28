import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@renderer/components/section/two-column";
import { Button } from "@renderer/components/ui/button";
import { trpc } from "@renderer/libs/trpc";

export default function SettingsSectionDev() {
  return (
    <div />
    // <Section>
    //   <SectionHeader>
    //     <SectionTitle>Fixes</SectionTitle>
    //     <SectionDescription>Fix the app yourself! Sometimes it is broken.</SectionDescription>
    //   </SectionHeader>
    //   <SectionContent>
    //     <Button
    //       onClick={() => {
    //         trpc.diddl.fixImages.mutate();
    //       }}
    //     >
    //       Fix Images
    //     </Button>
    //   </SectionContent>
    // </Section>
  );
}
