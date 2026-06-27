const nodemailer = require('nodemailer');

async function test() {
  const t = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: 'yarn8372@gmail.com',
      pass: 'xsmtpsib-46c2185294500a44d14fe865769bd289a926b87cabd85edeb40fc24a81fde5a1-10KOIuDKhVnovJZL'
    }
  });

  try {
    const r = await t.sendMail({
      from: '"PMR PARSTAMA" <yarn8372@gmail.com>',
      to: 'zyzpy27@gmail.com',
      subject: 'Test PMR PARSTAMA via Brevo',
      html: '<div style="font-family:sans-serif;padding:20px"><h2 style="color:#DC2626">PMR PARSTAMA</h2><p>Email test via Brevo SMTP berhasil!</p></div>'
    });
    console.log('OK:', r.messageId);
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}

test();
