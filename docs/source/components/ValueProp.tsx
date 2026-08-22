import { BlocksIcon, LightningIcon, SlidersIcon } from '../icons';
import { Card } from './Card';
import { FeatureCard } from './FeatureCard';

export function ValueProp() {
  return (
    <section>
      <ul class="grid grid-cols-1 gap-y-10 sm:gap-y-12 md:grid-cols-3 md:gap-x-12 md:gap-y-16">
        <li>
          <Card class="group p-6 md:p-8">
            <FeatureCard
              icon={<BlocksIcon />}
              title="Composable."
              description="Retend supports layouts built from small, reusable components."
            />
          </Card>
        </li>
        <li>
          <Card class="group p-6 md:p-8">
            <FeatureCard
              icon={<SlidersIcon />}
              title="Reactive."
              description="Retend connects application state to rendered output and updates dependent bindings when state changes."
            />
          </Card>
        </li>
        <li>
          <Card class="group p-6 md:p-8">
            <FeatureCard
              icon={<LightningIcon />}
              title="Fine-grained updates"
              description="Retend updates the nodes and properties affected by a state change instead of rerendering the entire component tree."
            />
          </Card>
        </li>
      </ul>
    </section>
  );
}
