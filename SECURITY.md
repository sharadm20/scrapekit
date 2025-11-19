# Security Policy

## Supported Versions

We release patches for security vulnerabilities. The table below indicates which versions are currently supported:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in ScrapeKit, please follow these steps:

1. **Do not report security vulnerabilities through public GitHub issues**
2. Instead, send an email to [security@scrapekit.dev](mailto:security@scrapekit.dev) (replace with your actual email)
3. Include the following information in your report:
   - Type of vulnerability
   - Location of vulnerability
   - Potential impact
   - Steps to reproduce (if applicable)
   - Any possible mitigations

## Response Time

We aim to acknowledge receipt of your vulnerability report within 48 hours and will send you regular updates about our progress in addressing the issue.

## Security Updates

Security updates will be released as quickly as possible after a vulnerability is discovered and confirmed. We will communicate security updates through:

- GitHub Security Advisories
- npm package updates
- Release notes in the GitHub repository

## Best Practices

To ensure security when using ScrapeKit:

- Always use the latest version of the package
- Be cautious when scraping websites that may contain malicious content
- Validate and sanitize scraped data before using it in your applications
- Be respectful of website robots.txt files and rate limits
- Use appropriate timeouts to prevent hanging connections