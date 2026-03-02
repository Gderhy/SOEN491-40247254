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
  
  // Asset specific errors
  ASSET_NOT_FOUND = 'Asset not found',
  ASSET_CREATION_FAILED = 'Failed to create asset',
  ASSET_UPDATE_FAILED = 'Failed to update asset',
  ASSET_DELETE_FAILED = 'Failed to delete asset',
  ASSET_FETCH_FAILED = 'Failed to fetch assets',
  INVALID_ASSET_ID = 'Invalid asset ID',
  INVALID_ASSET_VALUE = 'Asset value must be greater than 0',
  ASSET_REQUIRED_FIELDS = 'User ID, name, type, and value are required',
  
  // User errors
  USER_ID_REQUIRED = 'User ID is required',
  ASSET_ID_REQUIRED = 'Asset ID is required'
}

export enum SuccessMessage {
  // Asset messages
  ASSETS_RETRIEVED = 'Assets retrieved successfully',
  ASSET_CREATED = 'Asset created successfully',
  ASSET_UPDATED = 'Asset updated successfully',
  ASSET_DELETED = 'Asset deleted successfully',
  ASSET_RETRIEVED = 'Asset retrieved successfully',
  
  // Generic messages
  OPERATION_SUCCESSFUL = 'Operation completed successfully',
  DATA_SAVED = 'Data saved successfully',
  DATA_DELETED = 'Data deleted successfully'
}
