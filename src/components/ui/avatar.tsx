import { forwardRef, type HTMLAttributes, type ImgHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/**
 * shadcn/ui Avatar composition — Avatar always ships with AvatarFallback,
 * so a failed or missing image still shows the person's initials.
 */
const Avatar = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'relative flex size-10 shrink-0 overflow-hidden rounded-full bg-secondary',
        className,
      )}
      {...props}
    />
  ),
)
Avatar.displayName = 'Avatar'

const AvatarImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt = '', ...props }, ref) => (
    <img ref={ref} alt={alt} className={cn('aspect-square size-full object-cover', className)} {...props} />
  ),
)
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground',
        className,
      )}
      {...props}
    />
  ),
)
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarFallback, AvatarImage }
