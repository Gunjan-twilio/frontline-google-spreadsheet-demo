require('dotenv').config();

const _ = (varName, defaults) => process.env[varName] || defaults || null;

const port = _('PORT', 5000);

module.exports = {
    port: port,
    twilio: {
        account_sid: _('TWILIO_ACCOUNT_SID'),
        auth_token: _('TWILIO_AUTH_TOKEN'),
        sso_realm_sid: _('TWILIO_SSO_REALM_SID'),
        sms_number: _('TWILIO_SMS_NUMBER'),
        whatsapp_number: _('TWILIO_WHATSAPP_NUMBER')
    },
    google:{
        spreadsheet_key: _('GOOGLE_SPREADSHEET_KEY'),
        client_email: _('GOOGLE_CLIENT_EMAIL'),
        private_key: _('GOOGLE_PRIVATE_KEY')
    }
};
