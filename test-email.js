const nodemailer = require('nodemailer');

async function test() {
  const t = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'yarn8372@gmail.com',
      pass: 'dyobjteyubejhxly'
    }
  });

  try {
    const r = await t.sendMail({
      from: '"PMR PARSTAMA" <yarn8372@gmail.com>',
      to: 'yarn8372@gmail.com',
      subject: 'Test Status Pendaftaran PMR PARSTAMA',
      html: '<div style="background:#0A0A0B;padding:20px;color:white;font-family:sans-serif"><div style="background:rgba(20,20,22,.9);border-radius:16px;border:1px solid rgba(220,38,38,.2);overflow:hidden;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#DC2626,#EF4444);padding:24px;text-align:center"><h1 style="color:#fff;margin:0;font-size:20px">PMR PARSTAMA</h1><p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:13px">SMKN - Status Pendaftaran</p></div><div style="padding:24px"><p style="color:rgba(255,255,255,.7);font-size:14px">Halo Test User,</p><p style="color:rgba(255,255,255,.7);font-size:14px">Status pendaftaran Anda: <strong style="color:#34D399">DITERIMA</strong></p></div></div></div>'
    });
    console.log('OK:', r.messageId);
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}

test();
