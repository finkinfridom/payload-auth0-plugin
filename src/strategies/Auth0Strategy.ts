import { Strategy } from "passport";
import { Payload } from "payload";
import { Request } from "express";
import { pino } from "pino";
import { PaginatedDocs } from "payload/database";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import getExtractJWT from "payload/dist/auth/getExtractJWT";
import { PayloadRequest } from "payload/dist/types";

export class Auth0Strategy extends Strategy {
  ctx: Payload;
  readonly slug: string;
  logger: pino.Logger;
  constructor(ctx: Payload, collectionSlug: string) {
    super();
    this.ctx = ctx;
    this.name = "auth0";
    this.logger = pino({ name: this.name });
    this.slug = collectionSlug;
  }

  createPassword(
    length = 20,
    wishlist = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$"
  ): string {
    return Array.from(crypto.randomFillSync(new Uint32Array(length)))
      .map((x) => wishlist[x % wishlist.length])
      .join("");
  }

  createUser(oidcUser): Promise<any> {
    return this.ctx.create({
      collection: this.slug,
      data: {
        ...oidcUser,
        password: this.createPassword(),
      },
    });
  }
  async findUser(oidcUser): Promise<PaginatedDocs<any>> {
    const result = await this.ctx.find({
      collection: this.slug,
      where: {
        sub: {
          equals: oidcUser.sub,
        },
      },
    });
    if (result.docs && result.docs.length) {
      return Promise.resolve(result);
    }
    return this.ctx.find({
      collection: this.slug,
      where: {
        email: {
          equals: oidcUser.email,
        },
      },
    });
  }

  async mergeUsers(foundUser, oidcUser): Promise<void> {
    const doc = await this.ctx.update({
      collection: this.slug,
      id: foundUser.id,
      data: {
        ...oidcUser,
      },
    });
    this.successCallback(doc);
  }
  successCallback(user): void {
    user.collection = this.slug;
    user._strategy = `${this.slug}-${this.name}`;
    this.success(user);
  }
  async authenticate(req: Request): Promise<any> {
    // @ts-ignore
    if (req.oidc && req.oidc.user) {
      // @ts-ignore
      const oidcUser = { ...req.oidc.user };
      if (!oidcUser.email) {
        const err = new Error("email is empty");
        this.error(err);
        return Promise.resolve(err);
      }
      const collection = await this.findUser(oidcUser);
      if (collection.docs && collection.docs.length) {
        const doc = collection.docs[0];
        await this.mergeUsers(doc, oidcUser);
        return;
      }
      const doc = await this.createUser(oidcUser);
      this.successCallback(doc);
      return;
    }
    if (!req.user) {
      const payloadToken = getExtractJWT(this.ctx.config)(req);
      if (payloadToken) {
        const tokenData = jwt.verify(
          payloadToken,
          (req as PayloadRequest).payload.secret,
          {}
        );
        if (tokenData) {
          const collection = await this.ctx.find({
            collection: tokenData.collection as string,
            where: {
              id: {
                equals: tokenData.id,
              },
            },
          });
          if (collection && collection.docs && collection.docs.length) {
            const user = collection.docs[0];
            this.success({
              ...user,
              collection: tokenData.collection,
            });

            return;
          }
        }
      }
    }
    this.success(req.user);
  }
}
