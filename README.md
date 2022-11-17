# payload-auth0-plugin

Extends `payloadcms` with Auth0 integration

## Current status

[![codeql](https://github.com/finkinfridom/payload-auth0-plugin/actions/workflows/codeql.yml/badge.svg)](https://github.com/finkinfridom/payload-auth0-plugin/actions/workflows/codeql.yml)

[![test](https://github.com/finkinfridom/payload-auth0-plugin/actions/workflows/test.yml/badge.svg)](https://github.com/finkinfridom/payload-auth0-plugin/actions/workflows/test.yml)

[![publish](https://github.com/finkinfridom/payload-auth0-plugin/actions/workflows/publish.yml/badge.svg)](https://github.com/finkinfridom/payload-auth0-plugin/actions/workflows/publish.yml)

[![GitHub Super-Linter](https://github.com/finkinfridom/payload-auth0-plugin/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/finkinfridom/payload-auth0-plugin/actions/workflows/linter.yml)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/450dafca0414474b9e39f63e2159bb43)](https://www.codacy.com/gh/finkinfridom/payload-auth0-plugin/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=finkinfridom/payload-auth0-plugin&amp;utm_campaign=Badge_Grade)

[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/450dafca0414474b9e39f63e2159bb43)](https://www.codacy.com/gh/finkinfridom/payload-auth0-plugin/dashboard?utm_source=github.com&utm_medium=referral&utm_content=finkinfridom/payload-auth0-plugin&utm_campaign=Badge_Coverage)

## Install

`yarn add payload-auth0-plugin`

## Get Started

### server.ts

```js
import { auth } from "express-openid-connect";
const config = {
  authRequired: false,
  idpLogout: true,
  auth0Logout: true,
  baseURL: process.env.REACT_APP_SERVER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  secret: "<LONG_RANDOM_STRING>",
  routes: {
    login: process.env.REACT_APP_AUTH0_LOGIN_URL,
    logout: process.env.REACT_APP_AUTH0_LOGOUT_URL,
    callback: process.env.AUTH0_CALLBACK_URL,
  },
};
app.use(auth(config));
```

### payload.config.ts

```js
import { Avatar, LoginButton, LogoutButton } from "payload-auth0-plugin/dist/components";

export default buildConfig({
    ....
    admin:{
        avatar: Avatar,
        components: {
            afterLogin: [LoginButton()],
            afterNavLinks: [LogoutButton()],
        },
    }
})
```

### your-auth-collection.ts

```js
import { Auth0Strategy } from "payload-auth0-plugin";
import { PictureField } from "payload-auth0-plugin/dist/components";

const MyAuthCollection: CollectionConfig = {
  slug: "authCollection",
  auth: {
    strategies: [
      {
        name: Auth0Strategy.name,
        strategy: (ctx) => {
          return new Auth0Strategy(ctx, "authCollection");
        },
      },
    ],
  },
  fields: [
    {
      name: "picture",
      type: "text",
      admin: {
        hidden: true,
        condition: (data) => {
          return data.picture;
        },
      },
    },
    {
      name: "pictureVisual",
      type: "ui",
      admin: {
        position: "sidebar",
        condition: (_, siblingData) => {
          return siblingData.picture;
        },
        components: {
          Field: PictureField,
          Cell: PictureField,
        },
      },
    },
    {
      name: "sub",
      type: "text",
      admin: {
        readOnly: true,
        condition: (data) => {
          return data.sub;
        },
      },
    },
  ],
};
```
