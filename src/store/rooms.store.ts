import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import * as roomsService from '@/services'
import type {
  CreateRoomInput,
  Room,
  RoomFilters,
  RoomState,
  UpdateRoomInput
} from '@/types'

interface RoomsActions {
  fetchRooms: () => Promise<void>
  fetchRoomById: (id: string) => Promise<void>
  createRoom: (input: CreateRoomInput, userId: string) => Promise<Room | null>
  updateRoom: (input: UpdateRoomInput) => Promise<Room | null>
  deleteRoom: (id: string) => Promise<boolean>
  addRoomMember: (
    roomId: string,
    email: string,
    role: 'admin' | 'user'
  ) => Promise<Room | null>
  removeRoomMember: (roomId: string, email: string) => Promise<Room | null>
  setFilters: (filters: RoomFilters) => void
  clearFilters: () => void
  setSelectedRoom: (room: Room | null) => void
  clearError: () => void
}

type RoomsStore = RoomState & RoomsActions

const initialState: RoomState = {
  rooms: [],
  selectedRoom: null,
  filters: {},
  isLoading: false,
  error: null
}

export const useRoomsStore = create<RoomsStore>()(
  devtools(
    (set, _get) => ({
      ...initialState,
      fetchRooms: async () => {
        set({ isLoading: true, error: null })
        try {
          const rooms = await roomsService.getRooms()
          set({ rooms, isLoading: false })
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch rooms',
            isLoading: false
          })
        }
      },
      fetchRoomById: async id => {
        set({ isLoading: true, error: null })
        try {
          const room = await roomsService.getRoomById(id)
          set({ selectedRoom: room, isLoading: false })
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch room',
            isLoading: false
          })
        }
      },
      createRoom: async (input, userId) => {
        set({ isLoading: true, error: null })
        try {
          const room = await roomsService.createRoom(input, userId)
          set(state => ({
            rooms: [...state.rooms, room],
            isLoading: false
          }))
          return room
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to create room',
            isLoading: false
          })
          return null
        }
      },
      updateRoom: async input => {
        set({ isLoading: true, error: null })
        try {
          const room = await roomsService.updateRoom(input)
          set(state => ({
            rooms: state.rooms.map(r => (r.id === room.id ? room : r)),
            selectedRoom:
              state.selectedRoom?.id === room.id ? room : state.selectedRoom,
            isLoading: false
          }))
          return room
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to update room',
            isLoading: false
          })
          return null
        }
      },
      deleteRoom: async id => {
        set({ isLoading: true, error: null })
        try {
          await roomsService.deleteRoom(id)
          set(state => ({
            rooms: state.rooms.filter(r => r.id !== id),
            selectedRoom:
              state.selectedRoom?.id === id ? null : state.selectedRoom,
            isLoading: false
          }))
          return true
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to delete room',
            isLoading: false
          })
          return false
        }
      },
      addRoomMember: async (roomId, email, role) => {
        set({ isLoading: true, error: null })
        try {
          const room = await roomsService.addRoomMember({ roomId, email, role })
          set(state => ({
            rooms: state.rooms.map(r => (r.id === room.id ? room : r)),
            selectedRoom:
              state.selectedRoom?.id === room.id ? room : state.selectedRoom,
            isLoading: false
          }))
          return room
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to add room member',
            isLoading: false
          })
          return null
        }
      },
      removeRoomMember: async (roomId, email) => {
        set({ isLoading: true, error: null })
        try {
          const room = await roomsService.removeRoomMember(roomId, email)
          set(state => ({
            rooms: state.rooms.map(r => (r.id === room.id ? room : r)),
            selectedRoom:
              state.selectedRoom?.id === room.id ? room : state.selectedRoom,
            isLoading: false
          }))
          return room
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to remove room member',
            isLoading: false
          })
          return null
        }
      },
      setFilters: filters =>
        set(state => ({
          filters: { ...state.filters, ...filters }
        })),
      clearFilters: () => set({ filters: {} }),
      setSelectedRoom: room => set({ selectedRoom: room }),
      clearError: () => set({ error: null })
    }),
    { name: 'RoomsStore' }
  )
)
