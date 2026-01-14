'use client'

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input
} from '@heroui/react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { ROUTES, VALIDATION_MESSAGES } from '@/constants'
import { useAuth } from '@/hooks'
import type { LoginCredentials } from '@/types'

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginCredentials>()

  const onSubmit = async (data: LoginCredentials) => {
    clearError()
    const success = await login(data)
    if (success) {
      router.push(ROUTES.ROOMS)
    }
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='flex flex-col gap-1 pb-0'>
        <h1 className='text-2xl font-bold'>Welcome Back</h1>
        <p className='text-default-500 text-sm'>Sign in to your account</p>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardBody className='gap-4'>
          {error && (
            <div className='bg-danger-50 text-danger rounded-lg p-3 text-sm'>
              {error}
            </div>
          )}
          <Input
            {...register('email', {
              required: VALIDATION_MESSAGES.REQUIRED,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: VALIDATION_MESSAGES.INVALID_EMAIL
              }
            })}
            type='email'
            label='Email'
            placeholder='Enter your email'
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
          />
          <Input
            {...register('password', {
              required: VALIDATION_MESSAGES.REQUIRED
            })}
            type={showPassword ? 'text' : 'password'}
            label='Password'
            placeholder='Enter your password'
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
            endContent={
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='text-default-400'
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            }
          />
        </CardBody>
        <CardFooter className='flex flex-col gap-4'>
          <Button
            type='submit'
            color='primary'
            className='w-full'
            isLoading={isLoading}
          >
            Sign In
          </Button>
          <p className='text-default-500 text-center text-sm'>
            Don&apos;t have an account?{' '}
            <Link
              href={ROUTES.REGISTER}
              className='text-primary hover:underline'
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
