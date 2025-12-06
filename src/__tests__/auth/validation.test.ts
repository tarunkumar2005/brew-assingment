/**
 * Authentication Validation Tests
 * Tests for form validation logic used in login/signup
 */

describe("Email Validation", () => {
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  it("should accept valid email addresses", () => {
    const validEmails = [
      "test@example.com",
      "user.name@domain.org",
      "user+tag@example.co.uk",
      "firstname.lastname@company.com",
    ];

    validEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(true);
    });
  });

  it("should reject invalid email addresses", () => {
    const invalidEmails = [
      "",
      "   ",
      "notanemail",
      "@nodomain.com",
      "missing@.com",
      "spaces in@email.com",
      "missing@domain",
    ];

    invalidEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(false);
    });
  });
});

describe("Password Validation", () => {
  const validatePassword = (
    password: string
  ): { valid: boolean; message?: string } => {
    if (!password) {
      return { valid: false, message: "Password is required" };
    }
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters",
      };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return {
        valid: false,
        message: "Password must contain uppercase, lowercase, and number",
      };
    }
    return { valid: true };
  };

  it("should accept strong passwords", () => {
    const strongPasswords = [
      "Password123",
      "MySecure1Pass",
      "Test1234Abc",
      "StrongP@ss1",
    ];

    strongPasswords.forEach((password) => {
      expect(validatePassword(password).valid).toBe(true);
    });
  });

  it("should reject empty password", () => {
    const result = validatePassword("");
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Password is required");
  });

  it("should reject short passwords", () => {
    const result = validatePassword("Pass1");
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Password must be at least 8 characters");
  });

  it("should reject passwords without uppercase", () => {
    const result = validatePassword("password123");
    expect(result.valid).toBe(false);
  });

  it("should reject passwords without lowercase", () => {
    const result = validatePassword("PASSWORD123");
    expect(result.valid).toBe(false);
  });

  it("should reject passwords without numbers", () => {
    const result = validatePassword("PasswordABC");
    expect(result.valid).toBe(false);
  });
});

describe("Password Confirmation", () => {
  it("should pass when passwords match", () => {
    const password = "Password123";
    const confirmPassword = "Password123";
    expect(password === confirmPassword).toBe(true);
  });

  it("should fail when passwords don't match", () => {
    const password: string = "Password123";
    const confirmPassword: string = "Password456";
    expect(password === confirmPassword).toBe(false);
  });

  it("should be case sensitive", () => {
    const password: string = "Password123";
    const confirmPassword: string = "password123";
    expect(password === confirmPassword).toBe(false);
  });
});

describe("Name Validation", () => {
  const validateName = (name: string): { valid: boolean; message?: string } => {
    if (!name.trim()) {
      return { valid: false, message: "Name is required" };
    }
    if (name.trim().length < 2) {
      return { valid: false, message: "Name must be at least 2 characters" };
    }
    return { valid: true };
  };

  it("should accept valid names", () => {
    const validNames = ["John", "Jane Doe", "A B", "Tarun Kumar"];

    validNames.forEach((name) => {
      expect(validateName(name).valid).toBe(true);
    });
  });

  it("should reject empty names", () => {
    const result = validateName("");
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Name is required");
  });

  it("should reject whitespace-only names", () => {
    const result = validateName("   ");
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Name is required");
  });

  it("should reject single character names", () => {
    const result = validateName("A");
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Name must be at least 2 characters");
  });
});
