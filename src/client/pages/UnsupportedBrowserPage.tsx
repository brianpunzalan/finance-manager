export default function UnsupportedBrowserPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="text-5xl" aria-hidden="true">
          🌐
        </div>
        <h1 className="text-2xl font-bold">Unsupported Browser</h1>
        <p className="text-muted-foreground">
          Finance Manager works exclusively on{' '}
          <strong>Chrome (desktop)</strong> and{' '}
          <strong>Android Chrome</strong>.
        </p>
        <p className="text-muted-foreground text-sm">
          Please open this page in Chrome to access the app.
        </p>
        <a
          href="https://www.google.com/chrome/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Chrome
        </a>
      </div>
    </div>
  )
}
