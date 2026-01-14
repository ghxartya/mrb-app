import { APP_NAME } from '@/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='border-divider bg-content1 border-t py-6'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
          <p className='text-default-500 text-sm'>
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <nav className='flex gap-4'>
            <a
              href='#'
              className='text-default-500 hover:text-default-900 text-sm transition-colors'
            >
              Privacy Policy
            </a>
            <a
              href='#'
              className='text-default-500 hover:text-default-900 text-sm transition-colors'
            >
              Terms of Service
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
