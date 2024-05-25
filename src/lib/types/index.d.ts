interface IRequest extends Request {
  user: any;
  headers: any;
}

type IAuthRequest = IRequest & {
  headers: { authorization: string };
};
