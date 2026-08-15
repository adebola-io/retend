import type { JSX } from 'retend/jsx-runtime';

import { Cell, onConnected } from 'retend';
import { useCurrentRoute } from 'retend/router';

type HeadingProps =
  | JSX.IntrinsicElements['h2']
  | JSX.IntrinsicElements['h3']
  | JSX.IntrinsicElements['h4'];

interface NavigableHeadingProps extends HeadingProps {
  as: 'h2' | 'h3' | 'h4';
}

export function NavigableHeading(props: NavigableHeadingProps) {
  const { as, class: className, id, ...rest } = props;
  const route = useCurrentRoute();

  const ref = Cell.source<HTMLElement | null>(null);
  const hash = Cell.derived(() => route.get().hash);

  const scrollIntoView = (heading: HTMLElement | null) => {
    const headingId = hash.get();
    if (headingId && heading?.id === headingId) {
      heading.scrollIntoView();
    }
  };

  hash.listen(() => scrollIntoView(ref.peek()));
  onConnected(ref, scrollIntoView);

  if (as === 'h2') {
    return (
      <h2 ref={ref} id={id} class={[className, 'scroll-mt-32']} {...rest} />
    );
  }
  if (as === 'h3') {
    return (
      <h3 ref={ref} id={id} class={[className, 'scroll-mt-32']} {...rest} />
    );
  }
  return <h4 ref={ref} id={id} class={[className, 'scroll-mt-32']} {...rest} />;
}
