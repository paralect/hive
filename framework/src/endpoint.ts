import type { z } from 'zod';

// --- URL param extraction ---

type ExtractRouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type RouteParams<T extends string> =
  [ExtractRouteParams<T>] extends [never]
    ? Record<string, string>
    : Record<ExtractRouteParams<T>, string>;

// --- HTTP method ---

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'
  | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// --- Middleware ---

type MiddlewareFn = (ctx: any, next: () => Promise<any>) => any;
type MiddlewareRef = string | { name: string; args: any[] };
type Middleware = MiddlewareFn | MiddlewareRef;

// --- Koa context with Hive extensions ---

interface HiveContext<
  TValidatedData = undefined,
  TParams extends Record<string, string> = Record<string, string>,
> {
  validatedData: TValidatedData;
  params: TParams;

  request: {
    body: any;
    method: string;
    url: string;
    header: Record<string, string | string[] | undefined>;
    headers: Record<string, string | string[] | undefined>;
    [key: string]: any;
  };
  body: any;
  status: number;
  query: Record<string, string | string[]>;
  headers: Record<string, string | string[] | undefined>;
  cookies: {
    get(name: string, opts?: any): string | undefined;
    set(name: string, value?: string | null, opts?: any): this;
  };
  originalUrl: string;
  method: string;
  path: string;
  url: string;
  ip: string;
  host: string;

  state: {
    user: any;
    accessToken: string | null;
    isSkipAuth?: boolean;
    isSkipLog?: boolean;
    resourceName?: string;
    endpoint?: any;
    error?: any;
    [key: string]: any;
  };

  throwError(message: string): never;
  assertError(condition: any, message: string): asserts condition;
  throwClientError(errors: Record<string, string | string[]>): never;
  assertClientError(condition: any, errors: Record<string, string | string[]>): asserts condition;

  throw(status: number, msg?: any, properties?: Record<string, any>): never;
  assert(condition: any, status: number, msg?: any, properties?: Record<string, any>): asserts condition;
  set(field: string | Record<string, string | string[]>, val?: string | string[]): void;
  get(field: string): string;
  redirect(url: string, alt?: string): void;

  [key: string]: any;
}

// --- Endpoint definition (what routes/index.ts consumes) ---

interface EndpointDefinition {
  endpoint: {
    url?: string;
    absoluteUrl?: string;
    method?: string;
    name?: string;
  };
  handler: (ctx: any) => any;
  requestSchema?: z.ZodType;
  middlewares?: Middleware[];
}

// --- The helper function ---

function endpoint<
  TUrl extends string = '/',
  TSchema extends z.ZodType | undefined = undefined,
>(config: {
  url?: TUrl;
  absoluteUrl?: string;
  method?: HttpMethod;
  requestSchema?: TSchema;
  middlewares?: Middleware[];
  handler: (
    ctx: HiveContext<
      TSchema extends z.ZodType ? z.infer<TSchema> : undefined,
      RouteParams<TUrl>
    >
  ) => any;
}): EndpointDefinition {
  const { url, absoluteUrl, method, requestSchema, middlewares, handler } = config;

  return {
    endpoint: {
      ...(url !== undefined ? { url } : {}),
      ...(absoluteUrl !== undefined ? { absoluteUrl } : {}),
      method: method || 'get',
    },
    handler,
    ...(requestSchema !== undefined ? { requestSchema } : {}),
    ...(middlewares !== undefined ? { middlewares } : {}),
  };
}

export { endpoint, type HiveContext, type EndpointDefinition };
export default endpoint;
