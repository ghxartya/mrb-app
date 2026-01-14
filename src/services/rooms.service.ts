import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'

import { db } from '@/lib/firebase'

import type {
  AddRoomMemberInput,
  CreateRoomInput,
  Room,
  UpdateRoomInput
} from '@/types'

export async function getRooms(): Promise<Room[]> {
  try {
    const q = query(collection(db, 'rooms'), orderBy('name'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => {
      const data = doc.data()

      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        members: (data.members || []).map((m: any) => ({
          email: m.email,
          role: m.role,
          addedAt: m.addedAt?.toDate() || new Date()
        })),
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      }
    })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    throw new Error('Failed to fetch rooms')
  }
}

export async function getRoomById(id: string): Promise<Room | null> {
  try {
    const docRef = doc(db, 'rooms', id)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) return null
    const data = snapshot.data()

    return {
      id: snapshot.id,
      name: data.name,
      description: data.description,
      members: (data.members || []).map((m: any) => ({
        email: m.email,
        role: m.role,
        addedAt: m.addedAt?.toDate() || new Date()
      })),
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
  } catch (error) {
    console.error('Error fetching room:', error)
    return null
  }
}

export async function createRoom(
  input: CreateRoomInput,
  userId: string
): Promise<Room> {
  try {
    const docRef = await addDoc(collection(db, 'rooms'), {
      ...input,
      members: [],
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    const room = await getRoomById(docRef.id)
    if (!room) throw new Error('Failed to create room')

    return room
  } catch (error) {
    console.error('Error creating room:', error)
    throw new Error('Failed to create room')
  }
}

export async function updateRoom(input: UpdateRoomInput): Promise<Room> {
  try {
    const { id, ...data } = input
    const docRef = doc(db, 'rooms', id)

    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })

    const room = await getRoomById(id)
    if (!room) throw new Error('Room not found')

    return room
  } catch (error) {
    console.error('Error updating room:', error)
    throw new Error('Failed to update room')
  }
}

export async function deleteRoom(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'rooms', id))
  } catch (error) {
    console.error('Error deleting room:', error)
    throw new Error('Failed to delete room')
  }
}

export async function addRoomMember(input: AddRoomMemberInput): Promise<Room> {
  try {
    const { roomId, email, role } = input
    const room = await getRoomById(roomId)

    if (!room) throw new Error('Room not found')

    if (room.members.some(m => m.email === email)) {
      throw new Error('User is already a member of this room')
    }

    const newMember = {
      email,
      role,
      addedAt: serverTimestamp()
    }

    const docRef = doc(db, 'rooms', roomId)
    await updateDoc(docRef, {
      members: arrayUnion(newMember),
      updatedAt: serverTimestamp()
    })

    const updatedRoom = await getRoomById(roomId)
    if (!updatedRoom) throw new Error('Failed to add member')

    return updatedRoom
  } catch (error) {
    console.error('Error adding room member:', error)
    throw error instanceof Error ? error : new Error('Failed to add member')
  }
}

export async function removeRoomMember(
  roomId: string,
  memberEmail: string
): Promise<Room> {
  try {
    const room = await getRoomById(roomId)
    if (!room) throw new Error('Room not found')

    const memberToRemove = room.members.find(m => m.email === memberEmail)
    if (!memberToRemove) throw new Error('Member not found')

    const docRef = doc(db, 'rooms', roomId)
    await updateDoc(docRef, {
      members: arrayRemove(memberToRemove),
      updatedAt: serverTimestamp()
    })

    const updatedRoom = await getRoomById(roomId)
    if (!updatedRoom) throw new Error('Failed to remove member')

    return updatedRoom
  } catch (error) {
    console.error('Error removing room member:', error)
    throw new Error('Failed to remove member')
  }
}

export function getUserRoleInRoom(
  room: Room,
  userEmail: string | null
): 'admin' | 'user' | null {
  if (!userEmail) return null
  const member = room.members.find(m => m.email === userEmail)
  return member?.role || null
}

export function canManageRoom(
  room: Room,
  userId: string,
  userEmail: string | null
): boolean {
  if (room.createdBy === userId) return true
  const role = getUserRoleInRoom(room, userEmail)
  return role === 'admin'
}
