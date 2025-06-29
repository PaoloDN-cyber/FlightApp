import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true per SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Funzione di supporto per le funzioni a seguire e ripresa anche per inviare conferma del biglietto

export async function sendMail(mailOptions: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  return transporter.sendMail({
    from: `"FlightApp" <${process.env.SMTP_USER}>`,
    ...mailOptions
  });
}

// Funzione che invia una email di approvazione alla richiesta di una compagnia aerea 
// con un messaggio di benvenuto assieme ad una passwoord temporanea

export async function sendAirlineApprovalEmail(to: string, tempPassword: string) {
  const info = await transporter.sendMail({
    from: `"FlightBook Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: "Account compagnia approvato",
    text: `La tua richiesta come compagnia è stata approvata!\n\nEmail: ${to}\nPassword temporanea: ${tempPassword}\n\nAccedi e cambia la password.`,
    html: `
      <h2>Benvenuto su FlightBook!</h2>
      <p>La tua richiesta è stata <strong>approvata</strong>.</p>
      <p><strong>Credenziali temporanee:</strong></p>
      <ul>
        <li>Email: ${to}</li>
        <li>Password: <code>${tempPassword}</code></li>
      </ul>
      <p>Accedi e cambia subito la password.</p>
    `
  });
}


// Funzione che invia una email di rifiuto alla richiesta di una compagnia aerea

export async function sendAirlineRejectionEmail(to: string) {
  const info = await transporter.sendMail({
    from: `"FlightBook Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: "Richiesta compagnia rifiutata",
    text: `La tua richiesta per diventare compagnia su FlightBook è stata rifiutata.\n\nPer eventuali chiarimenti, contatta il supporto.`,
    html: `
      <h2>Gentile utente,</h2>
      <p>La tua richiesta per registrare una compagnia aerea su <strong>FlightBook</strong> è stata <strong>rifiutata</strong>.</p>
      <p>Per ulteriori informazioni puoi contattare il nostro supporto alla email <a>admin@flightapp.com</a> .</p>
      <p>Grazie,<br>Lo staff di FlightBook</p>
    `,
  });
}


// Funzione che invia una email di invito a cambiafre la password alla compagnia aerea

export async function sendReminderEmail(to: string, name: string) {
  const info = await transporter.sendMail({
    from: `"FlightBook Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Promemoria: Cambia la tua password temporanea',
    text: `Ciao ${name},\nHai effettuato l'accesso con una password temporanea.\nPer motivi di sicurezza, ti invitiamo a cambiarla al più presto.\nAccedi al tuo account e vai nella sezione Impostazioni per modificarla.\n\nGrazie,\nIl team di Flight Booking App`,
    html: `
      <p>Ciao <strong>${name}</strong>,</p>
      <p>Hai effettuato l'accesso con una <strong>password temporanea</strong>.</p>
      <p>Per motivi di sicurezza, ti invitiamo a cambiarla al più presto.</p>
      <p>Accedi al tuo account e vai nella sezione <strong>login</strong> per modificarla.</p>
      <br>
      <p>Grazie,<br>Il team di Flight Booking App ✈️</p>    `
  });
}