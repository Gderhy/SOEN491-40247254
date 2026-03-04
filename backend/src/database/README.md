# Database Models & Structure

This folder contains the database models, types, and database-related utilities for the asset tracker backend.

## 📁 Folder Structure

```
backend/src/
├── models/           # TypeScript interfaces and types
│   ├── BaseModel.ts  # Base interfaces for all models
│   ├── Asset.ts      # Asset model and related types
│   ├── Transaction.ts # Transaction model and related types
│   ├── User.ts       # User model and related types
│   └── index.ts      # Barrel file exporting all models
├── database/
│   ├── migrations/   # SQL migration files
│   ├── AssetRepository.ts     # Asset database operations
│   ├── DatabaseService.ts     # Database utilities
│   └── README.md             # This file
```

## 🗂️ Models

### Asset Model
Represents the `public.assets` table with the following fields:

- `id`: UUID primary key (auto-generated)
- `user_id`: Reference to `auth.users(id)` (cascade delete)
- `type`: Asset type (stock, crypto, real_estate, etc.)
- `name`: Display name of the asset
- `symbol`: Trading symbol (optional, e.g., AAPL, BTC)
- `quantity`: Amount owned (up to 8 decimal places)
- `value`: Current value (must be >= 0)
- `currency`: Currency code (default: CAD)
- `provider`: Data provider (optional)
- `source`: How asset was added (default: manual)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp (auto-updated)

### Transaction Model
Represents the `public.transactions` table with the following fields:

- `id`: UUID primary key (auto-generated)
- `user_id`: Reference to `auth.users(id)` (cascade delete)
- `symbol`: Trading symbol (e.g., AAPL, BTC, TSLA)
- `name`: Display name of the asset
- `type`: Transaction type ('buy' or 'sell')
- `quantity`: Number of shares/units (must be > 0, up to 8 decimal places)
- `price_per_unit`: Price per share/unit at transaction time (must be > 0)
- `total_amount`: Total transaction amount (quantity * price_per_unit)
- `currency`: Currency code (default: CAD)
- `transaction_date`: When the transaction occurred (default: now)
- `fees`: Transaction fees/commissions (default: 0, must be >= 0)
- `notes`: Optional transaction notes
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp (auto-updated)

### Related Types
- `CreateAssetPayload`: For creating new assets
- `UpdateAssetPayload`: For updating existing assets
- `AssetFilters`: For querying assets with filters
- `AssetQueryResult`: Paginated query results
- `CreateTransactionPayload`: For creating new transactions
- `UpdateTransactionPayload`: For updating existing transactions
- `PortfolioPosition`: Aggregated position data per symbol
- `PortfolioMetrics`: Overall portfolio performance metrics

## 🗃️ Database Operations

### AssetRepository
Handles all database operations for assets:

- `getAssets(filters)`: Get paginated assets with filters
- `getAssetById(id, userId)`: Get single asset by ID
- `createAsset(payload)`: Create new asset
- `updateAsset(id, payload)`: Update existing asset
- `deleteAsset(id, userId)`: Delete asset
- `getAssetStats(userId)`: Get user's asset statistics

### Security
- All operations are scoped to the authenticated user
- User can only access/modify their own assets
- Foreign key constraints ensure data integrity

## 📝 Migrations

Migration files are stored in `database/migrations/` with naming convention:
`{number}_{description}.sql`

### Current Migrations
1. `001_create_assets_table.sql`: Creates the assets table with indexes and triggers
2. `002_enable_rls_assets.sql`: Enables Row Level Security for assets table
3. `003_create_transactions_table.sql`: Creates the transactions table with indexes, triggers, and constraints
4. `004_enable_rls_transactions.sql`: Enables Row Level Security for transactions table
5. `005_insert_sample_transactions.sql`: Inserts sample transaction data for testing/demo
6. `006_insert_user_transactions.sql`: Inserts per-user transaction data for testing/demo
7. `007_portfolio_holdings_function.sql`: Creates `get_portfolio_holdings(uuid)` — a Postgres function
   that aggregates transactions into per-symbol holdings **entirely inside the database** using
   `GROUP BY` + conditional `SUM`. Called via `supabase.rpc()` from the backend service.

> ⚠️ **Migration 007 must be run before the `/api/transactions/portfolio` endpoint will work.**
> Paste the contents of `007_portfolio_holdings_function.sql` into the Supabase SQL editor and execute it.

### Migration Execution Order
Run migrations in numerical order to ensure proper database setup:

```bash
# Run these in your Supabase SQL editor or via migration tool
psql -f 001_create_assets_table.sql
psql -f 002_enable_rls_assets.sql
psql -f 003_create_transactions_table.sql
psql -f 004_enable_rls_transactions.sql
psql -f 005_insert_sample_transactions.sql  # Optional - for demo data
```

## 🚀 Usage Examples

### Assets
```typescript
import { AssetRepository, CreateAssetPayload } from '../database/AssetRepository.js';

// Create a new asset
const newAsset: CreateAssetPayload = {
  user_id: 'user-uuid',
  type: 'stock',
  name: 'Apple Inc.',
  symbol: 'AAPL',
  quantity: 10,
  value: 1500.00,
  currency: 'USD'
};

const asset = await AssetRepository.createAsset(newAsset);

// Get user's assets with filters
const result = await AssetRepository.getAssets({
  user_id: 'user-uuid',
  type: 'stock',
  pagination: { page: 1, limit: 20 },
  sort: [{ field: 'created_at', direction: 'desc' }]
});
```

### Transactions
```typescript
import { TransactionsService, CreateTransactionPayload } from '../services/transactions.service.js';

// Create a new buy transaction
const newTransaction: CreateTransactionPayload = {
  user_id: 'user-uuid',
  symbol: 'AAPL',
  name: 'Apple Inc.',
  type: TransactionType.BUY,
  quantity: 10,
  price_per_unit: 150.00,
  currency: 'CAD',
  fees: 9.99,
  notes: 'Initial purchase'
};

const transaction = await TransactionsService.createTransaction(newTransaction);

// Get user's transactions
const transactions = await TransactionsService.getTransactions('user-uuid');

// Get portfolio positions (aggregated by symbol)
const positions = await TransactionsService.getPortfolioPositions('user-uuid');

// Get portfolio performance metrics
const metrics = await TransactionsService.getPortfolioMetrics('user-uuid');
```

## 🔧 Environment Setup

The database uses Supabase PostgreSQL with:
- Row Level Security (RLS) enabled
- Automatic timestamps via triggers
- Proper indexing for performance
- Foreign key constraints for data integrity

Make sure your Supabase project has the migrations applied and proper RLS policies configured.
