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
  Textarea,
  useDisclosure
} from '@heroui/react'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ROOM_ROLE_LABELS, VALIDATION_MESSAGES } from '@/constants'
import { useAuth } from '@/hooks'
import { useRoomsStore } from '@/store'
import type {
  CreateRoomInput,
  Room,
  RoomMember,
  UpdateRoomInput
} from '@/types'

type ModalType = 'create' | 'edit' | 'members' | null

export default function RoomsPage() {
  const { user } = useAuth()
  const {
    rooms,
    isLoading,
    error,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    addRoomMember,
    removeRoomMember,
    clearError
  } = useRoomsStore()

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'user'>('user')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CreateRoomInput | UpdateRoomInput>()

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  useEffect(() => {
    if (modalType === 'edit' && selectedRoom) {
      setValue('name', selectedRoom.name)
      setValue('description', selectedRoom.description)
    } else if (modalType === 'create') {
      reset()
    }
  }, [modalType, selectedRoom, setValue, reset])

  const handleOpenCreate = () => {
    setModalType('create')
    setSelectedRoom(null)
    reset()
    onOpen()
  }

  const handleOpenEdit = (room: Room) => {
    setModalType('edit')
    setSelectedRoom(room)
    onOpen()
  }

  const handleOpenMembers = (room: Room) => {
    setModalType('members')
    setSelectedRoom(room)
    setNewMemberEmail('')
    setNewMemberRole('user')
    onOpen()
  }

  const onSubmit = async (data: CreateRoomInput | UpdateRoomInput) => {
    if (!user?.uid) return

    clearError()
    if (modalType === 'create') {
      const success = await createRoom(data as CreateRoomInput, user.uid)
      if (success) {
        onClose()
        reset()
        setModalType(null)
      }
    } else if (modalType === 'edit' && selectedRoom) {
      const success = await updateRoom({
        id: selectedRoom.id,
        ...data
      } as UpdateRoomInput)
      if (success) {
        onClose()
        reset()
        setModalType(null)
        setSelectedRoom(null)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      await deleteRoom(id)
    }
  }

  const handleAddMember = async () => {
    if (!selectedRoom || !newMemberEmail) return

    const success = await addRoomMember(
      selectedRoom.id,
      newMemberEmail,
      newMemberRole
    )
    if (success) {
      setNewMemberEmail('')
      setNewMemberRole('user')
      const updatedRoom = rooms.find(r => r.id === selectedRoom.id)
      if (updatedRoom) {
        setSelectedRoom(updatedRoom)
      }
    }
  }

  const handleRemoveMember = async (email: string) => {
    if (!selectedRoom) return

    if (confirm(`Are you sure you want to remove ${email} from this room?`)) {
      const success = await removeRoomMember(selectedRoom.id, email)
      if (success) {
        const updatedRoom = rooms.find(r => r.id === selectedRoom.id)
        if (updatedRoom) {
          setSelectedRoom(updatedRoom)
        }
      }
    }
  }

  const canManageMembers = (room: Room): boolean => {
    if (!user?.email) return false
    if (room.createdBy === user.uid) return true
    const member = room.members.find(m => m.email === user.email)
    return member?.role === 'admin'
  }

  const canDelete = (room: Room): boolean => {
    return user?.uid === room.createdBy
  }

  const filteredRooms = rooms.filter(
    room =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Meeting Rooms</h1>
          <p className='text-default-500 mt-1'>
            Manage your meeting rooms and members
          </p>
        </div>
        <Button color='primary' onPress={handleOpenCreate}>
          Add New Room
        </Button>
      </div>
      <div className='mb-6'>
        <Input
          placeholder='Search rooms...'
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
      {!isLoading && filteredRooms.length === 0 && (
        <div className='py-12 text-center'>
          <p className='text-default-500 text-lg'>
            {searchQuery
              ? 'No rooms found matching your search'
              : 'No rooms available. Add your first room to get started.'}
          </p>
        </div>
      )}
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {filteredRooms.map(room => (
          <Card key={room.id} className='w-full'>
            <CardHeader className='flex-col items-start gap-2'>
              <div className='flex w-full items-center justify-between'>
                <h3 className='text-xl font-semibold'>{room.name}</h3>
                <Chip size='sm' variant='flat' color='primary'>
                  {room.members.length} member
                  {room.members.length !== 1 ? 's' : ''}
                </Chip>
              </div>
              <p className='text-default-500 text-sm'>{room.description}</p>
            </CardHeader>
            <CardBody className='gap-3'>
              <div className='flex items-center gap-2'>
                <span className='text-default-500 text-sm'>Created by:</span>
                <span className='text-sm font-medium'>
                  {room.createdBy === user?.uid ? 'You' : 'Another user'}
                </span>
              </div>
            </CardBody>
            <CardFooter className='flex flex-col gap-2'>
              <div className='flex w-full gap-2'>
                <Button
                  size='sm'
                  variant='flat'
                  onPress={() => handleOpenEdit(room)}
                  className='flex-1'
                  isDisabled={!canManageMembers(room)}
                >
                  Edit
                </Button>
                <Button
                  size='sm'
                  color='danger'
                  variant='flat'
                  onPress={() => handleDelete(room.id)}
                  className='flex-1'
                  isDisabled={!canDelete(room)}
                >
                  Delete
                </Button>
              </div>
              {canManageMembers(room) && (
                <Button
                  size='sm'
                  variant='bordered'
                  onPress={() => handleOpenMembers(room)}
                  className='w-full'
                >
                  Manage Members
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <Modal
        isOpen={isOpen && (modalType === 'create' || modalType === 'edit')}
        onOpenChange={onOpenChange}
        placement='center'
        scrollBehavior='inside'
      >
        <ModalContent>
          {onClose => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>
                {modalType === 'create' ? 'Create New Room' : 'Edit Room'}
              </ModalHeader>
              <ModalBody className='gap-4'>
                <Input
                  {...register('name', {
                    required: VALIDATION_MESSAGES.REQUIRED
                  })}
                  label='Room Name'
                  placeholder='e.g., Conference Room A'
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />
                <Textarea
                  {...register('description', {
                    required: VALIDATION_MESSAGES.REQUIRED
                  })}
                  label='Description'
                  placeholder='Describe the room'
                  isInvalid={!!errors.description}
                  errorMessage={errors.description?.message}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant='flat' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='primary' type='submit' isLoading={isLoading}>
                  {modalType === 'create' ? 'Create' : 'Update'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpen && modalType === 'members'}
        onOpenChange={onOpenChange}
        placement='center'
        scrollBehavior='inside'
        size='2xl'
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>Manage Room Members</ModalHeader>
              <ModalBody className='gap-4'>
                {selectedRoom && (
                  <>
                    <div>
                      <h4 className='mb-3 text-sm font-semibold'>
                        Add New Member
                      </h4>
                      <div className='flex gap-2'>
                        <Input
                          placeholder='Email address'
                          value={newMemberEmail}
                          onValueChange={setNewMemberEmail}
                          className='flex-1'
                        />
                        <Select
                          selectedKeys={[newMemberRole]}
                          onSelectionChange={keys => {
                            const selected = Array.from(keys)[0]
                            setNewMemberRole(selected as 'admin' | 'user')
                          }}
                          className='w-32'
                          aria-label='Member role'
                        >
                          <SelectItem key='user'>User</SelectItem>
                          <SelectItem key='admin'>Admin</SelectItem>
                        </Select>
                        <Button
                          color='primary'
                          onPress={handleAddMember}
                          isLoading={isLoading}
                          isDisabled={!newMemberEmail}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className='mb-3 text-sm font-semibold'>
                        Current Members ({selectedRoom.members.length})
                      </h4>
                      {selectedRoom.members.length === 0 ? (
                        <p className='text-default-400 text-sm'>
                          No members yet. Add members to give them access to
                          this room.
                        </p>
                      ) : (
                        <div className='flex flex-col gap-2'>
                          {selectedRoom.members.map((member: RoomMember) => (
                            <Card key={member.email} className='w-full'>
                              <CardBody className='flex flex-row items-center justify-between py-3'>
                                <div className='flex flex-col gap-1'>
                                  <span className='text-sm font-medium'>
                                    {member.email}
                                  </span>
                                  <div className='flex items-center gap-2'>
                                    <Chip
                                      size='sm'
                                      variant='flat'
                                      color={
                                        member.role === 'admin'
                                          ? 'primary'
                                          : 'default'
                                      }
                                    >
                                      {ROOM_ROLE_LABELS[member.role]}
                                    </Chip>
                                    <span className='text-default-400 text-xs'>
                                      Added{' '}
                                      {new Date(
                                        member.addedAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size='sm'
                                  color='danger'
                                  variant='flat'
                                  onPress={() =>
                                    handleRemoveMember(member.email)
                                  }
                                  isLoading={isLoading}
                                >
                                  Remove
                                </Button>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='flat' onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
