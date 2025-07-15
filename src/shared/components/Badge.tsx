import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils/lib"

import { BadgeVariants } from "./BadgeVariants"


export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof BadgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(BadgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge }
