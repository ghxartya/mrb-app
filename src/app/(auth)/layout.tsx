export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className='from-primary-50 to-secondary-50 flex min-h-screen items-center justify-center bg-linear-to-br p-4'>
      {children}
    </div>
  )
}
