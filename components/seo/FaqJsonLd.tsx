import JsonLd from './JsonLd';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqJsonLdProps {
  items: FaqItem[];
}

export default function FaqJsonLd({ items }: FaqJsonLdProps) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }}
    />
  );
}
