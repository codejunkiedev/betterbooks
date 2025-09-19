# Database Optimization Plan - Business Activity Tables

## Problem Analysis

The current database has significant redundancy and confusion with business activity tables:

### Current Problematic Tables:
1. `business_activities` - New normalized table
2. `business_activity` - Old denormalized table (redundant)
3. `business_activity_scenario` - Old junction table
4. `business_activity_sector_combinations` - Complex combinations table
5. `business_activity_sector_combinations_view` - Unnecessary view
6. `business_activity_sector_scenario` - Complex junction table
7. `user_business_activities` - User assignments (needs simplification)
8. `user_business_activities_view` - Unnecessary view

### Issues Identified:
- **Data Redundancy**: Multiple tables storing similar business activity data
- **Confusing Naming**: Similar table names with slight variations
- **Complex Relationships**: Overly complex junction tables
- **Inconsistent Structure**: Mix of old and new approaches
- **Unnecessary Views**: Views that could be simple queries

## Optimized Solution

### New Simplified Structure:

#### Core Tables:
1. **`business_activity_types`** - Business activity types (Manufacturer, Importer, etc.)
2. **`sectors`** - Business sectors (Steel, FMCG, etc.)
3. **`scenarios`** - FBR scenarios (existing, keep as is)
4. **`user_business_activities`** - User assignments (simplified)

#### Junction Table:
1. **`business_activity_scenarios`** - Simple scenario assignments

### Benefits:
- **Reduced Complexity**: From 8 tables to 5 tables
- **Clear Naming**: Descriptive table names
- **Simplified Relationships**: Direct many-to-many relationships
- **Better Performance**: Fewer joins required
- **Easier Maintenance**: Single source of truth for each concept

## Migration Steps

### Phase 1: Create New Structure
1. Create new optimized tables
2. Migrate data from old tables
3. Create indexes and constraints
4. Set up RLS policies

### Phase 2: Update Application Code
1. Update TypeScript types
2. Update API functions
3. Update frontend components
4. Test all functionality

### Phase 3: Cleanup
1. Drop old redundant tables
2. Remove unnecessary views
3. Update any remaining references

## New Table Structure

### business_activity_types
```sql
CREATE TABLE business_activity_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### sectors
```sql
CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_business_activities
```sql
CREATE TABLE user_business_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_activity_type_id INTEGER NOT NULL REFERENCES business_activity_types(id),
    sector_id INTEGER REFERENCES sectors(id),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_activity_type_id, sector_id)
);
```

### business_activity_scenarios
```sql
CREATE TABLE business_activity_scenarios (
    id SERIAL PRIMARY KEY,
    business_activity_type_id INTEGER REFERENCES business_activity_types(id),
    sector_id INTEGER REFERENCES sectors(id),
    scenario_id INTEGER NOT NULL REFERENCES scenario(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_activity_type_id, sector_id, scenario_id)
);
```

## Key Changes

### Before (Complex):
- Users select from pre-defined combinations
- Complex junction tables for scenarios
- Multiple views for simple queries
- Redundant data storage

### After (Simple):
- Users select business activity types and sectors independently
- Direct scenario assignments
- Simple queries without views
- Single source of truth

## Migration Files Created

1. `20250101000000_optimize_business_activity_schema.sql` - Creates new structure and migrates data
2. `20250101000001_cleanup_old_business_activity_tables.sql` - Removes old tables

## Next Steps

1. **Review and Test**: Review the migration files thoroughly
2. **Backup Database**: Create a full backup before running migrations
3. **Run Migrations**: Execute the migration files in order
4. **Update Code**: Update TypeScript types and API functions
5. **Test Application**: Ensure all functionality works with new structure
6. **Monitor**: Watch for any issues after deployment

## Rollback Plan

If issues arise:
1. Restore from backup
2. Revert application code changes
3. Investigate and fix issues
4. Re-run migrations after fixes

## Benefits After Optimization

- **Reduced Confusion**: Clear, descriptive table names
- **Better Performance**: Fewer joins and simpler queries
- **Easier Maintenance**: Single source of truth for each concept
- **Scalability**: Easier to add new business activities and sectors
- **Developer Experience**: Simpler to understand and work with
