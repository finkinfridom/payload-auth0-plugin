# payload-auth0-plugin

Extends `payloadcms` with Auth0 integration

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
