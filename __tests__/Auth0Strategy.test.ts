import { Auth0Strategy } from "../src/strategies/Auth0Strategy";
import payload from "payload";
import pino from "pino";
import { Request } from "express";
import { getConfigFileParsingDiagnostics } from "typescript";
import { PaginatedDocs } from "payload/dist/mongoose/types";
jest.mock("payload");
describe("Auth0Strategy", () => {
  let strategy: Auth0Strategy;
  beforeAll(() => {
    payload.logger = pino();
    strategy = new Auth0Strategy(payload, "test-slug");
    Auth0Strategy.prototype.success = () => {};
    Auth0Strategy.prototype.error = () => {};
    jest.spyOn(Auth0Strategy.prototype, "success").mockImplementation();
    jest.spyOn(Auth0Strategy.prototype, "error").mockImplementation();
    jest.spyOn(Math, "random").mockImplementation(() => 0.08531340799759524);
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it("slug should not be null", () => {
    expect(strategy.slug).toBe("test-slug");
  });
  it("name should be 'auth0'", () => {
    expect(strategy.name).toBe("auth0");
  });
  describe("authenticate", () => {
    it("should fallback to standard user-pwd login", () => {
      const req = {
        user: {
          id: "test",
        },
      } as unknown as Request;
      strategy.authenticate(req);
      expect(strategy.success).toBeCalledWith(req.user);
    });
    it("invalid 'oidc' should return error", () => {
      const req = {
        oidc: {
          user: {
            id: "test-oidc",
          },
        },
      } as unknown as Request;

      strategy.authenticate(req);
      expect(strategy.error).toBeCalled();
    });
    it("non-existing user should create a new one", async () => {
      const req = {
        oidc: {
          user: {
            id: "non-existing-oidc",
            email: "non-existing@oidc.com",
          },
        },
      } as unknown as Request;

      jest.spyOn(strategy.ctx, "find").mockImplementation(() => {
        return new Promise<PaginatedDocs<any>>((resolve) => {
          resolve({ docs: [] } as unknown as PaginatedDocs<any>);
        });
      });
      jest.spyOn(strategy.ctx, "create").mockResolvedValue({ created: 1 });
      strategy.authenticate(req);
      expect(strategy.ctx.find).toBeCalledTimes(1);
      (await expect(strategy.ctx.create)).resolves.toEqual({ created: 1 });
      expect(strategy.success).toBeCalledWith({
        id: "non-existing-oidc",
        email: "non-existing@oidc.com",
        password: "kdrjjwuo",
        collection: "test-slug",
        _strategy: "test-slug-auth0",
      });
    });
  });
});
