export const recoveryPasswordTemplate = (token: string) => `
<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 20px;">
                        <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Reset your password</h1>
                        <p style="color: #666; text-align: center; margin-bottom: 20px;">Click the button below to reset your password..</p>
                        <p style="color: #666; text-align: center; margin-bottom: 20px;">If you did request a reset password, please ignore this email.</p>
                        <p style="color: #666; text-align: center; margin-bottom: 20px;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
                        <p style="color: #666; text-align: center; margin-bottom: 20px;">${process.env.CLIENT_APP_URL}/auth/verify-account?token=${token}</p>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                                <td align="center" style="padding: 10px;">
                                    <a href="${process.env.CLIENT_APP_URL}/auth/reset?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset password</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
`;
