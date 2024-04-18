import 'express';

declare module 'express' {
  interface Request {
    user: any;
    device: {
      parser: {
        options: {
          emptyUserAgentDeviceType: string;
          unknownUserAgentDeviceType: string;
          botUserAgentDeviceType: string;
          carUserAgentDeviceType: string;
          consoleUserAgentDeviceType: string;
          tvUserAgentDeviceType: string;
          parseUserAgent: boolean;
        };
      };
      type: string;
      name: string;
    };
  }
}
