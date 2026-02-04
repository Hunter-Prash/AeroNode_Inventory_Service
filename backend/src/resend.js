"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resend = void 0;
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY in environment");
}
exports.resend = new resend_1.Resend(apiKey);
async function sendEmail(params) {
    const from = params.from ?? process.env.EMAIL_FROM;
    if (!from) {
        throw new Error("Missing EMAIL_FROM in environment");
    }
    return exports.resend.emails.send({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
    });
}
