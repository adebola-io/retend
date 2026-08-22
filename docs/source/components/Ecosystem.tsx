import type { JSX } from 'retend/jsx-runtime';

import { Card } from './Card';
import {
  AwaitIllustration,
  HmrIllustration,
  RouterIllustration,
  ScopedContextIllustration,
  SsrIllustration,
  UniversalRenderingIllustration,
} from './EcosystemIllustrations';
import { FeatureCard } from './FeatureCard';
import { SectionHeader } from './SectionHeader';

interface EcosystemCardProps {
  title: string;
  description: string | JSX.Element;
  illustration: () => JSX.Element;
}

function EcosystemCard(props: EcosystemCardProps) {
  const { title, description, illustration: Illustration } = props;

  return (
    <Card class="group hover:border-brand/40 flex min-w-0 flex-col overflow-hidden transition-colors">
      <div class="border-border/65 dark:border-border bg-surface-alt/30 group-hover:bg-brand/2 relative flex h-48 w-full items-center justify-center overflow-hidden border-b transition-colors">
        <Illustration />
      </div>
      <div class="flex-1 p-6 md:p-8">
        <FeatureCard title={title} description={description} />
      </div>
    </Card>
  );
}

export function Ecosystem() {
  return (
    <section>
      <div>
        <SectionHeader
          label="Ecosystem"
          title="Included packages and features"
          description="The project includes routing, server rendering, asynchronous boundaries, development tooling, scoped context, and custom renderer support."
        />
      </div>

      <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
        <li>
          <EcosystemCard
            title="Router"
            description="Routing includes lazy loading, middleware, route locking, and reactive query parameters."
            illustration={RouterIllustration}
          />
        </li>

        <li>
          <EcosystemCard
            title="Server rendering"
            description="The server package supports server-side rendering, static site generation, and client hydration."
            illustration={SsrIllustration}
          />
        </li>

        <li>
          <EcosystemCard
            title="Async Boundaries"
            description={
              <>
                Coordinate loading states across component trees with{' '}
                <code class="text-fg font-mono text-xs">{'<Await>'}</code>.
                Nested async data resolves together, eliminating layout shift.
              </>
            }
            illustration={AwaitIllustration}
          />
        </li>

        <li>
          <EcosystemCard
            title="Hot Module Replacement"
            description={
              <>
                Hot Module Replacement preserves component state while source
                files are updated during development.
              </>
            }
            illustration={HmrIllustration}
          />
        </li>

        <li>
          <EcosystemCard
            title="Scoped Context"
            description={
              <>
                Type-safe context values can be scoped to component subtrees.
                Scoped data is cleaned up when its Provider leaves the component
                tree.
              </>
            }
            illustration={ScopedContextIllustration}
          />
        </li>

        <li>
          <EcosystemCard
            title="Renderer architecture"
            description="The core uses a pluggable renderer interface. Renderers can target the browser, the server, or other host environments."
            illustration={UniversalRenderingIllustration}
          />
        </li>
      </ul>
    </section>
  );
}
