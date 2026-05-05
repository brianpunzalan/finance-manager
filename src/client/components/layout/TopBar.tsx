interface Props {
  title: string
  action?: React.ReactNode
}

export function TopBar({ title, action }: Props) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
      <h1 className="text-base font-semibold">{title}</h1>
      {action && <div>{action}</div>}
    </header>
  )
}
