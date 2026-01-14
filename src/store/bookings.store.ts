import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import * as bookingsService from '@/services'
import type {
  Booking,
  BookingFilters,
  BookingState,
  BookingWithDetails,
  CreateBookingInput,
  TimeSlot,
  UpdateBookingInput
} from '@/types'

interface BookingsActions {
  fetchBookings: (filters?: BookingFilters) => Promise<void>
  fetchBookingById: (id: string) => Promise<void>
  fetchUserBookings: (userId: string) => Promise<void>
  createBooking: (
    input: CreateBookingInput,
    userId: string
  ) => Promise<Booking | null>
  updateBooking: (input: UpdateBookingInput) => Promise<Booking | null>
  joinBooking: (bookingId: string, userEmail: string) => Promise<Booking | null>
  cancelBooking: (id: string) => Promise<boolean>
  deleteBooking: (id: string) => Promise<boolean>
  getAvailableTimeSlots: (roomId: string, date: Date) => Promise<TimeSlot[]>
  checkAvailability: (
    roomId: string,
    date: Date,
    startTime: string,
    endTime: string
  ) => Promise<boolean>
  setSelectedBooking: (booking: BookingWithDetails | null) => void
  clearError: () => void
}

type BookingsStore = BookingState & BookingsActions

const initialState: BookingState = {
  bookings: [],
  userBookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null
}

export const useBookingsStore = create<BookingsStore>()(
  devtools(
    (set, _get) => ({
      ...initialState,
      fetchBookings: async filters => {
        set({ isLoading: true, error: null })
        try {
          const bookings = await bookingsService.getBookings(filters)
          set({ bookings, isLoading: false })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch bookings',
            isLoading: false
          })
        }
      },
      fetchBookingById: async id => {
        set({ isLoading: true, error: null })
        try {
          const booking = await bookingsService.getBookingById(id)
          set({ selectedBooking: booking, isLoading: false })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch booking',
            isLoading: false
          })
        }
      },
      fetchUserBookings: async userId => {
        set({ isLoading: true, error: null })
        try {
          const userBookings = await bookingsService.getUserBookings(userId)
          set({ userBookings, isLoading: false })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch user bookings',
            isLoading: false
          })
        }
      },
      createBooking: async (input, userId) => {
        set({ isLoading: true, error: null })
        try {
          const booking = await bookingsService.createBooking(input, userId)
          set(state => ({
            bookings: [...state.bookings, booking],
            userBookings: [...state.userBookings, booking],
            isLoading: false
          }))
          return booking
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create booking',
            isLoading: false
          })
          return null
        }
      },
      updateBooking: async input => {
        set({ isLoading: true, error: null })
        try {
          const booking = await bookingsService.updateBooking(input)
          set(state => ({
            bookings: state.bookings.map(b =>
              b.id === booking.id ? booking : b
            ),
            userBookings: state.userBookings.map(b =>
              b.id === booking.id ? booking : b
            ),
            isLoading: false
          }))
          return booking
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update booking',
            isLoading: false
          })
          return null
        }
      },
      joinBooking: async (bookingId, userEmail) => {
        set({ isLoading: true, error: null })
        try {
          const booking = await bookingsService.joinBooking(
            bookingId,
            userEmail
          )
          set(state => ({
            bookings: state.bookings.map(b =>
              b.id === booking.id ? booking : b
            ),
            userBookings: state.userBookings.map(b =>
              b.id === booking.id ? booking : b
            ),
            isLoading: false
          }))
          return booking
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to join booking',
            isLoading: false
          })
          return null
        }
      },
      cancelBooking: async id => {
        set({ isLoading: true, error: null })
        try {
          await bookingsService.cancelBooking(id)
          set(state => ({
            bookings: state.bookings.map(b =>
              b.id === id ? { ...b, status: 'cancelled' as const } : b
            ),
            userBookings: state.userBookings.map(b =>
              b.id === id ? { ...b, status: 'cancelled' as const } : b
            ),
            isLoading: false
          }))
          return true
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to cancel booking',
            isLoading: false
          })
          return false
        }
      },
      deleteBooking: async id => {
        set({ isLoading: true, error: null })
        try {
          await bookingsService.deleteBooking(id)
          set(state => ({
            bookings: state.bookings.filter(b => b.id !== id),
            userBookings: state.userBookings.filter(b => b.id !== id),
            selectedBooking:
              state.selectedBooking?.id === id ? null : state.selectedBooking,
            isLoading: false
          }))
          return true
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete booking',
            isLoading: false
          })
          return false
        }
      },
      getAvailableTimeSlots: async (roomId, date) => {
        try {
          return await bookingsService.getAvailableTimeSlots(roomId, date)
        } catch (error) {
          console.error('Error getting available time slots:', error)
          return []
        }
      },
      checkAvailability: async (roomId, date, startTime, endTime) => {
        try {
          return await bookingsService.checkRoomAvailability(
            roomId,
            date,
            startTime,
            endTime
          )
        } catch (error) {
          console.error('Error checking availability:', error)
          return false
        }
      },
      setSelectedBooking: booking => set({ selectedBooking: booking }),
      clearError: () => set({ error: null })
    }),
    { name: 'BookingsStore' }
  )
)
