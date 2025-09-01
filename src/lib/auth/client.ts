import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { twoFactorClient } from 'better-auth/plugins/two-factor/client'

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL}`,
  plugins: [adminClient(), twoFactorClient()],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        // Handle Too many requests error Here
      }
    },
  },
})

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  twoFactor: {
    enable: enableTwoFactor,
    disable: disableTwoFactor,
    verifyTotp: verifyTwoFactor,
    getTotpUri,
    getBackupCodes,
    useBackupCode,
  },
} = authClient

export type Session = typeof authClient.$Infer.Session

authClient.$store.listen('$sessionSignal', async () => {})
