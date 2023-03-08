import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from "cors";
const cors = Cors({
    methods: ["POST", "HEAD"],
  });
  
  // Helper method to wait for a middleware to execute before continuing
  // And to throw an error when an error happens in a middleware
  function runMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    fn: Function
  ) {
    return new Promise((resolve, reject) => {
      fn(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
  
        return resolve(result);
      });
    });
  }
type Data = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    await runMiddleware(req, res, cors);
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
          html: `Name: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`,
          text: `Name: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`
        }
        sgMail
          .send(msg)
          .then(() => {
            res.status(200).json({ message: 'Email Sent' })
          })
          .catch((error: any) => {
            console.error(error)
            res.status(400).json({ message: error })
          })
        
      }
  
}
