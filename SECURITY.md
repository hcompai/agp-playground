# Security Policy

## Our Commitment

The security of AgP Playground is important to us. We appreciate your efforts to responsibly disclose any security vulnerabilities you find.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

### How to Report

If you discover a security vulnerability, please send an email to:

**privacy@hcompany.ai**

Include the following information:

- **Type of vulnerability**: (e.g., XSS, CSRF, credential exposure, etc.)
- **Full description**: Detailed explanation of the vulnerability
- **Steps to reproduce**: Clear steps to reproduce the issue
- **Proof of concept**: Code sample or screenshots demonstrating the vulnerability
- **Impact**: Potential impact if the vulnerability is exploited
- **Suggested fix**: If you have a recommendation for fixing it
- **Your contact information**: For follow-up questions

### What to Expect

1. **Acknowledgment**: We'll acknowledge receipt of your report within **48 hours**
2. **Initial assessment**: We'll provide an initial assessment within **5 business days**
3. **Updates**: We'll keep you informed of our progress
4. **Resolution**: We aim to resolve critical vulnerabilities promptly
5. **Disclosure**: We'll work with you on a coordinated disclosure timeline

## Security Best Practices

### For Users

#### 1. API Key Management

**Never commit API keys to version control:**

❌ **Bad:**

```typescript
// .env.local committed to git
AGP_API_KEY=sk_prod_abc123...
```

✅ **Good:**

```typescript
// .env.local in .gitignore
AGP_API_KEY=sk_prod_abc123...
```

**Best practices:**

- Store API keys in `.env.local` (not tracked by git)
- Never share API keys in screenshots or issues
- Use different keys for development and production
- Revoke unused or compromised keys immediately at [Portal-H](https://portal.hcompany.ai)

#### 2. npm Access Token

**Keep your npm token secure:**

- Store in environment variable (`NPM_TOKEN`)
- Add `.npmrc` to `.gitignore` (already done)
- Don't share tokens publicly
- Revoke old tokens at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)

#### 3. Running Untrusted Agent Tasks

**Be cautious when testing agents:**

- Review agent objectives before running
- Understand what URLs the agent will visit
- Be aware of sensitive data in your environment
- Use test accounts when possible

### For Contributors

#### 1. No Secrets in Code

- Never commit API keys, tokens, or credentials
- Use `.env.example` files with placeholder values
- Review commits before pushing
- Check git history if you accidentally commit secrets

#### 2. Secure Coding Practices

- Sanitize user inputs
- Validate environment variables
- Use HTTPS for all API calls
- Implement proper error handling (don't leak sensitive info)

#### 3. Dependencies

- Keep dependencies updated
- Review security advisories for dependencies
- Use `npm audit` or `pnpm audit` regularly

## Common Security Scenarios

### Scenario 1: Exposed API Key

If you accidentally expose an API key:

1. **Revoke immediately** at [Portal-H](https://portal.hcompany.ai)
2. **Generate a new key**
3. **Update your `.env.local`**
4. **Check git history** - if committed, rotate the key
5. **Monitor for unauthorized usage**

### Scenario 2: Exposed npm Token

If you expose your npm token:

1. **Revoke immediately** at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. **Generate a new token**
3. **Update your environment**: `export NPM_TOKEN=new_token`
4. **Remove from git history** if committed

### Scenario 3: XSS or Injection

If you find a potential XSS or injection vulnerability:

1. **Don't exploit it publicly**
2. **Report to privacy@hcompany.ai**
3. **Include steps to reproduce**
4. **We'll work on a fix**

## Security Features

### Built-in Protections

- **Environment variable validation**: Required env vars are checked on startup
- **HTTPS enforcement**: All API calls use HTTPS
- **No credential storage**: API keys stored in browser localStorage (not accessible via XSS if properly configured)
- **Screenshot proxy**: Authenticated screenshots use server-side proxy

### What's NOT Protected

This playground is a **development tool** and should not be used in production as-is:

- No rate limiting
- No authentication system
- API keys stored in browser
- No audit logging

## Scope

This security policy applies to:

- The AgP Playground application
- Example workflows
- Documentation

### Out of Scope

- Vulnerabilities in third-party dependencies (report to dependency maintainers)
- Vulnerabilities in the AgP SDK itself (report to SDK repository)
- Vulnerabilities in the AgP platform (report separately)

## Updates

Security updates will be announced through:

1. **GitHub Security Advisories**
2. **GitHub Releases**
3. **CHANGELOG.md**

## Questions?

If you have questions about this security policy, please contact us at privacy@hcompany.ai.

---

**Last Updated**: November 12, 2025

Thank you for helping keep AgP Playground and our users safe!

