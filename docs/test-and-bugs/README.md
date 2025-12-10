## Email Sending Issue

### Summary
The current email delivery flow encounters failures under certain configurations:
- Resend blocks messages sent from unverified domains, requiring either a verified domain or use of the test inbox tied to the associated Resend account.
- SMTP delivery succeeds only when valid `SMTP_*` credentials and from-address are supplied in `.env`.

### Workaround
- When running in development mode, the backend logs the six-digit verification code to the terminal. If email delivery fails, retrieve the code directly from the terminal output to continue testing the sign-up or login flow.

### Next Steps
- Verify the domain in Resend and configure `RESEND_FROM_EMAIL`.
- Alternatively, configure SMTP credentials via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM_EMAIL` to bypass the Resend sandbox restriction.

### Resend Configuration
For detailed Resend setup instructions, see **[RESEND-EMAIL-SERVICE.md](../RESEND-EMAIL-SERVICE.md)**

