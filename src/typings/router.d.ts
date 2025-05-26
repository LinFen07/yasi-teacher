export interface Router {
  name?: string;
  path: string;
  children?: Array<Router>;
  element: any;
}