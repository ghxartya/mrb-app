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
import type { RegisterCredentials } from '@/types'

export function RegisterForm() {
  const router = useRouter()
  const { register: registerUser, isLoading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterCredentials>()

  const onSubmit = async (data: RegisterCredentials) => {
    clearError()
    const success = await registerUser(data)
    if (success) {
      router.push(ROUTES.ROOMS)
    }
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='flex flex-col gap-1 pb-0'>
        <h1 className='text-2xl font-bold'>Create Account</h1>
        <p className='text-default-500 text-sm'>Sign up for a new account</p>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardBody className='gap-4'>
          {error && (
            <div className='bg-danger-50 text-danger rounded-lg p-3 text-sm'>
              {error}
            </div>
          )}
          <Input
            {...register('displayName', {
              required: VALIDATION_MESSAGES.REQUIRED
            })}
            type='text'
            label='Full Name'
            placeholder='Enter your full name'
            isInvalid={!!errors.displayName}
            errorMessage={errors.displayName?.message}
          />
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
              required: VALIDATION_MESSAGES.REQUIRED,
              minLength: {
                value: 8,
                message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH
              }
            })}
            type={showPassword ? 'text' : 'password'}
            label='Password'
            placeholder='Create a password'
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
            Create Account
          </Button>
          <p className='text-default-500 text-center text-sm'>
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className='text-primary hover:underline'>
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
