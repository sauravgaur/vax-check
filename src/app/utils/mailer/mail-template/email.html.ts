export const vaccinationInProcessEmail = (firstName: string) => {
    return `<!DOCTYPE html>
    <html lang="en-US">
    <body class="body"
        style="background-color: #e1e3ed; padding-top:24px; margin:0 !important; display:block !important; -webkit-text-size-adjust:none">
        <table style="margin: 24px auto;padding: 24px;background-color: #ffffff;border-radius: 12px;" width="500px"
            border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td style="text-align: center">
                    <img width="70" alt="" src="https://api-vaxcheck.firstvitals.com/public/logo-dark.png" />
                </td>
            </tr>
            <tr>
                <td style="text-align: center">
                    <h3 style="margin: 0;">Vaccination in Progress</h3>
                    <h6 style="margin: 0; margin-bottom: 16px;">Your vaccination verification is in progress</h6>
                </td>
            </tr>
            <tr>
                <td style="padding-top: 16px;text-align: justify;text-justify: inter-word;">
                    Hey ${firstName}<br/>
                    <br/>
                    Thank you for uploading and confirming your CDC vaccination details.  Depending on where you received your vaccination, the verification and certification process can be completed within hours or in a few days, depending if multiple vaccination sites were used and/or the availability of electronic medical records.<br/>
                    <br/>
                    Once verified, we will contact you via email.  If you have any questions or do not hear from us within 4 business days, please feel free to contact us at: vaxcheck@firstvitals.com<br/>
                    <br/>
                    <br/>
                    Your Dedicated Support Team @<br/>
                    VAXcheck.us
                </td>
            </tr>
        </table>
    </body>
    </html>`
}

export const vaccinationVerifiedEmail = (accessCode: string, firstName: string) => {
    return `<!DOCTYPE html>
    <html lang="en-US">
    <body class="body"
        style="background-color: #e1e3ed; padding-top:24px; margin:0 !important; display:block !important; -webkit-text-size-adjust:none">
        <table style="margin: 24px auto;padding: 24px;background-color: #ffffff;border-radius: 12px;" width="500px"
            border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td style="text-align: center">
                    <img width="70" alt="" src="https://api-vaxcheck.firstvitals.com/public/logo-dark.png" />
                </td>
            </tr>
            <tr>
                <td style="text-align: center">
                    <h3 style="margin: 0;">Vaccination Verified</h3>
                    <h6 style="margin: 0; margin-bottom: 16px;">Your vaccination records have been verified.</h6>
                </td>
            </tr>
            <tr>
                <td style="padding-top: 16px;text-align: justify;text-justify: inter-word;">
                    Hey ${firstName}<br/>
                    <br/>
                    Congratulations!  Your COVID vaccination record has been verified and certified by VAXCheck.<br/>
                </td>
            </tr>
            <tr>
                <td style="padding: 24px">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td style="font-size: 12px;padding-bottom: 4px;">
                                <strong>Here is the access code:</strong>
                            </td>
                        </tr>
                        <tr style="background-color: #d9fcdf; color: #067a1b;">
                            <td style="padding: 10px;border: 1px solid #69ef7f; border-radius: 4px;">
                                <span>Access Code: </span> <span style="padding-left: 10px;">${accessCode}</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <p>We have issued a digital health pass for your reference and possible future use.  To access your digital health pass, here is a step-by-step guide</p>
                    <ol style="text-align: justify;text-justify: inter-word;">
                        <li>Go to an Internet browser and enter the following web address: app.firstvitals.skyflow.com</li>
                        <li>Enter the email/mobile number used when you entered your vaccination details, followed by  6-digit passcode</li>
                        <li>Your personal digital health pass will be displayed</li>
                    </ol>
                </td>
            </tr>
            <tr>
                <td style="text-align: justify;text-justify: inter-word;">
                    <br/>
                    If you have any questions accessing your digital health pass, please feel free to contact us at: vaxcheck@firstvitals.com<br/>
                    Thank you for using VAXCheck.us!<br/>
                    <br/>
                    <br/>
                    Your Dedicated Support Team @<br/>
                    VAXcheck.us<br/>
                </td>
            </tr>
        </table>
    </body>
    </html>`
}

export const loginOtpEmail = (otp: string, firstName: string) => {
    return `<!DOCTYPE html>
    <html lang="en-US">
    <body class="body"
        style="background-color: #e1e3ed; padding-top:24px; margin:0 !important; display:block !important; -webkit-text-size-adjust:none">
        <table style="margin: 24px auto;padding: 24px;background-color: #ffffff;border-radius: 12px;" width="500px"
            border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td style="text-align: center">
                    <img width="70" alt="" src="https://api-vaxcheck.firstvitals.com/public/logo-dark.png" />
                </td>
            </tr>
            <tr>
                <td style="padding-top: 16px;text-align: justify;text-justify: inter-word;">
                    Hey ${firstName}<br/>
                    <br/>
                    Please use the verification code below on the VAXCheck Login to confirm your identity. 
                </td>
            </tr>
            <tr>
                <td style="padding: 24px">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr style="background-color: #d9fcdf; color: #067a1b;">
                            <td style="padding: 10px;border: 1px solid #69ef7f; border-radius: 4px;">
                                <span>Verification Code: </span> <span style="padding-left: 10px;">${otp}</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="text-align: justify;text-justify: inter-word;">
                    <br/>
                    For general information about VAXCheck, see the FAQs. For additional help, contact VAXCheck Support. Thank you for using VAXCheck.us!<br/>
                    <br/>
                    <br/>
                    Your Dedicated Support Team @<br/>
                    VAXcheck.us<br/>
                </td>
            </tr>
            <tr>
                <td>
                    <br/>
                    <br/>
                    <small>Do not reply to this message. This mailbox is not monitored.</small>
                </td>
            </tr>
        </table>
    </body>
    </html>`
}
