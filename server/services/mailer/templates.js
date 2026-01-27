module.exports.verifyEmailTemplate = `<div class="app" style="padding: 20px; width: 600px; margin: auto; border-radius: 16px; background-color: white; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
<div class="header" style="background-color: #0067FF; color: white; padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 28px; text-align: center;">Emissary</div>

<div class="content" style="font-size: 14px; margin: 20px;">
	<p class="info" style="opacity: 0.5;"><b>Thank you for signing up!</b> Enter the verification code below in your Emissary account to get started.</p>
	<p class="center" style="text-align: center;">Please enter this code in the signup window: <span class="link" style="display: inline-block; margin: auto; color: white; background-color: #0067FF; border-radius: 4px; font-size: 14px; padding: 5px 10px; margin-left: 10px;">{code}</span></p>
</div>
</div>`;

module.exports.welcomeEmailTemplate = `<div class="app" style="padding: 20px; width: 600px; margin: auto; border-radius: 16px; background-color: white; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
<div class="header" style="background-color: #0067FF; color: white; padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 28px; text-align: center;">Emissary</div>

<div class="content" style="font-size: 14px; margin: 20px;">
    <p class="info" style="opacity: 0.5;">Welcome to Emissary! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.</p>
    <p class="center" style="text-align: center;"><a href="{loginLink}" style="text-decoration: none; display: inline-block; margin: auto; color: white; background-color: #0067FF; border-radius: 4px; font-size: 14px; padding: 5px 10px;">Log In to Emissary</a></p>
</div>
</div>`;

module.exports.alreadyRegisteredEmail = `<div class="app" style="padding: 20px; width: 600px; margin: auto; border-radius: 16px; background-color: white; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
<div class="header" style="background-color: #0067FF; color: white; padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 28px; text-align: center;">Emissary</div>

<div class="content" style="font-size: 14px; margin: 20px;">
    <p class="info" style="opacity: 0.5;">It seems you have already registered with the email <b>{email}</b>. If you forgot your password, please use the "Forgot Password" option on the login page to reset it.</p>
    <p class="center" style="text-align: center;"><a href="{loginLink}" style="text-decoration: none; display: inline-block; margin: auto; color: white; background-color: #0067FF; border-radius: 4px; font-size: 14px; padding: 5px 10px;">Log In to Emissary</a></p>
</div>
</div>`;

module.exports.emailExistsTemplate = `<div class="app" style="padding: 20px; width: 600px; margin: auto; border-radius: 16px; background-color: white; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
<div class="header" style="background-color: #0067FF; color: white; padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 28px; text-align: center;">Emissary</div>

<div class="content" style="font-size: 14px; margin: 20px;">
	<p class="info" style="opacity: 0.5;">We noticed an attempt to sign up with <b>{email}</b>, but an account already exists. If this was you, please log in below. If you forgot your password, please use the "Forgot Password" function on the login page.</p>
	<p class="center" style="text-align: center;"><a href="{loginLink}" style="text-decoration: none; display: inline-block; margin: auto; color: white; background-color: #0067FF; border-radius: 4px; font-size: 14px; padding: 5px 10px;">Log In to Emissary</a></p>
</div>
</div>`;

module.exports.loginEmailTemplate = `<div class="app" style="padding: 20px; width: 600px; margin: auto; border-radius: 16px; background-color: white; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
<div class="header" style="background-color: #0067FF; color: white; padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 28px; text-align: center;">Emissary</div>

<div class="content" style="font-size: 14px; margin: 20px;">
	<p class="info" style="opacity: 0.5;"><b>Login to your account!</b> Enter the verification code below to access your Emissary account.</p>
	<p class="center" style="text-align: center;">Please enter this code in the login window: <span class="link" style="display: inline-block; margin: auto; color: white; background-color: #0067FF; border-radius: 4px; font-size: 14px; padding: 5px 10px; margin-left: 10px;">{code}</span></p>
</div>
</div>`;

module.exports.resetEmailTemplate = `<div class="app" style="padding: 20px; width: 600px; margin: auto; border-radius: 16px; background-color: white; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
<div class="header" style="background-color: #0067FF; color: white; padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 28px; text-align: center;">Emissary</div>

<div class="content" style="font-size: 14px; margin: 20px;">
	<p class="info" style="opacity: 0.5;">A password reset has been requested for your Emissary account. Use this code to set a new password. If you did not request a password reset, please ignore this message.</p>
	<p class="center" style="text-align: center;">Reset verification code: <span class="link" style="display: inline-block; margin: auto; color: white; background-color: #0067FF; border-radius: 4px; font-size: 14px; padding: 5px 10px; margin-left: 10px;">{code}</span></p>
</div>
</div>`;