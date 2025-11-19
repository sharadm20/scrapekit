# Contributing to ScrapeKit

Thank you for your interest in contributing to ScrapeKit! We welcome all contributions, from bug reports to feature requests to code improvements.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Questions?](#questions)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate in all interactions.

## How to Contribute

There are many ways you can contribute to ScrapeKit:

- Report bugs or suggest features by [opening an issue](https://github.com/scrapekit/scrapekit/issues)
- Improve documentation
- Contribute code to fix issues or add features
- Review pull requests
- Share the project with others

### Finding a task to work on

Look for issues labeled with `good first issue` if you're new to the project. These are specifically chosen to be a good starting point for new contributors.

## Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/scrapekit.git
   ```
3. Navigate to the project directory:
   ```bash
   cd scrapekit
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Build the project:
   ```bash
   npm run build
   ```

## Running Tests

Currently, ScrapeKit is working on implementing a comprehensive test suite. As we develop the testing framework, please ensure your changes don't break existing functionality by manually testing the features you work on.

## Style Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code formatting (Prettier config is included)
- Write clear, descriptive variable and function names
- Document complex functions with JSDoc comments
- Keep functions focused on a single responsibility

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters or less
- Reference issues and pull requests after a blank line

## Pull Request Process

1. Ensure your code follows our style guidelines
2. Update documentation as needed
3. Add or update tests if applicable
4. Update the README if you're changing user-facing functionality
5. Submit a pull request with a clear title and description
6. Link to any related issues in the pull request description
7. Wait for review feedback and address any requested changes

## Questions?

If you have any questions about contributing, feel free to open an issue with the "question" label or contact one of the maintainers.

Thank you for your contribution to ScrapeKit!