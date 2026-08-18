# Security Policy

## Supported Versions

Security fixes are applied to the current development version.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately
to the project maintainer.

Do not publicly disclose sensitive security issues before they have
been reviewed.

## Security Guidelines

- Never commit `.env` files.
- Never commit database passwords.
- Never commit JWT secret keys.
- Never commit API keys or access tokens.
- Never commit private certificates or private keys.
- Use strong secrets in production.
- Use HTTPS in production.
- Keep dependencies updated.
- Do not expose Redis publicly in production.
- Do not expose MySQL publicly in production.