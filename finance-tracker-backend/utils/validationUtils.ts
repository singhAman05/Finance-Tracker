export const validatePhone = async (phone: string) => {
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
        return {
            valid: false,
            message: "Phone number is required"
        };
    }

    // Updated regex for E.164 format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
        return {
            valid: false,
            message: "Phone number must be in international format (e.g. +1234567890)"
        };
    }

    // Additional check for minimum length
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

export const validateCategory = async(name: string, type: string)=>{
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

    return {valid : true};
};

export const validateTransactionPayload = (body: any) => {
  const validRecurrenceRules = ["weekly", "bi-weekly", "monthly", "quarterly", "yearly"];

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

  if (
    body.recurrence_rule &&
    !validRecurrenceRules.includes(body.recurrence_rule)
  ) {
    return {
      valid: false,
      message: `Recurrence rule must be one of: ${validRecurrenceRules.join(", ")}`,
    };
  }

  return { valid: true };
};
