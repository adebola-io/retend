import { CallToAction } from '@/components/CallToAction';
import { Ecosystem } from '@/components/Ecosystem';
import { Hero } from '@/components/Hero';
import { ValueProp } from '@/components/ValueProp';
import { Footer } from '@/layouts/Footer';

export function Home() {
  return (
    <>
      <Hero />
      <ValueProp />
      <Ecosystem />
      <CallToAction />
      <Footer />
    </>
  );
}

Home.metadata = () => {
  return {
    title: 'Retend - Reactive user interfaces with JSX',
    description:
      'Retend is a renderer-independent reactive framework for building web applications with JSX.',
    ogTitle: 'Retend - Reactive user interfaces with JSX',
    ogDescription:
      'Retend is a renderer-independent reactive framework for building web applications with JSX.',
    ogImage: 'https://retend.dev/og/overview.png',
    ogUrl: 'https://retend.dev/',
    ogType: 'website',
    ogLocale: 'en_US',
    ogLogo: 'https://retend.dev/og/overview.png',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Retend - Reactive user interfaces with JSX',
    twitterDescription:
      'Retend is a renderer-independent reactive framework for building web applications with JSX.',
    twitterImage: 'https://retend.dev/og/overview.png',
  };
};
