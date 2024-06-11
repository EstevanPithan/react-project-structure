import Rollbar from "rollbar";

export const rollbarConfig: Rollbar.Configuration = {
  accessToken: "5a21631618224ffe93f37d499e76bdb2",
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: import.meta.env.MODE,
  ignoreDuplicateErrors: true,
  enabled: ["homologation", "production"].includes(import.meta.env.MODE),
  nodeSourceMaps: true,
};
