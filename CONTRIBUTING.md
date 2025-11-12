# Contributing to AgP Playground

Thank you for considering contributing to the AgP Playground! This interactive playground helps developers learn and experiment with the H.AI Agent Platform SDK.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

Contributions are made via Issues and Pull Requests (PRs). Before creating a new one:

- Search for existing Issues and PRs to avoid duplicates
- Check if the feature aligns with the playground's purpose (learning and experimentation)

## Development Setup

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **pnpm**: Package manager
- **Git**: For version control
- **npm access token**: Required to install `@h-company/agp-sdk-js` (private package)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR-USERNAME/agp-playground.git
   cd agp-playground
   ```

3. **Add the upstream repository**:

   ```bash
   git remote add upstream https://github.com/hcompai/agp-playground.git
   ```

4. **Configure npm access** (if you have a token):

   ```bash
   cp .npmrc.example .npmrc
   export NPM_TOKEN=your_token_here
   ```

5. **Install dependencies**:

   ```bash
   pnpm install
   ```

6. **Create `.env.local`**:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add:
   ```
   NEXT_PUBLIC_AGP_BASE_URL=your_agp_url
   AGP_API_KEY=your_api_key
   ```

7. **Start the development server**:

   ```bash
   pnpm dev
   ```

8. Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter (Biome)
- `pnpm format` - Format code (Biome)

## How to Contribute

### Types of Contributions

#### 🐛 Bug Fixes

- Fix UI issues, event handling bugs, or workflow problems
- Include steps to reproduce the bug
- Add screenshots if it's a visual bug

#### ✨ New Features

- New workflow examples
- UI/UX improvements
- New agent interaction patterns
- Better visualization of agent events

#### 📝 Documentation

- Improve README
- Add more example workflows
- Create tutorials or guides
- Fix typos

#### 🎨 UI/UX Improvements

- Better responsive design
- Accessibility improvements
- Dark mode enhancements
- Component polish

## Code Style

We use **Biome** for linting and formatting.

### TypeScript Guidelines

- Use TypeScript for all new code
- Prefer React hooks over class components
- Use proper types (avoid `any` when possible)

### Next.js Best Practices

- Use App Router patterns
- Implement proper error boundaries
- Use Server Components where appropriate
- Client components only when needed

### Component Structure

```typescript
'use client';

import { useState } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false);

  return (
    <div>
      {/* component content */}
    </div>
  );
}
```

### File Organization

```
agp-playground/
├── app/                      # Next.js app router
│   ├── page.tsx             # Main playground
│   ├── workflow-builder/    # Workflow builder page
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # Base UI components
│   └── *.tsx                # Feature components
├── workflows/               # Example workflows
├── lib/                     # Utilities
└── public/                  # Static assets
```

## Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Run linter**: `pnpm lint`
3. **Format code**: `pnpm format`
4. **Build successfully**: `pnpm build`
5. **Update documentation** if needed

### PR Title Format

Use conventional commit format:

- `feat: Add batch workflow execution`
- `fix: Resolve event stream scrolling issue`
- `docs: Add workflow examples`
- `ui: Improve mobile responsiveness`
- `refactor: Simplify event handling`

### PR Description

```markdown
## Description

Brief description of the changes

## Screenshots (for UI changes)

Before | After
--- | ---
![before](url) | ![after](url)

## Testing

- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on mobile
- [ ] Tested with different agent tasks
- [ ] Tested workflow builder (if applicable)

## Checklist

- [ ] Code follows project style
- [ ] Documentation updated
- [ ] All checks pass
- [ ] Tested locally
```

## Reporting Issues

### Bug Reports

Include:

- **Clear title**: Brief description
- **Description**: What went wrong?
- **Steps to reproduce**:
  1. Go to '...'
  2. Click on '...'
  3. See error
- **Expected behavior**: What should happen?
- **Screenshots**: If applicable
- **Environment**:
  - Browser and version
  - OS
  - Node.js version

### Feature Requests

Include:

- **Clear title**: Feature name
- **Problem**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives**: Other approaches considered
- **Use case**: Real-world scenario

### Workflow Examples

If proposing a new workflow example:

- **Pattern name**: What pattern does it demonstrate?
- **Use case**: When would someone use this?
- **Code**: Provide the workflow implementation
- **Documentation**: Explain how it works

## Community

- **Questions**: Open a GitHub Discussion
- **Feature requests**: Create an issue with `enhancement` label
- **Bugs**: Create an issue with `bug` label

## Project Goals

The AgP Playground aims to:

1. **Educate**: Help developers learn the AgP SDK
2. **Experiment**: Provide a safe space to test agent interactions
3. **Showcase**: Demonstrate best practices and patterns
4. **Inspire**: Show what's possible with AI agents

When contributing, consider how your changes support these goals.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AgP Playground! 🚀

