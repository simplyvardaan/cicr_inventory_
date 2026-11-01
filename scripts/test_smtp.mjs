import nodemailer from 'nodemailer';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val;
  }
}

console.log('Testing SMTP configuration:');
console.log('Host:', env.SMTP_HOST);
console.log('Port:', env.SMTP_PORT);
console.log('Secure:', env.SMTP_SECURE);
console.log('User:', env.SMTP_USER);
console.log('Pass length:', env.SMTP_PASS ? env.SMTP_PASS.length : 0);
console.log('From:', env.SMTP_FROM);

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(env.SMTP_PORT) || 465,
  secure: env.SMTP_SECURE === 'true' || Number(env.SMTP_PORT) === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS?.replace(/\s+/g, ''), // Google app passwords often have spaces like "abcd efgh ijkl mnop"
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 8000,
});

async function testSmtp() {
  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SUCCESS: SMTP connection verified!');
  } catch (err) {
    console.error('FAILED to verify SMTP connection:', err);
  }
}

testSmtp();

