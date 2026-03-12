import { Construction } from 'lucide-react'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <Construction className="size-8 text-primary" />
      </div>
      <h1 className="mt-4 text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Esta tela está em construção
      </p>
    </div>
  )
}
