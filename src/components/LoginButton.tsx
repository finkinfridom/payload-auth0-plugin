import React from "react";

export interface LoginButtonProps {
  text?: string;
  href?: string;
}
const LoginButton = (props?: LoginButtonProps) => {
  return () => {
    const {
      text = "Log In with SSO",
      href = process.env.REACT_APP_AUTH0_LOGIN || "/auth0/login",
    } = props || {};
    return (
      <a
        className="btn btn--style-secondary btn--icon-style-without-border btn--size-medium"
        style={{
          width: "100%",
          display: "block",
        }}
        href={href}
      >
        {text}
      </a>
    );
  };
};
export default LoginButton;
