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
  USER_ID_REQUIRED = 'User ID is required'
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

  // Generic messages
  OPERATION_SUCCESSFUL = 'Operation completed successfully',
  DATA_SAVED = 'Data saved successfully',
  DATA_DELETED = 'Data deleted successfully'
}
