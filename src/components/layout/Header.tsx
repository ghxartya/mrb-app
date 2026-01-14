'use client'

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle
} from '@heroui/react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { APP_NAME, ROUTES } from '@/constants'
import { useAuth } from '@/hooks'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { label: 'Rooms', href: ROUTES.ROOMS },
    { label: 'Bookings', href: ROUTES.BOOKINGS }
  ]

  return (
    <Navbar
      maxWidth='xl'
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className='sm:hidden'
        />
        <NavbarBrand>
          <Link
            href={isAuthenticated ? ROUTES.ROOMS : ROUTES.HOME}
            className='font-bold text-inherit'
          >
            {APP_NAME}
          </Link>
        </NavbarBrand>
      </NavbarContent>
      {isAuthenticated && (
        <NavbarContent className='hidden gap-4 sm:flex' justify='center'>
          {menuItems.map(item => (
            <NavbarItem key={item.href} isActive={pathname === item.href}>
              <Link
                color={pathname === item.href ? 'primary' : 'foreground'}
                href={item.href}
                className={
                  pathname === item.href
                    ? 'text-primary font-medium'
                    : 'text-foreground'
                }
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
      )}
      <NavbarContent justify='end'>
        {isAuthenticated ? (
          <NavbarItem>
            <Dropdown placement='bottom-end'>
              <DropdownTrigger>
                <Avatar
                  as='button'
                  className='transition-transform'
                  size='sm'
                  name={user?.displayName || user?.email || 'User'}
                  src={user?.photoURL || undefined}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label='Profile Actions' variant='flat'>
                <DropdownItem key='profile' className='h-14 gap-2'>
                  <p className='font-semibold'>Signed in as</p>
                  <p className='font-semibold'>{user?.email}</p>
                </DropdownItem>
                <DropdownItem
                  key='logout'
                  color='danger'
                  onPress={() => logout()}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          <>
            <NavbarItem className='hidden lg:flex'>
              <Link href={ROUTES.LOGIN}>
                <Button variant='flat'>Login</Button>
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link href={ROUTES.REGISTER}>
                <Button color='primary'>Sign Up</Button>
              </Link>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map(item => (
          <NavbarMenuItem key={item.href}>
            <Link
              color={pathname === item.href ? 'primary' : 'foreground'}
              className='w-full'
              href={item.href}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Button
            color='danger'
            variant='flat'
            className='w-full'
            onPress={() => logout()}
          >
            Log Out
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}
