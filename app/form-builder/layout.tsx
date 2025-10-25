import { getUser } from "@/lib/auth"

interface FormBuilderLayoutProps {
  children: React.ReactNode
}

export default async function FormBuilderLayout({ children }: FormBuilderLayoutProps) {
  const user = await getUser()

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
