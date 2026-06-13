import LinkButton from '@/components/ui/LinkButton';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-8xl font-bold text-(--bpa-green) mb-4">404</div>
      <h1 className="text-3xl font-bold text-(--bpa-navy) mb-3">Page Not Found</h1>
      <p className="text-gray-500 text-lg mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <LinkButton href="/">Go Home</LinkButton>
        <LinkButton href="/contact" variant="outline">Contact Us</LinkButton>
      </div>
    </div>
  );
}
