const fs = require("fs");
const path = require("path");
const AccessRole = require("../middleware/AccessRole");

module.exports = (app) => {
  const routesPath = __dirname;

  fs.readdirSync(routesPath).forEach((item) => {
    const itemPath = path.join(routesPath, item);
    const stat = fs.statSync(itemPath);

    if (item === "routesHandler.js") return;

    if (stat.isDirectory()) {
      fs.readdirSync(itemPath).forEach((file) => {
        if (!file.endsWith(".js")) return;

        const filePath = path.join(itemPath, file);
        const route = require(filePath);

        const routeName = `/api/${file.split(".")[0]}`;

        if (route.Access_Role) {
          app.use(
            routeName,
            AccessRole(route.message, ...route.Access_Role),
            route,
          );
        } else {
          app.use(routeName, route);
        }
      });
    } else if (item.endsWith(".js")) {
      const route = require(itemPath);
      const routeName = `/api/${item.split(".")[0]}`;

      if (route.Access_Role) {
        app.use(
          routeName,
          AccessRole(route.message, ...route.Access_Role),
          route,
        );
      } else {
        app.use(routeName, route);
      }
    }
  });
};
