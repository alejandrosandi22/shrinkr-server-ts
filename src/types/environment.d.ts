export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: 'test' | 'dev' | 'prod';
      DB_HOST: string;
      DB_PORT: number;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;

      JWT_SECRET: string;

      FACEBOOK_CLIENT_ID: string;
      FACEBOOK_CLIENT_SECRET: string;
      FACEBOOK_CALLBACK_URL: string;

      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_CALLBACK_URL: string;

      CLIENT_APP_URL: string;
      SERVER_APP_URL: string;

      MAIL_HOST: string;
      MAIL_PORT: number;
      MAIL_USER: string;
      MAIL_PASS: string;
      MAIL_FROM: string;
    }
  }
}
