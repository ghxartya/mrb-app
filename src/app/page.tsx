'use client'

import { Button } from '@heroui/react'

import Link from 'next/link'

import { APP_NAME, ROUTES } from '@/constants'

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-8'>
      <main className='flex max-w-md flex-col items-center gap-8 text-center'>
        <h1 className='text-4xl font-bold tracking-tight sm:text-5xl'>
          {APP_NAME}
        </h1>
        <p className='text-default-600 text-lg'>
          Book meeting rooms easily and efficiently.
        </p>
        <div className='flex w-full flex-col gap-4'>
          <Link href={ROUTES.LOGIN} className='w-full'>
            <Button size='lg' variant='flat' className='w-full'>
              Sign In
            </Button>
          </Link>
          <Link href={ROUTES.REGISTER} className='w-full'>
            <Button size='lg' color='primary' className='w-full'>
              Get Started
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
