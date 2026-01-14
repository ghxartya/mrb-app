'use client'

import { Spinner } from '@heroui/react'

import type { Booking } from '@/types'

import { BookingCard } from './BookingCard'

interface BookingListProps {
  bookings: Booking[]
  isLoading?: boolean
  onCancelBooking?: (booking: Booking) => void
}

export function BookingList({
  bookings,
  isLoading,
  onCancelBooking
}: BookingListProps) {
  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Spinner size='lg' />
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className='flex h-64 flex-col items-center justify-center gap-2'>
        <p className='text-default-500 text-lg font-medium'>
          No bookings found
        </p>
        <p className='text-default-400 text-sm'>
          You haven&apos;t made any bookings yet
        </p>
      </div>
    )
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {bookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={onCancelBooking}
        />
      ))}
    </div>
  )
}
