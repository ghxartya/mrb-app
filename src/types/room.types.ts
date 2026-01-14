export type RoomMemberRole = 'admin' | 'user'

export interface RoomMember {
  email: string
  role: RoomMemberRole
  addedAt: Date
}

export interface Room {
  id: string
  name: string
  description: string
  members: RoomMember[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface RoomState {
  rooms: Room[]
  selectedRoom: Room | null
  filters: RoomFilters
  isLoading: boolean
  error: string | null
}

export interface RoomFilters {
  name?: string
}

export interface CreateRoomInput {
  name: string
  description: string
}

export interface UpdateRoomInput {
  id: string
  name?: string
  description?: string
}

export interface AddRoomMemberInput {
  roomId: string
  email: string
  role: RoomMemberRole
}
