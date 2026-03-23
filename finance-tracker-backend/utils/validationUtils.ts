const ALLOWED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD', 'AED', 'SAR'];

export const validatePhone = async (phone: string) => {
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
        return {
            valid: false,
            message: "Phone number is required"
        };
    }

    // E.164 format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
        return {
            valid: false,
            message: "Phone number must be in international format (e.g. +1234567890)"
        };
    }

    // Minimum digit length
    if (phone.replace(/\D/g, '').length < 8) {
        return {
            valid: false,
            message: "Phone number is too short"
        };
    }

    return { valid: true };
};

export const validateEmail = async (email: string) => {
    if (!email || typeof email !== 'string' || email.trim() === '') {
        return {
        valid: false,
        message: "Email is required"
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return {
        valid: false,
        message: "Invalid email format"
        };
    }

    return { valid: true };
};

export const validateAccount = async (name: string, type: string) => {
    const validTypes = ['savings', 'current', 'digital_wallet', 'loan', 'credit_card', 'cash', 'investment'];

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return {
        valid: false,
        message: 'Name is required and must be a non-empty string.',
        };
    }

    if (!type || typeof type !== 'string' || !validTypes.includes(type)) {
        return {
        valid: false,
        message: `Type must be one of: ${validTypes.join(', ')}`,
        };
    }

    return { valid: true };
};

// --- #16: Validate balance, currency, account_number_last4 ---
export const validateAccountDetails = (balance: unknown, currency: string, accountNumberLast4: string) => {
    const parsedBalance = parseFloat(balance as string);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
        return { valid: false, message: "Balance must be a non-negative number." };
    }

    if (currency && !ALLOWED_CURRENCIES.includes(currency)) {
        return { valid: false, message: `Currency must be one of: ${ALLOWED_CURRENCIES.join(', ')}` };
    }

    if (accountNumberLast4 && (typeof accountNumberLast4 !== 'string' || accountNumberLast4.length !== 4 || !/^\d{4}$/.test(accountNumberLast4))) {
        return { valid: false, message: "Account number last 4 digits must be exactly 4 digits." };
    }

    return { valid: true };
};

export const validateCategory = async (name: string, type: string) => {
    const validTypes = ['income', 'expense'];

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return {
        valid: false,
        message: 'Name is required and must be a non-empty string.',
        };
    }

    if (!type || typeof type !== 'string' || !validTypes.includes(type)) {
        return {
        valid: false,
        message: `Type must be one of: ${validTypes.join(', ')}`,
        };
    }

    return { valid: true };
};

// --- #15: Added transaction type validation ---
export const validateTransactionPayload = (body: Record<string, unknown>) => {
  const validRecurrenceRules = ["weekly", "bi-weekly", "monthly", "quarterly", "yearly"];
  const validTypes = ["income", "expense"];

  if (!body.account_id || typeof body.account_id !== "string") {
    return {
      valid: false,
      message: "Account ID is required and must be a string.",
    };
  }

  if (!body.category_id || typeof body.category_id !== "string") {
    return {
      valid: false,
      message: "Category ID is required and must be a string.",
    };
  }

  if (typeof body.amount !== "number" || isNaN(body.amount) || body.amount <= 0) {
    return {
      valid: false,
      message: "Amount must be a positive number.",
    };
  }

  // --- #15: Type must be "income" or "expense" ---
  if (!body.type || typeof body.type !== "string" || !validTypes.includes(body.type)) {
    return {
      valid: false,
      message: `Type must be one of: ${validTypes.join(", ")}`,
    };
  }

  if (
    body.recurrence_rule &&
    !validRecurrenceRules.includes(body.recurrence_rule as string)
  ) {
    return {
      valid: false,
      message: `Recurrence rule must be one of: ${validRecurrenceRules.join(", ")}`,
    };
  }

  return { valid: true };
};
