# PlayStation Rental Operations System

## Short Description

PlayStation Rental Operations System is a web-based management application for PlayStation rental businesses. It helps operators manage consoles, users, rental pricing, rental packages, add-on products, and transaction history from one structured system.

The main focus of this project is accurate rental business logic, especially time-based billing, package pricing, and transaction data integrity.

## Problem Statement

Small rental businesses often manage active sessions, console availability, pricing, and product sales manually. This creates several operational problems:

- Rental duration can be miscalculated.
- Console status is difficult to track in real time.
- Price changes can affect old transaction records.
- Package pricing and hourly pricing are easy to mix up.
- Add-on product sales are often separated from rental records.
- Daily revenue reports are hard to verify.

## Solution Approach

The system models the rental workflow as a transaction-centered process. Each rental session is created from an available PlayStation unit, linked to the active user, and priced using either an hourly rate or a rental package.

Pricing data is copied into transaction snapshot fields when the transaction is created. This keeps historical records stable even when rates, packages, or product prices change later. Transaction updates are handled through service-layer logic to keep console status, stock movement, rental totals, and grand totals consistent.

## Key Features

- User management with role-based access.
- PlayStation unit management by console type and status.
- Hourly rental rates for PS3, PS4, and PS5 units.
- Rental package management by console type.
- Open rental transactions based on elapsed time.
- Package rental transactions with fixed duration and price.
- Snapshot pricing for rental rates, packages, and products.
- Add-on product sales inside rental transactions.
- Product stock decrement on transaction item creation.
- Active transaction monitoring.
- Transaction history with final rental, product, and grand totals.
- Admin dashboard and reports.

## Tech Stack

### Backend

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JSON Web Token authentication
- bcrypt password hashing

### Frontend

- React
- Vite
- React Router
- TanStack Query
- Zustand
- Axios
- Tailwind CSS
- Lucide React

### Tools

- Prisma Migrate
- Prisma Studio
- Nodemon
- ESLint
- npm scripts

## System Architecture

### Service Layer

Business rules are placed in service modules. The transaction service handles the most critical logic:

- Starting open or package rentals.
- Validating console availability.
- Capturing price snapshots.
- Calculating elapsed rental duration.
- Calculating rental totals and grand totals.
- Adding transaction products.
- Updating product stock.
- Moving active transactions between compatible consoles.
- Completing transactions atomically.

### Controller

Controllers receive HTTP requests, call the relevant service, and return consistent JSON responses. They stay thin so business rules remain centralized in the service layer.

### Database

PostgreSQL stores normalized operational data. Prisma defines the schema, relations, enums, indexes, and migration history.

Main entities:

- `User`
- `PlayStationUnit`
- `RentalRate`
- `RentalPackage`
- `Product`
- `Transaction`
- `TransactionItem`

### API Structure

The backend exposes REST APIs under `/api`.

- `/api/auth` for authentication.
- `/api/consoles` for console listing.
- `/api/products` for product listing.
- `/api/packages` for rental package listing.
- `/api/rates` for rental rate listing.
- `/api/transactions` for active rentals, history, start, finish, item add, and console move.
- `/api/reports` for operational summaries.
- `/api/admin` for protected admin operations.
- `/api/admin/dashboard` for admin dashboard data.
- `/api/admin/reports` for admin reporting.

## Database Design Highlights

### Important Relations

- A `User` can own many `Transaction` records.
- A `PlayStationUnit` can be linked to many transactions over time.
- A `RentalRate` is linked to transactions for hourly pricing reference.
- A `RentalPackage` is optionally linked to package-based transactions.
- A `Transaction` can contain many `TransactionItem` records.
- A `Product` can appear in many transaction items.

### Why Snapshot Data Is Used

Snapshot fields protect historical accuracy. When a transaction starts, the system stores:

- Hourly rate snapshot.
- Package name snapshot.
- Package price snapshot.
- Package duration snapshot.
- Product name snapshot.
- Product category snapshot.
- Product unit price snapshot.
- Product subtotal snapshot.

This prevents old invoices from changing when admins update prices, package names, or product data.

### Data Consistency Strategy

- Prisma transactions are used for critical workflows.
- Console status changes happen in the same operation as transaction creation or completion.
- Product stock is decremented when transaction items are added.
- Product totals are recalculated from transaction items.
- Grand total is stored as `rentalTotal + productTotal`.
- Foreign key restrictions prevent deleting referenced operational records.
- Snapshot fields keep completed transaction history readable and stable.

## Challenges

- Calculating rental duration from start time to finish time without undercharging short sessions.
- Supporting both open hourly billing and fixed package billing.
- Keeping package duration, package price, and hourly rate logic separate.
- Preserving old transaction values after price changes.
- Updating console availability during active and completed transactions.
- Preventing product stock from going negative.
- Keeping rental totals, product totals, and grand totals synchronized.
- Moving active rentals only between compatible console types.

## Key Learnings

- Business rules should live in one clear service layer, not be spread across controllers and UI code.
- Transaction history needs snapshot data, not only foreign keys.
- Billing logic should be explicit and testable.
- Database relations are not enough by themselves; application-level rules are still needed.
- Small operational systems need strong consistency because every mistake affects revenue.

## Project Status

### Completed

- Backend REST API structure.
- Authentication and role-based authorization.
- User management.
- PlayStation unit management.
- Rental rate management.
- Rental package management.
- Product management.
- Open rental transactions.
- Package rental transactions.
- Add-on product items in transactions.
- Snapshot pricing.
- Transaction completion logic.
- Transaction history.
- Admin dashboard and reports.
- React frontend integration.

### In Progress

- UI refinement for admin workflows.
- More complete validation feedback.
- Expanded transaction testing coverage.
- Report filtering improvements.

## Future Improvements

- Payment method tracking.
- Discount and voucher support.
- Receipt printing.
- Advanced stock adjustment history.
- Shift-based cashier reports.
- Revenue export to CSV or PDF.
- More granular audit logs.
- Automated tests for edge cases in rental billing.
- Deployment configuration for production.

## Impact

- Reduces manual calculation errors during rental checkout.
- Keeps console availability visible and easier to control.
- Preserves reliable transaction history after pricing changes.
- Combines rental revenue and product sales in one transaction record.
- Helps owners review daily operations with clearer revenue data.
- Gives cashiers a structured workflow for starting, updating, and finishing rentals.
