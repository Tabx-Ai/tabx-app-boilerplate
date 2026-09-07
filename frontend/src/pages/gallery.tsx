/**
 * The design-system gallery: a living sample of the vendored ui/ set, so a builder (or a
 * reviewer) can see the primitives render with the app's tokens without hunting for a
 * screen that happens to use them. It calls nothing and stores nothing — mount is its test.
 */
import PageHeader from '@/components/page/page-header';
import PageWrapper from '@/components/page/page-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Page() {
  return (
    <PageWrapper title="Gallery">
      <PageHeader
        title="Component gallery"
        description="A sample of the vendored shadcn/ui set, rendered with this app's tokens."
      />

      <div className="mt-6 grid max-w-3xl gap-6">
        <section className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Badge>Badge</Badge>
          <Badge variant="outline">Outline badge</Badge>
        </section>

        <Separator />

        <section className="grid max-w-sm gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="gallery-name">A labelled input</Label>
            <Input id="gallery-name" placeholder="Type here" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="gallery-check" />
            <Label htmlFor="gallery-check">A checkbox</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="gallery-switch" />
            <Label htmlFor="gallery-switch">A switch</Label>
          </div>
        </section>

        <Separator />

        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">Tab one</TabsTrigger>
            <TabsTrigger value="two">Tab two</TabsTrigger>
          </TabsList>
          <TabsContent value="one">
            <Card>
              <CardHeader>
                <CardTitle>A card</CardTitle>
                <CardDescription>Inside the first tab.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Everything on this page is the vendored set — no new dependency.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="two">
            <p className="text-sm text-muted-foreground">The second tab.</p>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
