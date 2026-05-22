import type { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
  id?: number | string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}
