import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY in environment");
}

export const resend = new Resend(apiKey);

export async function sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
}) {
    const from = params.from ?? process.env.EMAIL_FROM;
    if (!from) {
        throw new Error("Missing EMAIL_FROM in environment");
    }

    return resend.emails.send({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
    });
}
