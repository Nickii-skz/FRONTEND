# SuperPOS - Point of Sale Frontend

A modern, accessible Point of Sale system built with **Spec-Driven Development (SDD)** methodology using **Hexagonal Architecture**, **SOLID principles**, and **Dependency Inversion**.

## 🏗️ Architecture

- **Domain Layer**: Pure business logic (entities, value objects, domain errors)
- **Application Layer**: Use cases and port interfaces (no framework dependencies)
- **Infrastructure Layer**: Adapters (HTTP, IndexedDB, Mock implementations)
- **Presentation Layer**: React UI components, hooks, and Zustand stores
- **Composition Root**: Single dependency wiring point

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔑 Demo Credentials

- **Cashier**: `cashier` / `1234`
- **Supervisor**: `supervisor` / `5678`
- **Admin**: `admin` / `admin`

## ⌨️ Keyboard Shortcuts

- `Ctrl+F` — Focus product search
- `F2` — Hold current order
- `F4` — Open checkout (if cart has items)
- `F8` — Lock screen
- `Escape` — Close active modal

## 🎯 Features

- **Product Search**: Text search + barcode scanning (8-14 digits)
- **Shopping Cart**: Real-time totals, quantity controls, line notes
- **Discounts**: Percentage & fixed discounts (>20% requires supervisor PIN: `9999`)
- **Multiple Payment Methods**: Cash, debit, credit, transfer, QR code
- **Receipt Generation**: Print + email options
- **Offline Support**: Works without internet, syncs when reconnected
- **Accessibility**: WCAG 2.1 AA compliant, full keyboard navigation
- **High Contrast Theme**: Toggle for bright environments

## 🧪 Testing

The project uses **Property-Based Testing (PBT)** with `fast-check` for domain logic validation:

```bash
# Run all tests
npm test

# Run with coverage (targets: domain 100%, application 80%, presentation 70%)
npm run test:coverage
```

## 📁 Project Structure

```
src/
├── domain/           # Pure business logic
├── application/      # Use cases + ports
├── infrastructure/   # Adapters (HTTP, Mock, IndexedDB)
├── presentation/     # React UI (components, hooks, stores)
└── composition-root/ # Dependency injection
```

## 🔧 Tech Stack

- **React 18** + **TypeScript 5**
- **Vite** (build tool)
- **Zustand** (state management)
- **TanStack Query** (server state)
- **Tailwind CSS** (styling)
- **Vitest** + **fast-check** (testing)

## 📋 Spec Files

This project follows **Spec-Driven Development**:

- `.kiro/specs/pos-frontend/requirements.md` — User stories & acceptance criteria
- `.kiro/specs/pos-frontend/design.md` — Architecture & component design
- `.kiro/specs/pos-frontend/tasks.md` — Implementation tasks

## 🏪 Business Rules

- All monetary calculations use **integer cents** (no floating-point errors)
- **Banker's rounding** (half-even) for display
- Discounts > 20% require supervisor authorization
- Orders persist through page refresh (IndexedDB cache)
- Offline transactions queue for sync when online

---

Built with ❤️ using **Spec-Driven Development** methodology.