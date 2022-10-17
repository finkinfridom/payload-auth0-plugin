import { Auth0Strategy } from "../src/strategies/Auth0Strategy";
import payload from "payload";
import pino from "pino";
import { Request } from "express";
import { PaginatedDocs } from "payload/dist/mongoose/types";
jest.mock("payload");
describe("Auth0Strategy", () => {
  let strategy: Auth0Strategy;
  let protoSuccessMock;

  beforeAll(() => {
    payload.logger = pino();
    strategy = new Auth0Strategy(payload, "test-slug");
    Auth0Strategy.prototype.success = () => {};
    Auth0Strategy.prototype.error = () => {};
    protoSuccessMock = jest
      .spyOn(Auth0Strategy.prototype, "success")
      .mockImplementation();
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
    it("invalid 'oidc' should return error", async () => {
      const req = {
        oidc: {
          user: {
            id: "test-oidc",
          },
        },
      } as unknown as Request;

      await strategy.authenticate(req);
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

      const spyCreate = jest.spyOn(strategy.ctx, "create").mockResolvedValue({
        ...req["oidc"].user,
        password: strategy.createPassword(),
      });
      const spyFind = jest
        .spyOn(strategy.ctx, "find")
        .mockResolvedValue({ docs: [] } as unknown as PaginatedDocs<any>);
      await strategy.authenticate(req);
      expect(spyFind).toBeCalledTimes(1);
      expect(spyCreate).toBeCalledTimes(1);
      expect(protoSuccessMock).toBeCalledWith({
        id: "non-existing-oidc",
        email: "non-existing@oidc.com",
        password: "kdrjjwuo",
        collection: "test-slug",
        _strategy: "test-slug-auth0",
      });
    });
  });
});
