import type { User } from './auth.types'
import type { Room } from './room.types'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Booking {
  id: string
  roomId: string
  userId: string
  title: string
  description?: string
  date: Date
  startTime: string
  endTime: string
  status: BookingStatus
  attendees: string[]
  createdAt: Date
  updatedAt: Date
}

export interface BookingWithDetails extends Booking {
  room: Room
  user: User
}

export interface BookingState {
  bookings: Booking[]
  userBookings: Booking[]
  selectedBooking: BookingWithDetails | null
  isLoading: boolean
  error: string | null
}

export interface CreateBookingInput {
  roomId: string
  title: string
  description?: string
  date: Date
  startTime: string
  endTime: string
  attendees?: string[]
}

export interface UpdateBookingInput {
  id: string
  title?: string
  description?: string
  date?: Date
  startTime?: string
  endTime?: string
  status?: BookingStatus
  attendees?: string[]
}

export interface BookingFilters {
  roomId?: string
  userId?: string
  status?: BookingStatus
  dateFrom?: Date
  dateTo?: Date
}

export interface TimeSlot {
  startTime: string
  endTime: string
  isAvailable: boolean
}
