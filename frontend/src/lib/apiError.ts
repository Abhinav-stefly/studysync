import { isAxiosError } from "axios";

// Turns an API failure into something readable. Understands the validation
// shape from our errorHandler: { errors: [{ field, message }] }.
export const getApiErrorMessage = (err: unknown, fallback = "Something went wrong. Try again."): string => {
  if (isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; errors?: { field: string; message: string }[] }
      | undefined;
    if (data?.errors?.length) {
      return data.errors.map((e) => `${e.field}: ${e.message}`).join(" · ");
    }
    if (data?.message) return data.message;
    if (!err.response) {
      return "Can't reach the server. If it's been idle, give it a minute to wake up and try again.";
    }
  }
  return fallback;
};