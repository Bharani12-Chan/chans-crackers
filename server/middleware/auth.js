import User from "../models/User.js";

export function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function requireAuth(req, res, next) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        message: "Please log in first"
      });
    }

    const user = await User.findById(req.session.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Session expired. Please log in again"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "You are registered as a customer, not an admin"
    });
  }

  next();
}