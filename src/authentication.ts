import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as Boom from '@hapi/boom';

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
if (securityName === 'jwt') {
    const token =
      request.body.token ||
      request.query.token ||
      request.headers['x-access-token'];

    return new Promise((resolve, reject) => {
      if (!token) {
        reject(Boom.forbidden('No token provided'));
      }
      jwt.verify(token, process.env.TOKEN_SECRET, function (err: any, decoded: any) {
        if (err) {
          reject(Boom.forbidden('Token verification error', err));
        } else {
          // Check if JWT contains all required scopes
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