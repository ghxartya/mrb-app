'use client'

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Tab,
  Tabs,
  Textarea,
  useDisclosure
} from '@heroui/react'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { BOOKING_STATUS, VALIDATION_MESSAGES } from '@/constants'
import { useAuth } from '@/hooks'
import { useBookingsStore, useRoomsStore } from '@/store'
import type { Booking, CreateBookingInput } from '@/types'

type ModalType = 'create' | 'edit' | null

export default function BookingsPage() {
  const { user } = useAuth()
  const {
    bookings,
    userBookings,
    isLoading,
    error,
    fetchBookings,
    fetchUserBookings,
    createBooking,
    updateBooking,
    joinBooking,
    cancelBooking,
    checkAvailability,
    clearError
  } = useBookingsStore()

  const { rooms, fetchRooms } = useRoomsStore()

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CreateBookingInput>()

  const watchedRoomId = watch('roomId')

  useEffect(() => {
    fetchBookings()
    if (user?.uid) {
      fetchUserBookings(user.uid)
    }
    fetchRooms()
  }, [fetchBookings, fetchUserBookings, fetchRooms, user?.uid])

  useEffect(() => {
    if (modalType === 'edit' && selectedBooking) {
      setValue('roomId', selectedBooking.roomId)
      setValue('title', selectedBooking.title)
      setValue('description', selectedBooking.description || '')
      setValue('date', selectedBooking.date)
      setValue('startTime', selectedBooking.startTime)
      setValue('endTime', selectedBooking.endTime)
    } else if (modalType === 'create') {
      reset()
    }
  }, [modalType, selectedBooking, setValue, reset])

  const handleOpenCreate = () => {
    setModalType('create')
    setSelectedBooking(null)
    reset()
    onOpen()
  }

  const handleOpenEdit = (booking: Booking) => {
    setModalType('edit')
    setSelectedBooking(booking)
    onOpen()
  }

  const onSubmit = async (data: CreateBookingInput) => {
    if (!user?.uid) return
    clearError()

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      alert(VALIDATION_MESSAGES.INVALID_TIME_RANGE)
      return
    }

    if (data.roomId && data.date && data.startTime && data.endTime) {
      const isAvailable = await checkAvailability(
        data.roomId,
        data.date instanceof Date ? data.date : new Date(data.date),
        data.startTime,
        data.endTime
      )

      if (!isAvailable && modalType === 'create') {
        alert(VALIDATION_MESSAGES.TIME_CONFLICT)
        return
      }

      if (modalType === 'edit' && selectedBooking) {
        const timeChanged =
          data.startTime !== selectedBooking.startTime ||
          data.endTime !== selectedBooking.endTime ||
          (data.date &&
            new Date(data.date).getTime() !== selectedBooking.date.getTime())

        if (timeChanged && !isAvailable) {
          alert(VALIDATION_MESSAGES.TIME_CONFLICT)
          return
        }
      }
    }

    if (modalType === 'create') {
      const success = await createBooking(data, user.uid)
      if (success) {
        onClose()
        reset()
        setModalType(null)
        if (user?.uid) {
          fetchUserBookings(user.uid)
        }
      }
    } else if (modalType === 'edit' && selectedBooking) {
      const success = await updateBooking({
        id: selectedBooking.id,
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime
      })
      if (success) {
        onClose()
        reset()
        setModalType(null)
        setSelectedBooking(null)
        if (user?.uid) {
          fetchUserBookings(user.uid)
        }
      }
    }
  }

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await cancelBooking(id)
      if (user?.uid) {
        fetchUserBookings(user.uid)
      }
    }
  }

  const handleJoinBooking = async (bookingId: string) => {
    if (!user?.email) return

    const success = await joinBooking(bookingId, user.email)
    if (success) {
      if (user?.uid) {
        fetchUserBookings(user.uid)
      }
    }
  }

  const canEditBooking = (booking: Booking): boolean => {
    if (!user) return false
    if (booking.userId === user.uid) return true

    const room = rooms.find(r => r.id === booking.roomId)
    if (!room || !user.email) return false

    const member = room.members.find(m => m.email === user.email)
    return member?.role === 'admin' || room.createdBy === user.uid
  }

  const canJoinBooking = (booking: Booking): boolean => {
    if (!user?.email) return false

    if (booking.attendees.includes(user.email)) return false
    if (booking.status === 'cancelled' || booking.status === 'completed')
      return false

    return true
  }

  const displayedBookings = selectedTab === 'my' ? userBookings : bookings
  const filteredBookings = displayedBookings.filter(booking => {
    const room = rooms.find(r => r.id === booking.roomId)
    return (
      booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    return room?.name || 'Unknown Room'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Bookings</h1>
          <p className='text-default-500 mt-1'>
            Manage your meeting room reservations
          </p>
        </div>
        <Button color='primary' onPress={handleOpenCreate}>
          Create Booking
        </Button>
      </div>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center'>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={key => setSelectedTab(key as string)}
        >
          <Tab key='all' title='All Bookings' />
          <Tab key='my' title='My Bookings' />
        </Tabs>
        <Input
          placeholder='Search bookings...'
          value={searchQuery}
          onValueChange={setSearchQuery}
          className='max-w-md'
        />
      </div>
      {error && (
        <div className='bg-danger-50 text-danger mb-6 rounded-lg p-4'>
          {error}
        </div>
      )}
      {isLoading && (
        <div className='flex justify-center py-12'>
          <Spinner size='lg' />
        </div>
      )}
      {!isLoading && filteredBookings.length === 0 && (
        <div className='py-12 text-center'>
          <p className='text-default-500 text-lg'>
            {searchQuery
              ? 'No bookings found matching your search'
              : selectedTab === 'my'
                ? 'You have no bookings yet. Create your first booking to get started.'
                : 'No bookings available.'}
          </p>
        </div>
      )}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {filteredBookings.map(booking => (
          <Card key={booking.id} className='w-full'>
            <CardHeader className='flex-col items-start gap-2'>
              <div className='flex w-full items-center justify-between'>
                <h3 className='text-xl font-semibold'>{booking.title}</h3>
                <Chip
                  size='sm'
                  variant='flat'
                  color={BOOKING_STATUS[booking.status].color as never}
                >
                  {BOOKING_STATUS[booking.status].label}
                </Chip>
              </div>
              <p className='text-default-500 text-sm'>
                {getRoomName(booking.roomId)}
              </p>
            </CardHeader>
            <CardBody className='gap-3'>
              <div className='flex items-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='h-5 w-5'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5'
                  />
                </svg>
                <span className='text-sm'>{formatDate(booking.date)}</span>
              </div>
              <div className='flex items-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='h-5 w-5'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                  />
                </svg>
                <span className='text-sm'>
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
              {booking.description && (
                <p className='text-default-500 text-sm'>
                  {booking.description}
                </p>
              )}
              {booking.attendees.length > 0 && (
                <div>
                  <p className='text-default-500 mb-1 text-xs'>Attendees:</p>
                  <div className='flex flex-wrap gap-1'>
                    {booking.attendees.map(email => (
                      <Chip key={email} size='sm' variant='flat'>
                        {email}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
            <CardFooter className='flex flex-col gap-2'>
              <div className='flex w-full gap-2'>
                {canEditBooking(booking) &&
                  booking.status !== 'cancelled' &&
                  booking.status !== 'completed' && (
                    <Button
                      size='sm'
                      variant='flat'
                      onPress={() => handleOpenEdit(booking)}
                      className='flex-1'
                    >
                      Edit
                    </Button>
                  )}
                {booking.userId === user?.uid &&
                  booking.status !== 'cancelled' &&
                  booking.status !== 'completed' && (
                    <Button
                      size='sm'
                      color='danger'
                      variant='flat'
                      onPress={() => handleCancel(booking.id)}
                      className='flex-1'
                    >
                      Cancel
                    </Button>
                  )}
              </div>
              {canJoinBooking(booking) && (
                <Button
                  size='sm'
                  color='primary'
                  variant='bordered'
                  onPress={() => handleJoinBooking(booking.id)}
                  className='w-full'
                >
                  Join Booking
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement='center'
        scrollBehavior='inside'
      >
        <ModalContent>
          {onClose => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>
                {modalType === 'create' ? 'Create New Booking' : 'Edit Booking'}
              </ModalHeader>
              <ModalBody className='gap-4'>
                <Select
                  {...register('roomId', {
                    required: VALIDATION_MESSAGES.REQUIRED
                  })}
                  label='Select Room'
                  placeholder='Choose a meeting room'
                  isInvalid={!!errors.roomId}
                  errorMessage={errors.roomId?.message}
                  selectedKeys={watchedRoomId ? [watchedRoomId] : []}
                >
                  {rooms.map(room => (
                    <SelectItem key={room.id}>{room.name}</SelectItem>
                  ))}
                </Select>
                <Input
                  {...register('title', {
                    required: VALIDATION_MESSAGES.REQUIRED
                  })}
                  label='Meeting Title'
                  placeholder='e.g., Team Standup'
                  isInvalid={!!errors.title}
                  errorMessage={errors.title?.message}
                />
                <Textarea
                  {...register('description')}
                  label='Description (Optional)'
                  placeholder='Add meeting details'
                />
                <Input
                  {...register('date', {
                    required: VALIDATION_MESSAGES.REQUIRED
                  })}
                  type='date'
                  label='Date'
                  isInvalid={!!errors.date}
                  errorMessage={errors.date?.message}
                  min={new Date().toISOString().split('T')[0]}
                />
                <div className='flex gap-4'>
                  <Input
                    {...register('startTime', {
                      required: VALIDATION_MESSAGES.REQUIRED
                    })}
                    type='time'
                    label='Start Time'
                    isInvalid={!!errors.startTime}
                    errorMessage={errors.startTime?.message}
                  />
                  <Input
                    {...register('endTime', {
                      required: VALIDATION_MESSAGES.REQUIRED
                    })}
                    type='time'
                    label='End Time'
                    isInvalid={!!errors.endTime}
                    errorMessage={errors.endTime?.message}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='flat' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='primary' type='submit' isLoading={isLoading}>
                  {modalType === 'create' ? 'Create Booking' : 'Update Booking'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
