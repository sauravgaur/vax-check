
const { send } = require('./paubox')

const DEFAULT_MAILER_CONFIG = {
    from: process.env.PAUBOX_DEFAULT_MAIL,
    subject: process.env.PAUBOX_DEFAULT_SUBJECT,
    attachments: [],
    cc: [],
    bcc: []
}
function initSMTP(smtpConfig) {
    return {
        token: smtpConfig.token || process.env.PAUBOX_TOKEN
    }
}
function initConfig(to, body, objConfig) {
    return {
        from: objConfig.from || DEFAULT_MAILER_CONFIG.from,
        to: to,
        html: body,
        subject: objConfig.from || DEFAULT_MAILER_CONFIG.subject,
        attachments: objConfig.attachments || DEFAULT_MAILER_CONFIG.attachments,
        cc: objConfig.cc || DEFAULT_MAILER_CONFIG.cc,
        bcc: objConfig.bcc || DEFAULT_MAILER_CONFIG.bcc
    }
}

async function sendMail(toMail, body, objConfig = {}, smtpConfig = {}) {
    try {
        console.log('in Send Mail method');
        const { from, to, html, subject, attachments, cc, bcc } = initConfig(toMail, body, objConfig);
        const { token } = initSMTP(smtpConfig);
        const resp = await send(from, to, html, subject, attachments, cc, bcc, token)
        return resp
    } catch (err) {
        throw err;
    }
}

async function pauboxMailStatus(sourceTrackingId, smtpConfig = {}) {
    try {
        const { token } = initSMTP(smtpConfig);
        const resp = await checkMailStatus(sourceTrackingId, token)
        return resp
    } catch (err) {
        throw err;
    }
}

module.exports = {
    sendMail,
    pauboxMailStatus
}