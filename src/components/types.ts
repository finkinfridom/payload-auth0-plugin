import { User } from "payload/dist/auth";

export declare type LoginButtonProps = {
  text?: string;
  href?: string;
};

export interface Auth0User extends User {
  picture: string;
}
