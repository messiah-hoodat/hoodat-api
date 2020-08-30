import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as Boom from '@hapi/boom';

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === 'jwt') {
    return new Promise((resolve, reject) => {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        reject(Boom.forbidden('No Authorization header provided'));
      }

      const isBearer = /^Bearer .*/.test(authHeader);
      if (!isBearer) {
        reject(Boom.forbidden(`Authorization header must follow pattern: 'Bearer <token>'`))
      }

      const token = authHeader.split('Bearer ')[1];
      if (!token) {
        reject(Boom.forbidden('No token provided'));
      }

      jwt.verify(token, process.env.TOKEN_SECRET, function (err: any, decoded: any) {
        if (err) {
          console.warn('Caught token verification error: ', err);
          reject(Boom.forbidden('Token verification error'));
        } else {
          for (let scope of scopes) {
            if (!decoded.scopes.includes(scope)) {
              reject(Boom.forbidden('Token does not contain required scope', scope));
            }
          }
          resolve(decoded);
        }
      });
    });
  }
}