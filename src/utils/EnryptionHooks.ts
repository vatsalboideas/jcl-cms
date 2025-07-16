import { FieldHook } from 'payload'

const encryptKey: FieldHook = ({ req, value }) =>
  value ? req.payload.encrypt(value as string) : undefined
const decryptKey: FieldHook = ({ req, value }) =>
  value ? req.payload.decrypt(value as string) : undefined

const encryptionHooks = {
  beforeChange: [encryptKey],
  afterRead: [decryptKey],
}

export default encryptionHooks
