import { Strategy } from "passport";
import { Payload } from "payload";
import { Request } from "express";
import { pino } from "pino";
import { PaginatedDocs } from "payload/dist/mongoose/types";
import crypto from "crypto";

export class Auth0Strategy extends Strategy {
  ctx: Payload;
  readonly slug: string;
  logger: pino.Logger;
  constructor(ctx: Payload, collectionSlug: string) {
    super();
    this.ctx = ctx;
    this.name = "auth0";
    this.logger = this.ctx.logger.child({
      strategy: this.name,
    });
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
  findUser(oidcUser): Promise<PaginatedDocs<any>> {
    return this.ctx.find({
      collection: this.slug,
      where: {
        sub: {
          equals: oidcUser.sub,
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
  async authenticate(req: Request, options?: any): Promise<any> {
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
    this.success(req.user);
  }
}
