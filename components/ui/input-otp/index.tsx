'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { Minus } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

/* ─── InputOTP ──────────────────────────────────────────── */
const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-2 has-[:disabled]:opacity-50',
      containerClassName
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
));
InputOTP.displayName = 'InputOTP';

/* ─── InputOTPGroup ─────────────────────────────────────── */
const InputOTPGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
InputOTPGroup.displayName = 'InputOTPGroup';

/* ─── InputOTPSlot ──────────────────────────────────────── */
const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        // base slot styles — Discord-flavoured dark box
        'relative flex h-14 w-12 items-center justify-center',
        'border-y border-r border-[#3f4147] text-xl font-semibold',
        'text-[#f2f3f5] bg-[#1e1f22]',
        'transition-all duration-150',
        // first slot rounded left, last rounded right — handled by group container
        'first:rounded-l-md first:border-l',
        'last:rounded-r-md',
        // active ring (Discord brand purple)
        isActive && 'z-10 ring-2 ring-[#5865F2] border-[#5865F2]',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-5 w-px bg-[#f2f3f5] duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

/* ─── InputOTPSeparator ─────────────────────────────────── */
const InputOTPSeparator = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus className="text-[#949ba4]" size={16} />
  </div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
