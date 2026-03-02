# Database Models & Structure

This folder contains the database models, types, and database-related utilities for the asset tracker backend.

## 📁 Folder Structure

```
backend/src/
├── models/           # TypeScript interfaces and types
│   ├── BaseModel.ts  # Base interfaces for all models
│   ├── Asset.ts      # Asset model and related types
│   ├── User.ts       # User model and related types
│   └── index.ts      # Barrel file exporting all models
├── database/
│   ├── migrations/   # SQL migration files
│   ├── AssetRepository.ts  # Asset database operations
│   └── DatabaseService.ts # Database utilities
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

### Related Types
- `CreateAssetPayload`: For creating new assets
- `UpdateAssetPayload`: For updating existing assets
- `AssetFilters`: For querying assets with filters
- `AssetQueryResult`: Paginated query results

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

## 🚀 Usage Examples

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

## 🔧 Environment Setup

The database uses Supabase PostgreSQL with:
- Row Level Security (RLS) enabled
- Automatic timestamps via triggers
- Proper indexing for performance
- Foreign key constraints for data integrity

Make sure your Supabase project has the migrations applied and proper RLS policies configured.
