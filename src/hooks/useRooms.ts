'use client'

import { useCallback, useEffect } from 'react'

import { useRoomsStore } from '@/store'
import type { CreateRoomInput, UpdateRoomInput } from '@/types'

export function useRooms() {
  const {
    rooms,
    selectedRoom,
    filters,
    isLoading,
    error,
    fetchRooms,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    setFilters,
    clearFilters,
    setSelectedRoom,
    clearError
  } = useRoomsStore()

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const refresh = useCallback(() => {
    fetchRooms()
  }, [fetchRooms])

  const handleCreateRoom = useCallback(
    async (input: CreateRoomInput, userId: string) => {
      const result = await createRoom(input, userId)
      return result
    },
    [createRoom]
  )

  const handleUpdateRoom = useCallback(
    async (input: UpdateRoomInput) => {
      const result = await updateRoom(input)
      return result
    },
    [updateRoom]
  )

  const handleDeleteRoom = useCallback(
    async (id: string) => {
      return await deleteRoom(id)
    },
    [deleteRoom]
  )

  return {
    rooms,
    selectedRoom,
    filters,
    isLoading,
    error,
    fetchRoomById,
    createRoom: handleCreateRoom,
    updateRoom: handleUpdateRoom,
    deleteRoom: handleDeleteRoom,
    setFilters,
    clearFilters,
    setSelectedRoom,
    clearError,
    refresh
  }
}
