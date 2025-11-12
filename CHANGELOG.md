# Changelog

All notable changes to the AgP Playground will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial open source release
- Interactive playground for H.AI Agent Platform SDK
- Real-time event stream viewer
- Task control panel (pause, resume, stop)
- Configuration save/load functionality
- Code snippet generator with syntax highlighting
- Workflow builder with Workflow DevKit integration
- Multiple example workflow patterns:
  - Agent workflow (sequential agent tasks)
  - Company earnings flow (multi-step analysis)
- Screenshot viewer with proxy authentication
- Dark/light theme support
- Local storage for API keys and configurations

### Documentation

- Comprehensive README with setup instructions
- Example workflow documentation
- Contributing guidelines
- Code of Conduct
- Security policy

## [0.1.0] - 2025-11-12

### Added

- Initial release of AgP Playground
- Support for `@h-company/agp-sdk-js` private package
- Next.js 15 App Router implementation
- Tailwind CSS with custom design system
- shadcn/ui components
- TypeScript throughout

### Features

- **Main Playground**:
  - API key authentication
  - Run method selection (`run()`, `runAndWait()`)
  - Real-time event monitoring
  - Task lifecycle controls
  - Configuration management

- **Workflow Builder**:
  - Multi-step workflow creation
  - Pre-built workflow patterns
  - Code generation
  - Server-side workflow execution
  - Workflow DevKit integration

### Requirements

- Node.js >= 18.0.0
- pnpm
- npm access token for `@h-company/agp-sdk-js`

---

For older releases and detailed version history, see [GitHub Releases](https://github.com/hcompai/agp-playground/releases).

