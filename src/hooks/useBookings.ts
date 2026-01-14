'use client'

import { useCallback, useEffect } from 'react'

import { useAuthStore, useBookingsStore } from '@/store'
import type {
  BookingFilters,
  CreateBookingInput,
  UpdateBookingInput
} from '@/types'

export function useBookings(initialFilters?: BookingFilters) {
  const { user } = useAuthStore()
  const {
    bookings,
    userBookings,
    selectedBooking,
    isLoading,
    error,
    fetchBookings,
    fetchBookingById,
    fetchUserBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    getAvailableTimeSlots,
    checkAvailability,
    setSelectedBooking,
    clearError
  } = useBookingsStore()

  useEffect(() => {
    fetchBookings(initialFilters)
  }, [fetchBookings, initialFilters])

  useEffect(() => {
    if (user?.uid) {
      fetchUserBookings(user.uid)
    }
  }, [user?.uid, fetchUserBookings])

  const refresh = useCallback(() => {
    fetchBookings(initialFilters)
    if (user?.uid) {
      fetchUserBookings(user.uid)
    }
  }, [fetchBookings, fetchUserBookings, initialFilters, user?.uid])

  const handleCreateBooking = useCallback(
    async (input: CreateBookingInput) => {
      if (!user?.uid) {
        console.error('User not authenticated')
        return null
      }
      return await createBooking(input, user.uid)
    },
    [createBooking, user?.uid]
  )

  const handleUpdateBooking = useCallback(
    async (input: UpdateBookingInput) => {
      return await updateBooking(input)
    },
    [updateBooking]
  )

  const handleCancelBooking = useCallback(
    async (id: string) => {
      return await cancelBooking(id)
    },
    [cancelBooking]
  )

  const handleDeleteBooking = useCallback(
    async (id: string) => {
      return await deleteBooking(id)
    },
    [deleteBooking]
  )

  return {
    bookings,
    userBookings,
    selectedBooking,
    isLoading,
    error,
    fetchBookingById,
    createBooking: handleCreateBooking,
    updateBooking: handleUpdateBooking,
    cancelBooking: handleCancelBooking,
    deleteBooking: handleDeleteBooking,
    getAvailableTimeSlots,
    checkAvailability,
    setSelectedBooking,
    clearError,
    refresh
  }
}
