const commonStyles = {
	wrapper: `background-color: #f4f4f7; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6;`,
	card: `max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);`,
	header: `background-color: #2d3748; padding: 24px; text-align: center;`,
	headerText: `color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 1px;`,
	body: `padding: 40px 30px; color: #4a5568; font-size: 16px;`,
	codeBox: `display: block; width: fit-content; margin: 20px auto; background-color: #ebf8ff; color: #2b6cb0; font-size: 24px; font-weight: bold; letter-spacing: 2px; padding: 15px 30px; border-radius: 6px; border: 1px dashed #bee3f8;`,
	button: `display: inline-block; background-color: #3182ce; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 6px; margin-top: 10px;`,
	footer: `text-align: center; font-size: 12px; color: #a0aec0; margin-top: 20px;`
};

module.exports.verifyEmailTemplate = `
<div style="${commonStyles.wrapper}">
    <div style="${commonStyles.card}">
        <div style="${commonStyles.header}">
            <p style="${commonStyles.headerText}">Test</p>
        </div>
        <div style="${commonStyles.body}">
            <h2 style="color: #2d3748; margin-top: 0;">Verify your email</h2>
            <p>Thank you for signing up for <b>Test</b>! To complete your registration and get started, please use the verification code below.</p>
            <div style="text-align: center;">
                <span style="${commonStyles.codeBox}">{code}</span>
            </div>
            <p style="font-size: 14px; color: #718096; text-align: center;">Enter this code in the signup window.</p>
        </div>
    </div>
</div>`;

module.exports.welcomeEmailTemplate = `
<div style="${commonStyles.wrapper}">
    <div style="${commonStyles.card}">
        <div style="${commonStyles.header}">
            <p style="${commonStyles.headerText}">Test</p>
        </div>
        <div style="${commonStyles.body}">
            <h2 style="color: #2d3748; margin-top: 0;">Welcome aboard!</h2>
            <p>Welcome to <b>Test</b>! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="{loginLink}" style="${commonStyles.button}">Log In to Test</a>
            </div>
        </div>
    </div>
</div>`;

module.exports.alreadyRegisteredEmail = `
<div style="${commonStyles.wrapper}">
    <div style="${commonStyles.card}">
        <div style="${commonStyles.header}">
            <p style="${commonStyles.headerText}">Test</p>
        </div>
        <div style="${commonStyles.body}">
            <h2 style="color: #2d3748; margin-top: 0;">Account Exists</h2>
            <p>It seems you have already registered with the email <b>{email}</b>.</p>
            <p>If you forgot your password, please use the "Forgot Password" option on the login page to reset it.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="{loginLink}" style="${commonStyles.button}">Log In to Test</a>
            </div>
        </div>
    </div>
</div>`;

module.exports.emailExistsTemplate = `
<div style="${commonStyles.wrapper}">
    <div style="${commonStyles.card}">
        <div style="${commonStyles.header}">
            <p style="${commonStyles.headerText}">Test</p>
        </div>
        <div style="${commonStyles.body}">
            <h2 style="color: #2d3748; margin-top: 0;">Registration Attempt</h2>
            <p>We noticed an attempt to sign up with <b>{email}</b>, but a <b>Test</b> account already exists for this address.</p>
            <p>If this was you, please log in below. If you forgot your password, please use the recovery function on the login page.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="{loginLink}" style="${commonStyles.button}">Log In to Test</a>
            </div>
        </div>
    </div>
</div>`;

module.exports.loginEmailTemplate = `
<div style="${commonStyles.wrapper}">
    <div style="${commonStyles.card}">
        <div style="${commonStyles.header}">
            <p style="${commonStyles.headerText}">Test</p>
        </div>
        <div style="${commonStyles.body}">
            <h2 style="color: #2d3748; margin-top: 0;">Login Verification</h2>
            <p><b>Login to your account!</b> Enter the verification code below to access your <b>Test</b> account securely.</p>
            <div style="text-align: center;">
                <span style="${commonStyles.codeBox}">{code}</span>
            </div>
            <p style="font-size: 14px; color: #718096; text-align: center;">Please enter this code in the login window.</p>
        </div>
    </div>
</div>`;

module.exports.resetEmailTemplate = `
<div style="${commonStyles.wrapper}">
    <div style="${commonStyles.card}">
        <div style="${commonStyles.header}">
            <p style="${commonStyles.headerText}">Test</p>
        </div>
        <div style="${commonStyles.body}">
            <h2 style="color: #2d3748; margin-top: 0;">Password Reset</h2>
            <p>A password reset has been requested for your <b>Test</b> account. Use this code to set a new password.</p>
            <div style="text-align: center;">
                <span style="${commonStyles.codeBox}">{code}</span>
            </div>
            <p style="font-size: 14px; color: #718096; text-align: center; margin-top: 20px;">If you did not request a password reset, please ignore this message.</p>
        </div>
    </div>
</div>`;