declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    NODE_ENV: "development" | "production";
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    BREVO_HOST: string;
    BREVO_PORT: string;
    BREVO_LOGIN: string;
    BREVO_PASSWORD: string;
  }
}
