const nodemailer = require('nodemailer')

const { MAIL_SERVICE, MAIL_USER, MAIL_PASS, MAIL_FROM } = process.env

const isConfigured = Boolean(MAIL_USER && MAIL_PASS)

const transporter = isConfigured
  ? nodemailer.createTransport({
      service: MAIL_SERVICE || 'hotmail',
      auth: { user: MAIL_USER, pass: MAIL_PASS }
    })
  : null

function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`[mailer skipped] ${subject} -> ${to}`)
    return Promise.resolve({ skipped: true })
  }
  return transporter.sendMail({
    from: MAIL_FROM || MAIL_USER,
    to,
    subject,
    text,
    html
  })
}

module.exports = { transporter, sendMail }
