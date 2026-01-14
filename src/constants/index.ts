export const APP_NAME = 'Meeting Room Booking App'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ROOMS: '/rooms',
  BOOKINGS: '/bookings'
} as const

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  INVALID_TIME_RANGE: 'End time must be after start time',
  ROOM_NOT_AVAILABLE: 'Room is not available for the selected time',
  TIME_CONFLICT: 'This time slot conflicts with an existing booking'
} as const

export const BOOKING_STATUS = {
  pending: { label: 'Pending', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'danger' },
  completed: { label: 'Completed', color: 'default' }
} as const

export const ROOM_ROLE_LABELS = {
  admin: 'Admin',
  user: 'User'
} as const
