export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Ocurrió un error inesperado. Inténtalo de nuevo.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }

  if (message.includes("email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesión.";
  }

  if (message.includes("user already registered")) {
    return "Este correo ya está registrado.";
  }

  if (message.includes("password should be at least")) {
    return "La contraseña es demasiado corta.";
  }

  if (message.includes("unable to validate email address")) {
    return "Ingresa un correo válido.";
  }

  if (message.includes("otp expired") || message.includes("jwt expired")) {
    return "El enlace expiró. Solicita uno nuevo.";
  }

  if (message.includes("same password")) {
    return "La nueva contraseña no debe ser igual a la anterior.";
  }

  return error.message || "Ocurrió un error inesperado. Inténtalo de nuevo.";
}