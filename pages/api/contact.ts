import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
      } else {
        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
          to: 'sethie74@gmail.com', // Change to your recipient
          from: 'seth@sethmarc.us', // Change to your verified sender
          subject: req.body.subject,
          text: `Name: ${req.body.name} Email: ${req.body.email} Message: ${req.body.message}`,
          html: req.body.message,
        }
        sgMail
          .send(msg)
          .then(() => {
            console.log('Email sent')
          })
          .catch((error: any) => {
            console.error(error)
          })
        res.status(200).json({ message: 'Success' })
      }
  
}
