import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <div className="relative">
        <div className={cn(
          'animate-spin rounded-full border-2 border-muted border-t-primary',
          sizeClasses[size]
        )} />
        <div className={cn(
          'absolute inset-0 animate-ping rounded-full border border-primary/20',
          sizeClasses[size]
        )} />
      </div>
      {text && (
        <span className="text-muted-foreground animate-pulse">{text}</span>
      )}
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="card-modern p-6 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-muted rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded w-full" />
            <div className="h-2 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
      <div className="mt-6 h-10 bg-muted rounded-lg" />
    </div>
  )
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-muted rounded', className)} />
  )
}
