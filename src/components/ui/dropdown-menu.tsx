import * as DropDownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import * as React from 'react'

export function DropDownMenu({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitive.Root>) {
  return (
    <DropDownMenuPrimitive.Root data-slot="cusomize-dropdown-menu" {...props} />
  )
}

export function DropDownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitive.Trigger>) {
  return (
    <DropDownMenuPrimitive.Trigger
      data-slot="cusomize-dropdown-menu-trigger"
      {...props}
    />
  )
}

export function DropDownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitive.Portal>) {
  return (
    <DropDownMenuPrimitive.Portal
      data-slot="cusomize-dropdown-menu-portal"
      {...props}
    />
  )
}

export function DropDownMenuContent({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitive.Content>) {
  return (
    <DropDownMenuPrimitive.Content
      data-slot="cusomize-dropdown-menu-content"
      {...props}
    />
  )
}

export function DropDownMenuItem({
  ...props
}: React.ComponentProps<typeof DropDownMenuPrimitive.Item>) {
  return (
    <DropDownMenuPrimitive.Item
      data-slot="cusomize-dropdown-menu-item"
      {...props}
    />
  )
}
