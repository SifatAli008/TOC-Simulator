# CI/CD Pipeline Documentation

## Overview

This document describes the comprehensive CI/CD pipeline setup for the TOC Simulator project, including automated testing, code quality checks, security scanning, and deployment workflows.

## Pipeline Architecture

### 🔄 Continuous Integration (CI)

The CI pipeline runs on every push to `main`/`develop` branches and on pull requests:

#### 1. **Code Quality & Linting**
- ESLint for code quality
- Prettier for code formatting
- TypeScript type checking
- Runs on Node.js 18

#### 2. **Security Scanning**
- npm audit for dependency vulnerabilities
- GitHub's dependency review action
- CodeQL security analysis (weekly)

#### 3. **Testing**
- **Unit Tests**: Jest with React Testing Library
- **E2E Tests**: Playwright across multiple browsers
- **Coverage**: Codecov integration
- **Matrix Testing**: Node.js 18 & 20

#### 4. **Build Verification**
- Next.js build validation
- Artifact generation and upload
- Environment variable validation

### 🚀 Continuous Deployment (CD)

#### 1. **Staging Deployment**
- Automatic preview deployments on PR
- Vercel preview environments
- PR comments with preview URLs

#### 2. **Production Deployment**
- Triggered on successful CI completion
- Vercel production deployment
- Environment protection rules

#### 3. **Post-Deployment**
- Smoke tests on production
- Accessibility testing
- Performance audits (Lighthouse)
- Deployment notifications

## Workflow Files

### `.github/workflows/ci.yml`
Main CI pipeline with parallel job execution:
- **lint**: Code quality and formatting
- **security**: Vulnerability scanning
- **test**: Unit and E2E testing
- **build**: Application building

### `.github/workflows/cd.yml`
Deployment pipeline:
- **deploy-staging**: Preview deployments
- **deploy-production**: Production deployments
- **post-deploy-tests**: Validation tests
- **notify**: Status notifications

### `.github/workflows/codeql.yml`
Security analysis:
- JavaScript/TypeScript analysis
- Weekly scheduled runs
- Pull request analysis

### `.github/workflows/dependency-update.yml`
Automated maintenance:
- Weekly dependency updates
- Security vulnerability fixes
- Automated PR creation

## Quality Gates

### Pre-commit Hooks (Husky)
- **pre-commit**: Lint-staged + type checking
- **commit-msg**: Conventional commit validation

### Code Coverage
- Minimum 70% coverage across all metrics
- Automated coverage reporting
- PR coverage comparisons

### Performance Budgets
- Lighthouse CI integration
- Performance score thresholds:
  - Performance: 80%
  - Accessibility: 90%
  - Best Practices: 85%
  - SEO: 80%

## Environment Variables

### Required Secrets (GitHub)
```
VERCEL_TOKEN          # Vercel deployment token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
```

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

## Testing Strategy

### Unit Tests
- **Framework**: Jest + React Testing Library
- **Location**: `src/components/__tests__/`
- **Coverage**: Components, utilities, hooks
- **Command**: `npm run test`

### E2E Tests
- **Framework**: Playwright
- **Location**: `e2e/`
- **Browsers**: Chrome, Firefox, Safari, Mobile
- **Command**: `npm run test:e2e`

### Test Categories
- `@smoke`: Critical path testing
- `@accessibility`: A11y compliance
- Regular: Comprehensive feature testing

## Deployment Environments

### Preview (Staging)
- **Trigger**: Pull requests
- **URL**: Dynamic Vercel preview URLs
- **Purpose**: Feature validation

### Production
- **Trigger**: Main branch commits
- **URL**: `https://toc-simulator.vercel.app`
- **Protection**: Manual approval required

## Monitoring & Notifications

### Status Checks
- All CI jobs must pass
- Security scans must clear
- Coverage thresholds must be met

### Notifications
- PR comments for preview deployments
- Commit comments for production deployments
- Slack integration (optional)

## Development Workflow

### 1. Feature Development
```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "feat: add new automata visualization"
git push origin feature/new-feature
# Create PR
```

### 2. Code Review Process
- Automated CI checks
- Manual code review
- Preview deployment testing
- Approval required for merge

### 3. Release Process
- Merge to main triggers production deployment
- Automated post-deployment validation
- Rollback procedures available

## Troubleshooting

### Common Issues

#### 1. **CI Failures**
- Check ESLint/Prettier errors
- Verify test failures
- Review build logs

#### 2. **Deployment Failures**
- Validate environment variables
- Check Vercel configuration
- Review build artifacts

#### 3. **Test Failures**
- Local test execution: `npm run test`
- E2E debugging: `npm run test:e2e -- --debug`
- Coverage reports: Check Codecov dashboard

### Performance Optimization
- Parallel job execution
- Dependency caching
- Artifact reuse
- Smart triggering

## Maintenance

### Regular Tasks
- Weekly dependency updates (automated)
- Monthly security reviews
- Quarterly pipeline optimization
- Performance budget adjustments

### Monitoring
- GitHub Actions usage
- Vercel deployment metrics
- Test execution times
- Coverage trends

## Getting Started

### Initial Setup
1. Install dependencies: `npm install`
2. Setup Git hooks: `npm run prepare`
3. Configure environment variables
4. Run tests: `npm run test`

### Local Development
```bash
npm run dev          # Start development server
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code quality
npm run build        # Build for production
```

This CI/CD pipeline ensures code quality, security, and reliable deployments while maintaining developer productivity and project stability.
