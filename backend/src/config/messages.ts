/**
 * Application Error Messages
 * Centralized error messages to avoid magic strings
 */

export enum ErrorMessage {
  // Generic errors
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
  BAD_REQUEST = 'Bad Request',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Access Forbidden',
  NOT_FOUND = 'Resource Not Found',
  
  // Authentication errors
  USER_NOT_AUTHENTICATED = 'User not authenticated',
  INVALID_TOKEN = 'Invalid authentication token',
  TOKEN_EXPIRED = 'Authentication token has expired',
  
  // Validation errors
  VALIDATION_FAILED = 'Validation failed',
  REQUIRED_FIELD_MISSING = 'Required field is missing',
  INVALID_INPUT_FORMAT = 'Invalid input format',

  // User errors
  USER_ID_REQUIRED = 'User ID is required',

  // Trading platform / account errors
  PLATFORM_NOT_FOUND = 'Trading platform not found',
  PLATFORM_NAME_REQUIRED = 'Platform name is required',
  PLATFORM_ALREADY_EXISTS = 'A platform with that name already exists',
  ACCOUNT_NOT_FOUND = 'Trading account not found',
  ACCOUNT_NAME_REQUIRED = 'Account name is required',
  ACCOUNT_ALREADY_EXISTS = 'An account with that name already exists for this platform',
  PLATFORM_ID_REQUIRED = 'Platform ID is required',
  ACCOUNT_HAS_TRANSACTIONS = 'Cannot delete account: it still has transactions linked to it'
}

export enum SuccessMessage {
  // Transaction messages
  TRANSACTIONS_RETRIEVED = 'Transactions retrieved successfully',
  TRANSACTION_CREATED = 'Transaction created successfully',
  TRANSACTION_UPDATED = 'Transaction updated successfully',
  TRANSACTION_DELETED = 'Transaction deleted successfully',
  TRANSACTION_RETRIEVED = 'Transaction retrieved successfully',
  PORTFOLIO_POSITIONS_RETRIEVED = 'Portfolio positions retrieved successfully',
  PORTFOLIO_METRICS_RETRIEVED = 'Portfolio metrics retrieved successfully',

  // Auth messages
  USER_RETRIEVED = 'User retrieved successfully',
  TOKEN_VALID = 'Token is valid',

  // Trading platform messages
  PLATFORMS_RETRIEVED = 'Trading platforms retrieved successfully',
  PLATFORM_CREATED = 'Trading platform created successfully',
  PLATFORM_DELETED = 'Trading platform deleted successfully',

  // Trading account messages
  ACCOUNTS_RETRIEVED = 'Trading accounts retrieved successfully',
  ACCOUNT_CREATED = 'Trading account created successfully',
  ACCOUNT_DELETED = 'Trading account deleted successfully',

  // Generic messages
  OPERATION_SUCCESSFUL = 'Operation completed successfully',
  DATA_SAVED = 'Data saved successfully',
  DATA_DELETED = 'Data deleted successfully'
}
