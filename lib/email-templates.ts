export function getPasswordResetEmailTemplate(resetUrl: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password - Vyloz Premium Zone</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .reset-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          text-align: center;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .reset-button:hover {
          transform: translateY(-2px);
        }
        .warning {
          background: #fef3cd;
          border: 1px solid #fecaca;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .security-tips {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .security-tips h4 {
          color: #0369a1;
          margin-top: 0;
        }
        .security-tips ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .security-tips li {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛍️ Vyloz Premium Zone</div>
          <h1 class="title">Reset Password Anda</h1>
        </div>
        
        <div class="content">
          <p>Halo <strong>${userName}</strong>,</p>
          
          <p>Kami menerima permintaan untuk mereset password akun Anda. Jika Anda yang melakukan permintaan ini, silakan klik tombol di bawah untuk membuat password baru:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="reset-button">
              🔐 Reset Password Sekarang
            </a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Penting:</strong>
            <ul>
              <li>Link ini hanya berlaku selama <strong>1 jam</strong></li>
              <li>Link hanya dapat digunakan <strong>satu kali</strong></li>
              <li>Jika tidak digunakan, link akan otomatis kedaluwarsa</li>
            </ul>
          </div>
          
          <p>Jika tombol di atas tidak berfungsi, Anda dapat menyalin dan menempel URL berikut ke browser Anda:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <div class="security-tips">
            <h4>💡 Tips Keamanan:</h4>
            <ul>
              <li>Gunakan password yang kuat (minimal 8 karakter)</li>
              <li>Kombinasikan huruf besar, kecil, angka, dan simbol</li>
              <li>Jangan gunakan password yang sama dengan akun lain</li>
              <li>Jangan bagikan password Anda kepada siapapun</li>
            </ul>
          </div>
          
          <p><strong>Tidak meminta reset password?</strong><br>
          Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tetap aman dan tidak akan berubah.</p>
        </div>
        
        <div class="footer">
          <p>Email ini dikirim secara otomatis, mohon jangan membalas.</p>
          <p>© 2024 Vyloz Premium Zone. Semua hak dilindungi.</p>
          <p>Jika Anda memiliki pertanyaan, hubungi kami di support@premiumstore.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Reset Password - Vyloz Premium Zone
    
    Halo ${userName},
    
    Kami menerima permintaan untuk mereset password akun Anda.
    
    Klik link berikut untuk reset password:
    ${resetUrl}
    
    Link ini berlaku selama 1 jam dan hanya dapat digunakan sekali.
    
    Jika Anda tidak meminta reset password, abaikan email ini.
    
    © 2024 Vyloz Premium Zone
  `

  return { html, text }
}

export function getPasswordResetSuccessTemplate(userName: string) {
  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Berhasil Direset - Vyloz Premium Zone</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 10px;
        }
        .success-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .title {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .success-message {
          background: #d1fae5;
          border: 1px solid #a7f3d0;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛍️ Vyloz Premium Zone</div>
          <div class="success-icon">✅</div>
          <h1 class="title">Password Berhasil Direset!</h1>
        </div>
        
        <div class="success-message">
          <h3>🎉 Selamat ${userName}!</h3>
          <p>Password Anda telah berhasil direset. Sekarang Anda dapat login dengan password baru Anda.</p>
        </div>
        
        <div class="content">
          <p>Untuk keamanan akun Anda:</p>
          <ul>
            <li>Pastikan password baru Anda aman dan mudah diingat</li>
            <li>Jangan bagikan password kepada siapapun</li>
            <li>Logout dari semua perangkat lain jika diperlukan</li>
          </ul>
          
          <p>Jika Anda tidak melakukan perubahan password ini, segera hubungi tim support kami.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Vyloz Premium Zone. Semua hak dilindungi.</p>
          <p>Jika Anda memiliki pertanyaan, hubungi kami di rivaz.store15@gmail.com
</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Password Berhasil Direset - Vyloz Premium Zone
    
    Selamat ${userName}!
    
    Password Anda telah berhasil direset. Sekarang Anda dapat login dengan password baru Anda.
    
    Untuk keamanan akun Anda:
    - Pastikan password baru Anda aman dan mudah diingat
    - Jangan bagikan password kepada siapapun
    - Logout dari semua perangkat lain jika diperlukan
    
    Jika Anda tidak melakukan perubahan password ini, segera hubungi tim support kami.
    
    © 2024 Vyloz Premium Zone
  `

  return { html, text }
}
