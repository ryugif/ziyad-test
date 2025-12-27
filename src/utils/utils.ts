export const ERROR_CODE = {
  INVALID_USER: {
    status: 422,
    message: 'Invalid user',
    ziyadErrorCode: 'ZYD-ERR-001',
  },
  BOOK_NOT_FOUND: {
    status: 422,
    message: 'One or more books not found',
    ziyadErrorCode: 'ZYD-ERR-002',
  },
  QUANTITY_NOT_MATCH: {
    status: 422,
    message: 'Returned quantity exceeds borrowed quantity',
    ziyadErrorCode: 'ZYD-ERR-003',
  },
  QUANTITY_EXCEEDS_STOCK: {
    status: 422,
    message: 'Requested quantity exceeds available stock',
    ziyadErrorCode: 'ZYD-ERR-004',
  },
  TRANSACTION_NOT_FOUND: {
    status: 422,
    message: 'Transaction not found',
    ziyadErrorCode: 'ZYD-ERR-005',
  },
};

export function generateTraceId(): string {
  return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
