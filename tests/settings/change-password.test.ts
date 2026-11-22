import { describe, expect, it } from "vitest";
import { changePasswordSchema } from "@/lib/validators";

describe("changePasswordSchema", () => {
  it("accepts valid input", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "current123",
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Current password is required.",
      );
    }
  });

  it("rejects new password shorter than 8 characters", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "current123",
      newPassword: "short",
      confirmPassword: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "New password must be at least 8 characters.",
      );
    }
  });

  it("rejects when new password and confirmation do not match", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "current123",
      newPassword: "newpass123",
      confirmPassword: "different123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Passwords do not match.");
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects empty new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "current123",
      newPassword: "",
      confirmPassword: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "New password must be at least 8 characters.",
      );
    }
  });
});
