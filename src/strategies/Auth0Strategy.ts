import { Strategy } from "passport";
import { Payload } from "payload";
import { Request } from "express";
import { pino } from "pino";
import { PaginatedDocs } from "payload/dist/mongoose/types";

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

  createUser(oidcUser): Promise<any> {
    return this.ctx.create({
      collection: this.slug,
      data: {
        ...oidcUser,
        password: Math.random().toString(36).slice(-8),
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

  mergeUsers(foundUser, oidcUser): void {
    this.ctx
      .update({
        collection: this.slug,
        id: foundUser.id,
        data: {
          ...oidcUser,
        },
      })
      .then((doc) => {
        this.successCallback(doc);
      });
  }
  successCallback(user): void {
    user.collection = this.slug;
    user._strategy = `${this.slug}-${this.name}`;
    this.success(user);
  }
  authenticate(req: Request, options?: any): void {
    // @ts-ignore
    if (req.oidc && req.oidc.user) {
      // @ts-ignore
      const oidcUser = { ...req.oidc.user };
      if (!oidcUser.email) {
        this.error(new Error("email is empty"));
        return;
      }
      this.findUser(oidcUser).then((users) => {
        if (users.docs && users.docs.length) {
          const user = users.docs[0];
          this.mergeUsers(user, oidcUser);
          return;
        }
        this.createUser(oidcUser).then((doc) => {
          this.successCallback(doc);
        });
      });
      return;
    }
    this.success(req.user);
  }
}
