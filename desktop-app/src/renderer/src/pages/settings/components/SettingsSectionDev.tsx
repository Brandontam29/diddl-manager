import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@renderer/components/section/two-column";
import { Button } from "@renderer/components/ui/button";

export default function SettingsSectionDev() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Fixes</SectionTitle>
        <SectionDescription>Fix the app yourself! Sometimes it is broken.</SectionDescription>
      </SectionHeader>
      <SectionContent>
        <Button
          onClick={() => {
            window.api.fixDiddlImages();
          }}
        >
          Fix Images
        </Button>
      </SectionContent>
    </Section>
  );
}
