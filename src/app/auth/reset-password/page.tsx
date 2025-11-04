'use client'
import React, { Suspense } from 'react'
import ResetPasswordView from '@/views/Login/ResetPassword'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordView />
    </Suspense>
  )
}
