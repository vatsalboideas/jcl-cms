// // Delete entries older than specified days
// import { Payload } from 'payload'
// import path from 'path'
// import fs from 'fs'

// const DAYS_TO_KEEP = 1 // Keep entries for 1 day

// export const cleanupOldEntries = async () => {
//   const date = new Date()
//   date.setDate(date.getDate() - DAYS_TO_KEEP)

//   try {
//     // Delete old CareerForms entries and their files
//     const oldCareerForms = await payloadClient.find({
//       collection: 'careerforms',
//       where: {
//         createdAt: {
//           less_than: date.toISOString(),
//         },
//       },
//     })

//     console.log(`Found ${oldCareerForms.docs.length} career forms to delete`)

//     for (const form of oldCareerForms.docs) {
//       if (form.resume) {
//         const mediaDoc = await payloadClient.findByID({
//           collection: 'media',
//           id: form.resume,
//         })

//         if (mediaDoc?.filename) {
//           // Delete the actual file
//           const filePath = path.join(process.cwd(), 'uploads', mediaDoc.filename)
//           if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath)
//             console.log(`Deleted file: ${mediaDoc.filename}`)
//           }

//           // Delete the media document
//           await payloadClient.delete({
//             collection: 'media',
//             id: form.resume,
//           })
//           console.log(`Deleted media document: ${form.resume}`)
//         }
//       }

//       // Delete the career form entry
//       await payloadClient.delete({
//         collection: 'careerforms',
//         id: form.id,
//       })
//       console.log(`Deleted career form: ${form.id}`)
//     }

//     // Delete old ContactForm entries
//     const oldContactForms = await payloadClient.find({
//       collection: 'contactforms',
//       where: {
//         createdAt: {
//           less_than: date.toISOString(),
//         },
//       },
//     })

//     console.log(`Found ${oldContactForms.docs.length} contact forms to delete`)

//     for (const form of oldContactForms.docs) {
//       await payloadClient.delete({
//         collection: 'contactforms',
//         id: form.id,
//       })
//       console.log(`Deleted contact form: ${form.id}`)
//     }

//     console.log(`Successfully cleaned up entries older than ${DAYS_TO_KEEP} days`)
//   } catch (error) {
//     console.error('Error cleaning up old entries:', error)
//     throw error
//   }
// }
