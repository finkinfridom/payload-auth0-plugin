import React from "react";
import { useAuth } from "payload/components/utilities";
import { AuthContext } from "payload/dist/admin/components/utilities/Auth/types";
import { Auth0User } from "./types";

const css = `
  .graphic-account .circle1 {
    fill: var(--theme-elevation-100);
  }
  .graphic-account .circle2, .graphic-account path {
    fill: var(--theme-elevation-300);
  }
`;

export default function Avatar() {
  return <h1>Ok</h1>;
  const { user } = useAuth() as AuthContext<Auth0User>;
  return user.picture ? (
    <img src={user.picture} />
  ) : (
    <svg
      className="graphic-account"
      width="25"
      height="25"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 25 25"
    >
      <style>{css}</style>
      <circle className="circle1" cx="12.5" cy="12.5" r="11.5" />
      <circle className="circle2" cx="12.5" cy="10.73" r="3.98" />
      <path d="M12.5,24a11.44,11.44,0,0,0,7.66-2.94c-.5-2.71-3.73-4.8-7.66-4.8s-7.16,2.09-7.66,4.8A11.44,11.44,0,0,0,12.5,24Z" />
    </svg>
  );
}
