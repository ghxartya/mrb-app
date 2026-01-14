'use client'

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip
} from '@heroui/react'

import { formatDate, formatTime } from '@/lib/utils'

import { BOOKING_STATUS } from '@/constants'
import type { Booking } from '@/types'

interface BookingCardProps {
  booking: Booking
  onCancel?: (booking: Booking) => void
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const statusConfig = BOOKING_STATUS[booking.status]
  const canCancel =
    booking.status === 'pending' || booking.status === 'confirmed'

  const handleCancel = () => {
    onCancel?.(booking)
  }

  return (
    <Card className='w-full'>
      <CardHeader className='flex flex-col items-start gap-2'>
        <div className='flex w-full items-center justify-between'>
          <h3 className='text-lg font-semibold'>{booking.title}</h3>
          <Chip
            size='sm'
            variant='flat'
            color={
              statusConfig.color as 'warning' | 'success' | 'danger' | 'default'
            }
          >
            {statusConfig.label}
          </Chip>
        </div>
      </CardHeader>
      <CardBody className='gap-3'>
        {booking.description && (
          <p className='text-default-600 text-sm'>{booking.description}</p>
        )}
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Date:</span>
            <span className='text-default-500 text-sm'>
              {formatDate(booking.date)}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Time:</span>
            <span className='text-default-500 text-sm'>
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </span>
          </div>
          {booking.attendees.length > 0 && (
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Attendees:</span>
              <span className='text-default-500 text-sm'>
                {booking.attendees.length} people
              </span>
            </div>
          )}
        </div>
      </CardBody>
      <CardFooter className='gap-2'>
        {/* <Link
          href={ROUTES.BOOKINGS}
          className='flex-1'
        >
          <Button variant='flat' className='w-full'>
            View Details
          </Button>
        </Link> */}
        {canCancel && (
          <Button
            color='danger'
            variant='flat'
            onPress={handleCancel}
            className='w-full'
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
