// const commonStyles = {
// 	wrapper: `background-color: #f4f4f7; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6;`,
// 	card: `max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);`,
// 	header: `background-color: #2d3748; padding: 24px; text-align: center;`,
// 	headerText: `color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 1px;`,
// 	body: `padding: 40px 30px; color: #4a5568; font-size: 16px;`,
// 	codeBox: `display: block; width: fit-content; margin: 20px auto; background-color: #ebf8ff; color: #2b6cb0; font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 15px 30px; border-radius: 6px; border: 1px dashed #bee3f8;`,
// 	button: `display: inline-block; background-color: #3182ce; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 6px; margin-top: 10px;`,
// 	footer: `text-align: center; font-size: 12px; color: #a0aec0; margin-top: 20px;`
// };

// module.exports.verifyEmailTemplate = `
// <div style="${commonStyles.wrapper}">
//     <div style="${commonStyles.card}">
//         <div style="${commonStyles.header}">
//             <p style="${commonStyles.headerText}">Test</p>
//         </div>
//         <div style="${commonStyles.body}">
//             <h2 style="color: #2d3748; margin-top: 0;">Verify your email</h2>
//             <p>Thank you for signing up for <b>Test</b>! To complete your registration and get started, please use the verification code below.</p>
//             <div style="text-align: center;">
//                 <span style="${commonStyles.codeBox}">{code}</span>
//             </div>
//             <p style="font-size: 14px; color: #718096; text-align: center;">Enter this code in the signup window.</p>
//         </div>
//     </div>
// </div>`;

// module.exports.welcomeEmailTemplate = `
// <div style="${commonStyles.wrapper}">
//     <div style="${commonStyles.card}">
//         <div style="${commonStyles.header}">
//             <p style="${commonStyles.headerText}">Test</p>
//         </div>
//         <div style="${commonStyles.body}">
//             <h2 style="color: #2d3748; margin-top: 0;">Welcome aboard!</h2>
//             <p>Welcome to <b>Test</b>! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.</p>
//             <div style="text-align: center; margin-top: 30px;">
//                 <a href="{loginLink}" style="${commonStyles.button}">Log In to Test</a>
//             </div>
//         </div>
//     </div>
// </div>`;

// module.exports.alreadyRegisteredEmail = `
// <div style="${commonStyles.wrapper}">
//     <div style="${commonStyles.card}">
//         <div style="${commonStyles.header}">
//             <p style="${commonStyles.headerText}">Test</p>
//         </div>
//         <div style="${commonStyles.body}">
//             <h2 style="color: #2d3748; margin-top: 0;">Account Exists</h2>
//             <p>It seems you have already registered with the email <b>{email}</b>.</p>
//             <p>If you forgot your password, please use the "Forgot Password" option on the login page to reset it.</p>
//             <div style="text-align: center; margin-top: 30px;">
//                 <a href="{loginLink}" style="${commonStyles.button}">Log In to Test</a>
//             </div>
//         </div>
//     </div>
// </div>`;

// module.exports.emailExistsTemplate = `
// <div style="${commonStyles.wrapper}">
//     <div style="${commonStyles.card}">
//         <div style="${commonStyles.header}">
//             <p style="${commonStyles.headerText}">Test</p>
//         </div>
//         <div style="${commonStyles.body}">
//             <h2 style="color: #2d3748; margin-top: 0;">Registration Attempt</h2>
//             <p>We noticed an attempt to sign up with <b>{email}</b>, but a <b>Test</b> account already exists for this address.</p>
//             <p>If this was you, please log in below. If you forgot your password, please use the recovery function on the login page.</p>
//             <div style="text-align: center; margin-top: 30px;">
//                 <a href="{loginLink}" style="${commonStyles.button}">Log In to Test</a>
//             </div>
//         </div>
//     </div>
// </div>`;

// module.exports.loginEmailTemplate = `
// <div style="${commonStyles.wrapper}">
//     <div style="${commonStyles.card}">
//         <div style="${commonStyles.header}">
//             <p style="${commonStyles.headerText}">Test</p>
//         </div>
//         <div style="${commonStyles.body}">
//             <h2 style="color: #2d3748; margin-top: 0;">Login Verification</h2>
//             <p><b>Login to your account!</b> Enter the verification code below to access your <b>Test</b> account securely.</p>
//             <div style="text-align: center;">
//                 <span style="${commonStyles.codeBox}">{code}</span>
//             </div>
//             <p style="font-size: 14px; color: #718096; text-align: center;">Please enter this code in the login window.</p>
//         </div>
//     </div>
// </div>`;

// module.exports.resetEmailTemplate = `
// <div style="${commonStyles.wrapper}">
//     <div style="${commonStyles.card}">
//         <div style="${commonStyles.header}">
//             <p style="${commonStyles.headerText}">Test</p>
//         </div>
//         <div style="${commonStyles.body}">
//             <h2 style="color: #2d3748; margin-top: 0;">Password Reset</h2>
//             <p>A password reset has been requested for your <b>Test</b> account. Use this code to set a new password.</p>
//             <div style="text-align: center;">
//                 <span style="${commonStyles.codeBox}">{code}</span>
//             </div>
//             <p style="font-size: 14px; color: #718096; text-align: center; margin-top: 20px;">If you did not request a password reset, please ignore this message.</p>
//         </div>
//     </div>
// </div>`;



// ============================================
// emailTemplates.js
// HTML-шаблони листів. Плейсхолдери: {code}, {email}, {loginLink}
// ============================================

const c = {
    // Загальне
    wrapper: `margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;`,
    outer: `padding:40px 20px;`,
    card: `max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);`,

    // Хедер — темний, як у адмін-панелі
    header: `background-color:#1a1a1a;padding:28px 32px;text-align:center;`,

    // SVG-логотип: вузол-граф (три точки + дві лінії)
    logo: `display:block;margin:0 auto 10px;`,

    // Назва
    siteName: `color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.04em;margin:0;`,
    siteTagline: `color:#6e6e73;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;margin:6px 0 0;`,

    // Тіло
    body: `padding:36px 32px 28px;color:#3a3a3c;font-size:15px;line-height:1.65;`,
    h2: `color:#1a1a1a;font-size:20px;font-weight:700;margin:0 0 16px;letter-spacing:-0.01em;`,
    p: `margin:0 0 14px;`,

    // Код
    codeWrap: `text-align:center;margin:24px 0;`,
    code: `display:inline-block;background:#f0f7ff;color:#1a56db;font-size:28px;font-weight:700;letter-spacing:0.18em;padding:14px 32px;border-radius:8px;border:1px dashed #a4cafe;font-family:'Courier New',Courier,monospace;`,
    codeHint: `font-size:13px;color:#6e6e73;text-align:center;margin:0 0 8px;`,

    // Кнопка
    btnWrap: `text-align:center;margin:28px 0 8px;`,
    btn: `display:inline-block;background-color:#1a1a1a;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:13px 28px;border-radius:8px;letter-spacing:0.01em;`,

    // Розділювач
    divider: `border:none;border-top:1px solid #f0f0f2;margin:24px 0;`,

    // Футер
    footer: `text-align:center;font-size:12px;color:#a1a1a6;padding:0 32px 28px;`,
    footerLink: `color:#6e6e73;text-decoration:none;`,
};

// --- SVG логотип: граф з трьох вузлів ---
// Три кола (вузли) + дві лінії зі стрілками — відображає суть проекту
const logoSVG = `
<svg style="${c.logo}" width="48" height="40" viewBox="0 0 48 40" xmlns="http://www.w3.org/2000/svg">
  <!-- Лінії -->
  <line x1="8" y1="20" x2="24" y2="8"  stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="24" y1="8"  x2="40" y2="20" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="8" y1="20" x2="40" y2="20" stroke="#4b5563" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="3 3"/>
  <!-- Вузли -->
  <circle cx="8"  cy="20" r="5" fill="#3b82f6"/>
  <circle cx="24" cy="8"  r="5" fill="#1a1a1a" stroke="#3b82f6" stroke-width="1.8"/>
  <circle cx="40" cy="20" r="5" fill="#3b82f6"/>
  <!-- Стрілки -->
  <polygon points="22,8 17,4 17,12" fill="#3b82f6"/>
  <polygon points="38,20 33,16 33,24" fill="#3b82f6"/>
</svg>`.trim();

// --- Загальна обгортка ---
const wrap = (content) => `
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${c.wrapper}">
<div style="${c.outer}">
  <div style="${c.card}">

    <!-- Хедер -->
    <div style="${c.header}">
      ${logoSVG}
      <p style="${c.siteName}">Аналіз графів</p>
    </div>

    <!-- Тіло -->
    <div style="${c.body}">
      ${content}
    </div>

    <!-- Футер -->
    <div style="${c.footer}">
      Цей лист надіслано автоматично — відповідати не потрібно.<br>
      &copy; ${new Date().getFullYear()} Аналіз графів
    </div>

  </div>
</div>
</body>
</html>`.trim();

// ============================================
// 1. Підтвердження email при реєстрації
// ============================================
module.exports.verifyEmailTemplate = wrap(`
  <h2 style="${c.h2}">Підтвердіть вашу пошту</h2>
  <p style="${c.p}">Дякуємо за реєстрацію! Для завершення введіть код підтвердження нижче.</p>
  <div style="${c.codeWrap}">
    <span style="${c.code}">{code}</span>
  </div>
  <p style="${c.codeHint}">Введіть цей код у вікні реєстрації. Код дійсний 10 хвилин.</p>
  <hr style="${c.divider}">
  <p style="${c.p};font-size:13px;color:#6e6e73;margin:0;">Якщо ви не реєструвались — просто проігноруйте цей лист.</p>
`);

// ============================================
// 2. Ласкаво просимо (після верифікації)
// ============================================
module.exports.welcomeEmailTemplate = wrap(`
  <h2 style="${c.h2}">Ласкаво просимо!</h2>
  <p style="${c.p}">Ваш акаунт підтверджено. Тепер ви можете будувати графи, розраховувати маршрути та зберігати результати.</p>
  <div style="${c.btnWrap}">
    <a href="{loginLink}" style="${c.btn}">Увійти в систему</a>
  </div>
  <hr style="${c.divider}">
  <p style="${c.p};font-size:13px;color:#6e6e73;margin:0;">Якщо кнопка не працює — скопіюйте посилання вручну: {loginLink}</p>
`);

// ============================================
// 3. Акаунт вже існує (повторна реєстрація)
// ============================================
module.exports.alreadyRegisteredEmail = wrap(`
  <h2 style="${c.h2}">Акаунт вже існує</h2>
  <p style="${c.p}">Схоже, ви вже зареєстровані з адресою <b>{email}</b>.</p>
  <p style="${c.p}">Якщо ви забули пароль — скористайтесь функцією відновлення на сторінці входу.</p>
  <div style="${c.btnWrap}">
    <a href="{loginLink}" style="${c.btn}">Увійти в систему</a>
  </div>
  <hr style="${c.divider}">
  <p style="${c.p};font-size:13px;color:#6e6e73;margin:0;">Якщо це були не ви — просто проігноруйте цей лист.</p>
`);

// ============================================
// 4. Спроба реєстрації на існуючий email
// ============================================
module.exports.emailExistsTemplate = wrap(`
  <h2 style="${c.h2}">Спроба реєстрації</h2>
  <p style="${c.p}">Хтось спробував зареєструватись з адресою <b>{email}</b>, але акаунт із цією поштою вже існує.</p>
  <p style="${c.p}">Якщо це були ви — увійдіть нижче або скористайтесь відновленням пароля.</p>
  <div style="${c.btnWrap}">
    <a href="{loginLink}" style="${c.btn}">Увійти в систему</a>
  </div>
  <hr style="${c.divider}">
  <p style="${c.p};font-size:13px;color:#6e6e73;margin:0;">Якщо це були не ви — просто проігноруйте цей лист.</p>
`);

// ============================================
// 5. Код підтвердження при вході
// ============================================
module.exports.loginEmailTemplate = wrap(`
  <h2 style="${c.h2}">Вхід до системи</h2>
  <p style="${c.p}">Отримано запит на вхід до вашого акаунта. Введіть код нижче для підтвердження.</p>
  <div style="${c.codeWrap}">
    <span style="${c.code}">{code}</span>
  </div>
  <p style="${c.codeHint}">Введіть цей код у вікні входу. Код дійсний 10 хвилин.</p>
  <hr style="${c.divider}">
  <p style="${c.p};font-size:13px;color:#6e6e73;margin:0;">Якщо ви не намагались увійти — негайно змініть пароль.</p>
`);

// ============================================
// 6. Скидання пароля
// ============================================
module.exports.resetEmailTemplate = wrap(`
  <h2 style="${c.h2}">Скидання пароля</h2>
  <p style="${c.p}">Отримано запит на скидання пароля для вашого акаунта. Використайте код нижче для встановлення нового пароля.</p>
  <div style="${c.codeWrap}">
    <span style="${c.code}">{code}</span>
  </div>
  <p style="${c.codeHint}">Введіть цей код у вікні зміни пароля. Код дійсний 10 хвилин.</p>
  <hr style="${c.divider}">
  <p style="${c.p};font-size:13px;color:#6e6e73;margin:0;">Якщо ви не запитували скидання пароля — просто проігноруйте цей лист.</p>
`);