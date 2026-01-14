import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore'

import { db } from '@/lib/firebase'

import type {
  Booking,
  BookingFilters,
  BookingWithDetails,
  CreateBookingInput,
  TimeSlot,
  UpdateBookingInput
} from '@/types'

import { getUserProfile } from './auth.service'
import { getRoomById } from './rooms.service'

const COLLECTION_NAME = 'bookings'

export async function getBookings(
  filters?: BookingFilters
): Promise<Booking[]> {
  try {
    let q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'))

    if (filters?.roomId) {
      q = query(q, where('roomId', '==', filters.roomId))
    }
    if (filters?.userId) {
      q = query(q, where('userId', '==', filters.userId))
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status))
    }

    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() ?? new Date(),
      createdAt: doc.data().createdAt?.toDate() ?? new Date(),
      updatedAt: doc.data().updatedAt?.toDate() ?? new Date()
    })) as Booking[]
  } catch (error) {
    console.error('Error getting bookings:', error)
    throw error
  }
}

export async function getBookingById(
  id: string
): Promise<BookingWithDetails | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()

      const booking: Booking = {
        id: docSnap.id,
        ...data,
        date: data.date?.toDate() ?? new Date(),
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date()
      } as Booking

      const [room, user] = await Promise.all([
        getRoomById(booking.roomId),
        getUserProfile(booking.userId)
      ])

      if (!room || !user) {
        throw new Error('Room or user not found')
      }

      return { ...booking, room, user }
    }
    return null
  } catch (error) {
    console.error('Error getting booking:', error)
    throw error
  }
}

export async function createBooking(
  input: CreateBookingInput,
  userId: string
): Promise<Booking> {
  try {
    const isAvailable = await checkRoomAvailability(
      input.roomId,
      input.date,
      input.startTime,
      input.endTime
    )

    if (!isAvailable) {
      throw new Error('Room is not available for the selected time slot')
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...input,
      userId,
      date: Timestamp.fromDate(input.date),
      status: 'pending',
      attendees: input.attendees ?? [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    const bookings = await getBookings()
    const newBooking = bookings.find(b => b.id === docRef.id)

    if (!newBooking) {
      throw new Error('Failed to create booking')
    }

    return newBooking
  } catch (error) {
    console.error('Error creating booking:', error)
    throw error
  }
}

export async function updateBooking(
  input: UpdateBookingInput
): Promise<Booking> {
  try {
    const { id, ...data } = input
    const docRef = doc(db, COLLECTION_NAME, id)

    const currentBooking = await getBookingById(id)
    if (!currentBooking) {
      throw new Error('Booking not found')
    }

    if (data.date || data.startTime || data.endTime) {
      const checkDate = data.date || currentBooking.date
      const checkStartTime = data.startTime || currentBooking.startTime
      const checkEndTime = data.endTime || currentBooking.endTime

      const isAvailable = await checkRoomAvailability(
        currentBooking.roomId,
        checkDate,
        checkStartTime,
        checkEndTime,
        id
      )

      if (!isAvailable) {
        throw new Error('Room is not available for the selected time slot')
      }
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: serverTimestamp()
    }
    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date)
    }

    await updateDoc(docRef, updateData)

    const bookings = await getBookings()
    const updatedBooking = bookings.find(b => b.id === id)

    if (!updatedBooking) {
      throw new Error('Failed to update booking')
    }

    return updatedBooking
  } catch (error) {
    console.error('Error updating booking:', error)
    throw error
  }
}

export async function joinBooking(
  bookingId: string,
  userEmail: string
): Promise<Booking> {
  try {
    const booking = await getBookingById(bookingId)
    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.attendees.includes(userEmail)) {
      throw new Error('User is already an attendee of this booking')
    }

    const docRef = doc(db, COLLECTION_NAME, bookingId)
    await updateDoc(docRef, {
      attendees: [...booking.attendees, userEmail],
      updatedAt: serverTimestamp()
    })

    const bookings = await getBookings()
    const updatedBooking = bookings.find(b => b.id === bookingId)

    if (!updatedBooking) {
      throw new Error('Failed to join booking')
    }

    return updatedBooking
  } catch (error) {
    console.error('Error joining booking:', error)
    throw error
  }
}

export async function cancelBooking(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    throw error
  }
}

export async function deleteBooking(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting booking:', error)
    throw error
  }
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  return getBookings({ userId })
}

export async function getRoomBookings(
  roomId: string,
  date: Date
): Promise<Booking[]> {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const q = query(
      collection(db, COLLECTION_NAME),
      where('roomId', '==', roomId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay)),
      where('status', 'in', ['pending', 'confirmed'])
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() ?? new Date(),
      createdAt: doc.data().createdAt?.toDate() ?? new Date(),
      updatedAt: doc.data().updatedAt?.toDate() ?? new Date()
    })) as Booking[]
  } catch (error) {
    console.error('Error getting room bookings:', error)
    throw error
  }
}

export async function checkRoomAvailability(
  roomId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> {
  const bookings = await getRoomBookings(roomId, date)

  for (const booking of bookings) {
    if (excludeBookingId && booking.id === excludeBookingId) {
      continue
    }

    if (
      (startTime >= booking.startTime && startTime < booking.endTime) ||
      (endTime > booking.startTime && endTime <= booking.endTime) ||
      (startTime <= booking.startTime && endTime >= booking.endTime)
    ) {
      return false
    }
  }

  return true
}

export async function getAvailableTimeSlots(
  roomId: string,
  date: Date
): Promise<TimeSlot[]> {
  const bookings = await getRoomBookings(roomId, date)
  const timeSlots: TimeSlot[] = []

  const startHour = 8
  const endHour = 18

  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`

    const isBooked = bookings.some(
      booking =>
        (startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime)
    )

    timeSlots.push({
      startTime,
      endTime,
      isAvailable: !isBooked
    })
  }

  return timeSlots
}
