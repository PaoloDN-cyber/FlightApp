import { expressjwt as Jwt } from 'express-jwt';             // JWT parsing middleware for express

// We create the JWT authentication middleware provided by the express-jwt library.  
// 
// How it works (from the official documentation): If the token is valid, req.auth will be set with the JSON object 
// decoded to be used by later middleware for authorization and access control.


export const authenticateJWT = Jwt({
  secret: process.env.JWT_SECRET!,
  algorithms: ['HS256'],
  requestProperty: 'user',
});

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) return res.sendStatus(403);
    next();
  };
}
