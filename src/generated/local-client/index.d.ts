
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Parametre
 * 
 */
export type Parametre = $Result.DefaultSelection<Prisma.$ParametrePayload>
/**
 * Model AppRole
 * 
 */
export type AppRole = $Result.DefaultSelection<Prisma.$AppRolePayload>
/**
 * Model AppUser
 * 
 */
export type AppUser = $Result.DefaultSelection<Prisma.$AppUserPayload>
/**
 * Model CronJob
 * 
 */
export type CronJob = $Result.DefaultSelection<Prisma.$CronJobPayload>
/**
 * Model Alignment
 * 
 */
export type Alignment = $Result.DefaultSelection<Prisma.$AlignmentPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Parametres
 * const parametres = await prisma.parametre.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Parametres
   * const parametres = await prisma.parametre.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<'extends', Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.parametre`: Exposes CRUD operations for the **Parametre** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Parametres
    * const parametres = await prisma.parametre.findMany()
    * ```
    */
  get parametre(): Prisma.ParametreDelegate<ExtArgs>;

  /**
   * `prisma.appRole`: Exposes CRUD operations for the **AppRole** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppRoles
    * const appRoles = await prisma.appRole.findMany()
    * ```
    */
  get appRole(): Prisma.AppRoleDelegate<ExtArgs>;

  /**
   * `prisma.appUser`: Exposes CRUD operations for the **AppUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppUsers
    * const appUsers = await prisma.appUser.findMany()
    * ```
    */
  get appUser(): Prisma.AppUserDelegate<ExtArgs>;

  /**
   * `prisma.cronJob`: Exposes CRUD operations for the **CronJob** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CronJobs
    * const cronJobs = await prisma.cronJob.findMany()
    * ```
    */
  get cronJob(): Prisma.CronJobDelegate<ExtArgs>;

  /**
   * `prisma.alignment`: Exposes CRUD operations for the **Alignment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Alignments
    * const alignments = await prisma.alignment.findMany()
    * ```
    */
  get alignment(): Prisma.AlignmentDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.14.0
   * Query Engine version: e9771e62de70f79a5e1c604a2d7c8e2a0a874b48
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | { toJSON(): unknown }

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Parametre: 'Parametre',
    AppRole: 'AppRole',
    AppUser: 'AppUser',
    CronJob: 'CronJob',
    Alignment: 'Alignment'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }


  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs}, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meta: {
      modelProps: 'parametre' | 'appRole' | 'appUser' | 'cronJob' | 'alignment'
      txIsolationLevel: Prisma.TransactionIsolationLevel
    },
    model: {
      Parametre: {
        payload: Prisma.$ParametrePayload<ExtArgs>
        fields: Prisma.ParametreFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ParametreFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ParametrePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ParametreFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ParametrePayload>
          }
          findFirst: {
            args: Prisma.ParametreFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ParametrePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ParametreFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ParametrePayload>
          }
          findMany: {
            args: Prisma.ParametreFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ParametrePayload>[]
          }
          create: {
            args: Prisma.ParametreCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ParametrePayload>
          }
          createMany: {
            args: Prisma.ParametreCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ParametreCreateManyAndReturnArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ParametrePayload>[]
          }
          delete: {
            args: Prisma.ParametreDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ParametrePayload>
          }
          update: {
            args: Prisma.ParametreUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ParametrePayload>
          }
          deleteMany: {
            args: Prisma.ParametreDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.ParametreUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.ParametreUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ParametrePayload>
          }
          aggregate: {
            args: Prisma.ParametreAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateParametre>
          }
          groupBy: {
            args: Prisma.ParametreGroupByArgs<ExtArgs>,
            result: $Utils.Optional<ParametreGroupByOutputType>[]
          }
          count: {
            args: Prisma.ParametreCountArgs<ExtArgs>,
            result: $Utils.Optional<ParametreCountAggregateOutputType> | number
          }
        }
      }
      AppRole: {
        payload: Prisma.$AppRolePayload<ExtArgs>
        fields: Prisma.AppRoleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppRoleFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppRolePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppRoleFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppRolePayload>
          }
          findFirst: {
            args: Prisma.AppRoleFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppRolePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppRoleFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppRolePayload>
          }
          findMany: {
            args: Prisma.AppRoleFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppRolePayload>[]
          }
          create: {
            args: Prisma.AppRoleCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppRolePayload>
          }
          createMany: {
            args: Prisma.AppRoleCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppRoleCreateManyAndReturnArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppRolePayload>[]
          }
          delete: {
            args: Prisma.AppRoleDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppRolePayload>
          }
          update: {
            args: Prisma.AppRoleUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppRolePayload>
          }
          deleteMany: {
            args: Prisma.AppRoleDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.AppRoleUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.AppRoleUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppRolePayload>
          }
          aggregate: {
            args: Prisma.AppRoleAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateAppRole>
          }
          groupBy: {
            args: Prisma.AppRoleGroupByArgs<ExtArgs>,
            result: $Utils.Optional<AppRoleGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppRoleCountArgs<ExtArgs>,
            result: $Utils.Optional<AppRoleCountAggregateOutputType> | number
          }
        }
      }
      AppUser: {
        payload: Prisma.$AppUserPayload<ExtArgs>
        fields: Prisma.AppUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppUserFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppUserFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          findFirst: {
            args: Prisma.AppUserFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppUserFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          findMany: {
            args: Prisma.AppUserFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>[]
          }
          create: {
            args: Prisma.AppUserCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          createMany: {
            args: Prisma.AppUserCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppUserCreateManyAndReturnArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>[]
          }
          delete: {
            args: Prisma.AppUserDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          update: {
            args: Prisma.AppUserUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          deleteMany: {
            args: Prisma.AppUserDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.AppUserUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.AppUserUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AppUserPayload>
          }
          aggregate: {
            args: Prisma.AppUserAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateAppUser>
          }
          groupBy: {
            args: Prisma.AppUserGroupByArgs<ExtArgs>,
            result: $Utils.Optional<AppUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppUserCountArgs<ExtArgs>,
            result: $Utils.Optional<AppUserCountAggregateOutputType> | number
          }
        }
      }
      CronJob: {
        payload: Prisma.$CronJobPayload<ExtArgs>
        fields: Prisma.CronJobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CronJobFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CronJobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CronJobFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CronJobPayload>
          }
          findFirst: {
            args: Prisma.CronJobFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CronJobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CronJobFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CronJobPayload>
          }
          findMany: {
            args: Prisma.CronJobFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CronJobPayload>[]
          }
          create: {
            args: Prisma.CronJobCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CronJobPayload>
          }
          createMany: {
            args: Prisma.CronJobCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CronJobCreateManyAndReturnArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CronJobPayload>[]
          }
          delete: {
            args: Prisma.CronJobDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CronJobPayload>
          }
          update: {
            args: Prisma.CronJobUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CronJobPayload>
          }
          deleteMany: {
            args: Prisma.CronJobDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.CronJobUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.CronJobUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$CronJobPayload>
          }
          aggregate: {
            args: Prisma.CronJobAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateCronJob>
          }
          groupBy: {
            args: Prisma.CronJobGroupByArgs<ExtArgs>,
            result: $Utils.Optional<CronJobGroupByOutputType>[]
          }
          count: {
            args: Prisma.CronJobCountArgs<ExtArgs>,
            result: $Utils.Optional<CronJobCountAggregateOutputType> | number
          }
        }
      }
      Alignment: {
        payload: Prisma.$AlignmentPayload<ExtArgs>
        fields: Prisma.AlignmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AlignmentFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AlignmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AlignmentFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AlignmentPayload>
          }
          findFirst: {
            args: Prisma.AlignmentFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AlignmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AlignmentFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AlignmentPayload>
          }
          findMany: {
            args: Prisma.AlignmentFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AlignmentPayload>[]
          }
          create: {
            args: Prisma.AlignmentCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AlignmentPayload>
          }
          createMany: {
            args: Prisma.AlignmentCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AlignmentCreateManyAndReturnArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AlignmentPayload>[]
          }
          delete: {
            args: Prisma.AlignmentDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AlignmentPayload>
          }
          update: {
            args: Prisma.AlignmentUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AlignmentPayload>
          }
          deleteMany: {
            args: Prisma.AlignmentDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.AlignmentUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.AlignmentUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AlignmentPayload>
          }
          aggregate: {
            args: Prisma.AlignmentAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateAlignment>
          }
          groupBy: {
            args: Prisma.AlignmentGroupByArgs<ExtArgs>,
            result: $Utils.Optional<AlignmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.AlignmentCountArgs<ExtArgs>,
            result: $Utils.Optional<AlignmentCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<'define', Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model Parametre
   */

  export type AggregateParametre = {
    _count: ParametreCountAggregateOutputType | null
    _avg: ParametreAvgAggregateOutputType | null
    _sum: ParametreSumAggregateOutputType | null
    _min: ParametreMinAggregateOutputType | null
    _max: ParametreMaxAggregateOutputType | null
  }

  export type ParametreAvgAggregateOutputType = {
    id: number | null
  }

  export type ParametreSumAggregateOutputType = {
    id: number | null
  }

  export type ParametreMinAggregateOutputType = {
    id: number | null
    cle: string | null
    valeur: string | null
  }

  export type ParametreMaxAggregateOutputType = {
    id: number | null
    cle: string | null
    valeur: string | null
  }

  export type ParametreCountAggregateOutputType = {
    id: number
    cle: number
    valeur: number
    _all: number
  }


  export type ParametreAvgAggregateInputType = {
    id?: true
  }

  export type ParametreSumAggregateInputType = {
    id?: true
  }

  export type ParametreMinAggregateInputType = {
    id?: true
    cle?: true
    valeur?: true
  }

  export type ParametreMaxAggregateInputType = {
    id?: true
    cle?: true
    valeur?: true
  }

  export type ParametreCountAggregateInputType = {
    id?: true
    cle?: true
    valeur?: true
    _all?: true
  }

  export type ParametreAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Parametre to aggregate.
     */
    where?: ParametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Parametres to fetch.
     */
    orderBy?: ParametreOrderByWithRelationInput | ParametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ParametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Parametres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Parametres
    **/
    _count?: true | ParametreCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ParametreAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ParametreSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ParametreMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ParametreMaxAggregateInputType
  }

  export type GetParametreAggregateType<T extends ParametreAggregateArgs> = {
        [P in keyof T & keyof AggregateParametre]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateParametre[P]>
      : GetScalarType<T[P], AggregateParametre[P]>
  }




  export type ParametreGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ParametreWhereInput
    orderBy?: ParametreOrderByWithAggregationInput | ParametreOrderByWithAggregationInput[]
    by: ParametreScalarFieldEnum[] | ParametreScalarFieldEnum
    having?: ParametreScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ParametreCountAggregateInputType | true
    _avg?: ParametreAvgAggregateInputType
    _sum?: ParametreSumAggregateInputType
    _min?: ParametreMinAggregateInputType
    _max?: ParametreMaxAggregateInputType
  }

  export type ParametreGroupByOutputType = {
    id: number
    cle: string
    valeur: string
    _count: ParametreCountAggregateOutputType | null
    _avg: ParametreAvgAggregateOutputType | null
    _sum: ParametreSumAggregateOutputType | null
    _min: ParametreMinAggregateOutputType | null
    _max: ParametreMaxAggregateOutputType | null
  }

  type GetParametreGroupByPayload<T extends ParametreGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ParametreGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ParametreGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ParametreGroupByOutputType[P]>
            : GetScalarType<T[P], ParametreGroupByOutputType[P]>
        }
      >
    >


  export type ParametreSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cle?: boolean
    valeur?: boolean
  }, ExtArgs["result"]["parametre"]>

  export type ParametreSelectScalar = {
    id?: boolean
    cle?: boolean
    valeur?: boolean
  }



  export type $ParametrePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Parametre"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      cle: string
      valeur: string
    }, ExtArgs["result"]["parametre"]>
    composites: {}
  }


  type ParametreGetPayload<S extends boolean | null | undefined | ParametreDefaultArgs> = $Result.GetResult<Prisma.$ParametrePayload, S>

  type ParametreCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ParametreFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ParametreCountAggregateInputType | true
    }

  export interface ParametreDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Parametre'], meta: { name: 'Parametre' } }
    /**
     * Find zero or one Parametre that matches the filter.
     * @param {ParametreFindUniqueArgs} args - Arguments to find a Parametre
     * @example
     * // Get one Parametre
     * const parametre = await prisma.parametre.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends ParametreFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, ParametreFindUniqueArgs<ExtArgs>>
    ): Prisma__ParametreClient<$Result.GetResult<Prisma.$ParametrePayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Parametre that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ParametreFindUniqueOrThrowArgs} args - Arguments to find a Parametre
     * @example
     * // Get one Parametre
     * const parametre = await prisma.parametre.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends ParametreFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, ParametreFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__ParametreClient<$Result.GetResult<Prisma.$ParametrePayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Parametre that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ParametreFindFirstArgs} args - Arguments to find a Parametre
     * @example
     * // Get one Parametre
     * const parametre = await prisma.parametre.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends ParametreFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, ParametreFindFirstArgs<ExtArgs>>
    ): Prisma__ParametreClient<$Result.GetResult<Prisma.$ParametrePayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Parametre that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ParametreFindFirstOrThrowArgs} args - Arguments to find a Parametre
     * @example
     * // Get one Parametre
     * const parametre = await prisma.parametre.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends ParametreFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, ParametreFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__ParametreClient<$Result.GetResult<Prisma.$ParametrePayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Parametres that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ParametreFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Parametres
     * const parametres = await prisma.parametre.findMany()
     * 
     * // Get first 10 Parametres
     * const parametres = await prisma.parametre.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const parametreWithIdOnly = await prisma.parametre.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends ParametreFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ParametreFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ParametrePayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Parametre.
     * @param {ParametreCreateArgs} args - Arguments to create a Parametre.
     * @example
     * // Create one Parametre
     * const Parametre = await prisma.parametre.create({
     *   data: {
     *     // ... data to create a Parametre
     *   }
     * })
     * 
    **/
    create<T extends ParametreCreateArgs<ExtArgs>>(
      args: SelectSubset<T, ParametreCreateArgs<ExtArgs>>
    ): Prisma__ParametreClient<$Result.GetResult<Prisma.$ParametrePayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many Parametres.
     * @param {ParametreCreateManyArgs} args - Arguments to create many Parametres.
     * @example
     * // Create many Parametres
     * const parametre = await prisma.parametre.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
    **/
    createMany<T extends ParametreCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ParametreCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Parametres and returns the data saved in the database.
     * @param {ParametreCreateManyAndReturnArgs} args - Arguments to create many Parametres.
     * @example
     * // Create many Parametres
     * const parametre = await prisma.parametre.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Parametres and only return the `id`
     * const parametreWithIdOnly = await prisma.parametre.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
    **/
    createManyAndReturn<T extends ParametreCreateManyAndReturnArgs<ExtArgs>>(
      args?: SelectSubset<T, ParametreCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ParametrePayload<ExtArgs>, T, 'createManyAndReturn'>>

    /**
     * Delete a Parametre.
     * @param {ParametreDeleteArgs} args - Arguments to delete one Parametre.
     * @example
     * // Delete one Parametre
     * const Parametre = await prisma.parametre.delete({
     *   where: {
     *     // ... filter to delete one Parametre
     *   }
     * })
     * 
    **/
    delete<T extends ParametreDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, ParametreDeleteArgs<ExtArgs>>
    ): Prisma__ParametreClient<$Result.GetResult<Prisma.$ParametrePayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Parametre.
     * @param {ParametreUpdateArgs} args - Arguments to update one Parametre.
     * @example
     * // Update one Parametre
     * const parametre = await prisma.parametre.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends ParametreUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, ParametreUpdateArgs<ExtArgs>>
    ): Prisma__ParametreClient<$Result.GetResult<Prisma.$ParametrePayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Parametres.
     * @param {ParametreDeleteManyArgs} args - Arguments to filter Parametres to delete.
     * @example
     * // Delete a few Parametres
     * const { count } = await prisma.parametre.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends ParametreDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ParametreDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Parametres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ParametreUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Parametres
     * const parametre = await prisma.parametre.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends ParametreUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, ParametreUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Parametre.
     * @param {ParametreUpsertArgs} args - Arguments to update or create a Parametre.
     * @example
     * // Update or create a Parametre
     * const parametre = await prisma.parametre.upsert({
     *   create: {
     *     // ... data to create a Parametre
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Parametre we want to update
     *   }
     * })
    **/
    upsert<T extends ParametreUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, ParametreUpsertArgs<ExtArgs>>
    ): Prisma__ParametreClient<$Result.GetResult<Prisma.$ParametrePayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Parametres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ParametreCountArgs} args - Arguments to filter Parametres to count.
     * @example
     * // Count the number of Parametres
     * const count = await prisma.parametre.count({
     *   where: {
     *     // ... the filter for the Parametres we want to count
     *   }
     * })
    **/
    count<T extends ParametreCountArgs>(
      args?: Subset<T, ParametreCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ParametreCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Parametre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ParametreAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ParametreAggregateArgs>(args: Subset<T, ParametreAggregateArgs>): Prisma.PrismaPromise<GetParametreAggregateType<T>>

    /**
     * Group by Parametre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ParametreGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ParametreGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ParametreGroupByArgs['orderBy'] }
        : { orderBy?: ParametreGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ParametreGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetParametreGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Parametre model
   */
  readonly fields: ParametreFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Parametre.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ParametreClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the Parametre model
   */ 
  interface ParametreFieldRefs {
    readonly id: FieldRef<"Parametre", 'Int'>
    readonly cle: FieldRef<"Parametre", 'String'>
    readonly valeur: FieldRef<"Parametre", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Parametre findUnique
   */
  export type ParametreFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
    /**
     * Filter, which Parametre to fetch.
     */
    where: ParametreWhereUniqueInput
  }

  /**
   * Parametre findUniqueOrThrow
   */
  export type ParametreFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
    /**
     * Filter, which Parametre to fetch.
     */
    where: ParametreWhereUniqueInput
  }

  /**
   * Parametre findFirst
   */
  export type ParametreFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
    /**
     * Filter, which Parametre to fetch.
     */
    where?: ParametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Parametres to fetch.
     */
    orderBy?: ParametreOrderByWithRelationInput | ParametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Parametres.
     */
    cursor?: ParametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Parametres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Parametres.
     */
    distinct?: ParametreScalarFieldEnum | ParametreScalarFieldEnum[]
  }

  /**
   * Parametre findFirstOrThrow
   */
  export type ParametreFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
    /**
     * Filter, which Parametre to fetch.
     */
    where?: ParametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Parametres to fetch.
     */
    orderBy?: ParametreOrderByWithRelationInput | ParametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Parametres.
     */
    cursor?: ParametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Parametres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Parametres.
     */
    distinct?: ParametreScalarFieldEnum | ParametreScalarFieldEnum[]
  }

  /**
   * Parametre findMany
   */
  export type ParametreFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
    /**
     * Filter, which Parametres to fetch.
     */
    where?: ParametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Parametres to fetch.
     */
    orderBy?: ParametreOrderByWithRelationInput | ParametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Parametres.
     */
    cursor?: ParametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Parametres.
     */
    skip?: number
    distinct?: ParametreScalarFieldEnum | ParametreScalarFieldEnum[]
  }

  /**
   * Parametre create
   */
  export type ParametreCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
    /**
     * The data needed to create a Parametre.
     */
    data: XOR<ParametreCreateInput, ParametreUncheckedCreateInput>
  }

  /**
   * Parametre createMany
   */
  export type ParametreCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Parametres.
     */
    data: ParametreCreateManyInput | ParametreCreateManyInput[]
  }

  /**
   * Parametre createManyAndReturn
   */
  export type ParametreCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
    /**
     * The data used to create many Parametres.
     */
    data: ParametreCreateManyInput | ParametreCreateManyInput[]
  }

  /**
   * Parametre update
   */
  export type ParametreUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
    /**
     * The data needed to update a Parametre.
     */
    data: XOR<ParametreUpdateInput, ParametreUncheckedUpdateInput>
    /**
     * Choose, which Parametre to update.
     */
    where: ParametreWhereUniqueInput
  }

  /**
   * Parametre updateMany
   */
  export type ParametreUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Parametres.
     */
    data: XOR<ParametreUpdateManyMutationInput, ParametreUncheckedUpdateManyInput>
    /**
     * Filter which Parametres to update
     */
    where?: ParametreWhereInput
  }

  /**
   * Parametre upsert
   */
  export type ParametreUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
    /**
     * The filter to search for the Parametre to update in case it exists.
     */
    where: ParametreWhereUniqueInput
    /**
     * In case the Parametre found by the `where` argument doesn't exist, create a new Parametre with this data.
     */
    create: XOR<ParametreCreateInput, ParametreUncheckedCreateInput>
    /**
     * In case the Parametre was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ParametreUpdateInput, ParametreUncheckedUpdateInput>
  }

  /**
   * Parametre delete
   */
  export type ParametreDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
    /**
     * Filter which Parametre to delete.
     */
    where: ParametreWhereUniqueInput
  }

  /**
   * Parametre deleteMany
   */
  export type ParametreDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Parametres to delete
     */
    where?: ParametreWhereInput
  }

  /**
   * Parametre without action
   */
  export type ParametreDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Parametre
     */
    select?: ParametreSelect<ExtArgs> | null
  }


  /**
   * Model AppRole
   */

  export type AggregateAppRole = {
    _count: AppRoleCountAggregateOutputType | null
    _avg: AppRoleAvgAggregateOutputType | null
    _sum: AppRoleSumAggregateOutputType | null
    _min: AppRoleMinAggregateOutputType | null
    _max: AppRoleMaxAggregateOutputType | null
  }

  export type AppRoleAvgAggregateOutputType = {
    id: number | null
  }

  export type AppRoleSumAggregateOutputType = {
    id: number | null
  }

  export type AppRoleMinAggregateOutputType = {
    id: number | null
    name: string | null
    permissions: string | null
    created_at: Date | null
  }

  export type AppRoleMaxAggregateOutputType = {
    id: number | null
    name: string | null
    permissions: string | null
    created_at: Date | null
  }

  export type AppRoleCountAggregateOutputType = {
    id: number
    name: number
    permissions: number
    created_at: number
    _all: number
  }


  export type AppRoleAvgAggregateInputType = {
    id?: true
  }

  export type AppRoleSumAggregateInputType = {
    id?: true
  }

  export type AppRoleMinAggregateInputType = {
    id?: true
    name?: true
    permissions?: true
    created_at?: true
  }

  export type AppRoleMaxAggregateInputType = {
    id?: true
    name?: true
    permissions?: true
    created_at?: true
  }

  export type AppRoleCountAggregateInputType = {
    id?: true
    name?: true
    permissions?: true
    created_at?: true
    _all?: true
  }

  export type AppRoleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppRole to aggregate.
     */
    where?: AppRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppRoles to fetch.
     */
    orderBy?: AppRoleOrderByWithRelationInput | AppRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppRoles
    **/
    _count?: true | AppRoleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AppRoleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AppRoleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppRoleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppRoleMaxAggregateInputType
  }

  export type GetAppRoleAggregateType<T extends AppRoleAggregateArgs> = {
        [P in keyof T & keyof AggregateAppRole]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppRole[P]>
      : GetScalarType<T[P], AggregateAppRole[P]>
  }




  export type AppRoleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppRoleWhereInput
    orderBy?: AppRoleOrderByWithAggregationInput | AppRoleOrderByWithAggregationInput[]
    by: AppRoleScalarFieldEnum[] | AppRoleScalarFieldEnum
    having?: AppRoleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppRoleCountAggregateInputType | true
    _avg?: AppRoleAvgAggregateInputType
    _sum?: AppRoleSumAggregateInputType
    _min?: AppRoleMinAggregateInputType
    _max?: AppRoleMaxAggregateInputType
  }

  export type AppRoleGroupByOutputType = {
    id: number
    name: string
    permissions: string
    created_at: Date
    _count: AppRoleCountAggregateOutputType | null
    _avg: AppRoleAvgAggregateOutputType | null
    _sum: AppRoleSumAggregateOutputType | null
    _min: AppRoleMinAggregateOutputType | null
    _max: AppRoleMaxAggregateOutputType | null
  }

  type GetAppRoleGroupByPayload<T extends AppRoleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppRoleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppRoleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppRoleGroupByOutputType[P]>
            : GetScalarType<T[P], AppRoleGroupByOutputType[P]>
        }
      >
    >


  export type AppRoleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    permissions?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["appRole"]>

  export type AppRoleSelectScalar = {
    id?: boolean
    name?: boolean
    permissions?: boolean
    created_at?: boolean
  }



  export type $AppRolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AppRole"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      permissions: string
      created_at: Date
    }, ExtArgs["result"]["appRole"]>
    composites: {}
  }


  type AppRoleGetPayload<S extends boolean | null | undefined | AppRoleDefaultArgs> = $Result.GetResult<Prisma.$AppRolePayload, S>

  type AppRoleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AppRoleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AppRoleCountAggregateInputType | true
    }

  export interface AppRoleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AppRole'], meta: { name: 'AppRole' } }
    /**
     * Find zero or one AppRole that matches the filter.
     * @param {AppRoleFindUniqueArgs} args - Arguments to find a AppRole
     * @example
     * // Get one AppRole
     * const appRole = await prisma.appRole.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AppRoleFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, AppRoleFindUniqueArgs<ExtArgs>>
    ): Prisma__AppRoleClient<$Result.GetResult<Prisma.$AppRolePayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one AppRole that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AppRoleFindUniqueOrThrowArgs} args - Arguments to find a AppRole
     * @example
     * // Get one AppRole
     * const appRole = await prisma.appRole.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AppRoleFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AppRoleFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__AppRoleClient<$Result.GetResult<Prisma.$AppRolePayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first AppRole that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppRoleFindFirstArgs} args - Arguments to find a AppRole
     * @example
     * // Get one AppRole
     * const appRole = await prisma.appRole.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AppRoleFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, AppRoleFindFirstArgs<ExtArgs>>
    ): Prisma__AppRoleClient<$Result.GetResult<Prisma.$AppRolePayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first AppRole that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppRoleFindFirstOrThrowArgs} args - Arguments to find a AppRole
     * @example
     * // Get one AppRole
     * const appRole = await prisma.appRole.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AppRoleFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AppRoleFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__AppRoleClient<$Result.GetResult<Prisma.$AppRolePayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more AppRoles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppRoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppRoles
     * const appRoles = await prisma.appRole.findMany()
     * 
     * // Get first 10 AppRoles
     * const appRoles = await prisma.appRole.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appRoleWithIdOnly = await prisma.appRole.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AppRoleFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AppRoleFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppRolePayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a AppRole.
     * @param {AppRoleCreateArgs} args - Arguments to create a AppRole.
     * @example
     * // Create one AppRole
     * const AppRole = await prisma.appRole.create({
     *   data: {
     *     // ... data to create a AppRole
     *   }
     * })
     * 
    **/
    create<T extends AppRoleCreateArgs<ExtArgs>>(
      args: SelectSubset<T, AppRoleCreateArgs<ExtArgs>>
    ): Prisma__AppRoleClient<$Result.GetResult<Prisma.$AppRolePayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many AppRoles.
     * @param {AppRoleCreateManyArgs} args - Arguments to create many AppRoles.
     * @example
     * // Create many AppRoles
     * const appRole = await prisma.appRole.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
    **/
    createMany<T extends AppRoleCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AppRoleCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AppRoles and returns the data saved in the database.
     * @param {AppRoleCreateManyAndReturnArgs} args - Arguments to create many AppRoles.
     * @example
     * // Create many AppRoles
     * const appRole = await prisma.appRole.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AppRoles and only return the `id`
     * const appRoleWithIdOnly = await prisma.appRole.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
    **/
    createManyAndReturn<T extends AppRoleCreateManyAndReturnArgs<ExtArgs>>(
      args?: SelectSubset<T, AppRoleCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppRolePayload<ExtArgs>, T, 'createManyAndReturn'>>

    /**
     * Delete a AppRole.
     * @param {AppRoleDeleteArgs} args - Arguments to delete one AppRole.
     * @example
     * // Delete one AppRole
     * const AppRole = await prisma.appRole.delete({
     *   where: {
     *     // ... filter to delete one AppRole
     *   }
     * })
     * 
    **/
    delete<T extends AppRoleDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, AppRoleDeleteArgs<ExtArgs>>
    ): Prisma__AppRoleClient<$Result.GetResult<Prisma.$AppRolePayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one AppRole.
     * @param {AppRoleUpdateArgs} args - Arguments to update one AppRole.
     * @example
     * // Update one AppRole
     * const appRole = await prisma.appRole.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AppRoleUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, AppRoleUpdateArgs<ExtArgs>>
    ): Prisma__AppRoleClient<$Result.GetResult<Prisma.$AppRolePayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more AppRoles.
     * @param {AppRoleDeleteManyArgs} args - Arguments to filter AppRoles to delete.
     * @example
     * // Delete a few AppRoles
     * const { count } = await prisma.appRole.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AppRoleDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AppRoleDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppRoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppRoles
     * const appRole = await prisma.appRole.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AppRoleUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, AppRoleUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AppRole.
     * @param {AppRoleUpsertArgs} args - Arguments to update or create a AppRole.
     * @example
     * // Update or create a AppRole
     * const appRole = await prisma.appRole.upsert({
     *   create: {
     *     // ... data to create a AppRole
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppRole we want to update
     *   }
     * })
    **/
    upsert<T extends AppRoleUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, AppRoleUpsertArgs<ExtArgs>>
    ): Prisma__AppRoleClient<$Result.GetResult<Prisma.$AppRolePayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of AppRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppRoleCountArgs} args - Arguments to filter AppRoles to count.
     * @example
     * // Count the number of AppRoles
     * const count = await prisma.appRole.count({
     *   where: {
     *     // ... the filter for the AppRoles we want to count
     *   }
     * })
    **/
    count<T extends AppRoleCountArgs>(
      args?: Subset<T, AppRoleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppRoleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppRoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppRoleAggregateArgs>(args: Subset<T, AppRoleAggregateArgs>): Prisma.PrismaPromise<GetAppRoleAggregateType<T>>

    /**
     * Group by AppRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppRoleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppRoleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppRoleGroupByArgs['orderBy'] }
        : { orderBy?: AppRoleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppRoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AppRole model
   */
  readonly fields: AppRoleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AppRole.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppRoleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the AppRole model
   */ 
  interface AppRoleFieldRefs {
    readonly id: FieldRef<"AppRole", 'Int'>
    readonly name: FieldRef<"AppRole", 'String'>
    readonly permissions: FieldRef<"AppRole", 'String'>
    readonly created_at: FieldRef<"AppRole", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AppRole findUnique
   */
  export type AppRoleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
    /**
     * Filter, which AppRole to fetch.
     */
    where: AppRoleWhereUniqueInput
  }

  /**
   * AppRole findUniqueOrThrow
   */
  export type AppRoleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
    /**
     * Filter, which AppRole to fetch.
     */
    where: AppRoleWhereUniqueInput
  }

  /**
   * AppRole findFirst
   */
  export type AppRoleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
    /**
     * Filter, which AppRole to fetch.
     */
    where?: AppRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppRoles to fetch.
     */
    orderBy?: AppRoleOrderByWithRelationInput | AppRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppRoles.
     */
    cursor?: AppRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppRoles.
     */
    distinct?: AppRoleScalarFieldEnum | AppRoleScalarFieldEnum[]
  }

  /**
   * AppRole findFirstOrThrow
   */
  export type AppRoleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
    /**
     * Filter, which AppRole to fetch.
     */
    where?: AppRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppRoles to fetch.
     */
    orderBy?: AppRoleOrderByWithRelationInput | AppRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppRoles.
     */
    cursor?: AppRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppRoles.
     */
    distinct?: AppRoleScalarFieldEnum | AppRoleScalarFieldEnum[]
  }

  /**
   * AppRole findMany
   */
  export type AppRoleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
    /**
     * Filter, which AppRoles to fetch.
     */
    where?: AppRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppRoles to fetch.
     */
    orderBy?: AppRoleOrderByWithRelationInput | AppRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppRoles.
     */
    cursor?: AppRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppRoles.
     */
    skip?: number
    distinct?: AppRoleScalarFieldEnum | AppRoleScalarFieldEnum[]
  }

  /**
   * AppRole create
   */
  export type AppRoleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
    /**
     * The data needed to create a AppRole.
     */
    data: XOR<AppRoleCreateInput, AppRoleUncheckedCreateInput>
  }

  /**
   * AppRole createMany
   */
  export type AppRoleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AppRoles.
     */
    data: AppRoleCreateManyInput | AppRoleCreateManyInput[]
  }

  /**
   * AppRole createManyAndReturn
   */
  export type AppRoleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
    /**
     * The data used to create many AppRoles.
     */
    data: AppRoleCreateManyInput | AppRoleCreateManyInput[]
  }

  /**
   * AppRole update
   */
  export type AppRoleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
    /**
     * The data needed to update a AppRole.
     */
    data: XOR<AppRoleUpdateInput, AppRoleUncheckedUpdateInput>
    /**
     * Choose, which AppRole to update.
     */
    where: AppRoleWhereUniqueInput
  }

  /**
   * AppRole updateMany
   */
  export type AppRoleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AppRoles.
     */
    data: XOR<AppRoleUpdateManyMutationInput, AppRoleUncheckedUpdateManyInput>
    /**
     * Filter which AppRoles to update
     */
    where?: AppRoleWhereInput
  }

  /**
   * AppRole upsert
   */
  export type AppRoleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
    /**
     * The filter to search for the AppRole to update in case it exists.
     */
    where: AppRoleWhereUniqueInput
    /**
     * In case the AppRole found by the `where` argument doesn't exist, create a new AppRole with this data.
     */
    create: XOR<AppRoleCreateInput, AppRoleUncheckedCreateInput>
    /**
     * In case the AppRole was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppRoleUpdateInput, AppRoleUncheckedUpdateInput>
  }

  /**
   * AppRole delete
   */
  export type AppRoleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
    /**
     * Filter which AppRole to delete.
     */
    where: AppRoleWhereUniqueInput
  }

  /**
   * AppRole deleteMany
   */
  export type AppRoleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppRoles to delete
     */
    where?: AppRoleWhereInput
  }

  /**
   * AppRole without action
   */
  export type AppRoleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppRole
     */
    select?: AppRoleSelect<ExtArgs> | null
  }


  /**
   * Model AppUser
   */

  export type AggregateAppUser = {
    _count: AppUserCountAggregateOutputType | null
    _avg: AppUserAvgAggregateOutputType | null
    _sum: AppUserSumAggregateOutputType | null
    _min: AppUserMinAggregateOutputType | null
    _max: AppUserMaxAggregateOutputType | null
  }

  export type AppUserAvgAggregateOutputType = {
    id: number | null
  }

  export type AppUserSumAggregateOutputType = {
    id: number | null
  }

  export type AppUserMinAggregateOutputType = {
    id: number | null
    login: string | null
    password: string | null
    nom: string | null
    prenom: string | null
    role: string | null
    is_ad: boolean | null
    actif: boolean | null
    created_at: Date | null
  }

  export type AppUserMaxAggregateOutputType = {
    id: number | null
    login: string | null
    password: string | null
    nom: string | null
    prenom: string | null
    role: string | null
    is_ad: boolean | null
    actif: boolean | null
    created_at: Date | null
  }

  export type AppUserCountAggregateOutputType = {
    id: number
    login: number
    password: number
    nom: number
    prenom: number
    role: number
    is_ad: number
    actif: number
    created_at: number
    _all: number
  }


  export type AppUserAvgAggregateInputType = {
    id?: true
  }

  export type AppUserSumAggregateInputType = {
    id?: true
  }

  export type AppUserMinAggregateInputType = {
    id?: true
    login?: true
    password?: true
    nom?: true
    prenom?: true
    role?: true
    is_ad?: true
    actif?: true
    created_at?: true
  }

  export type AppUserMaxAggregateInputType = {
    id?: true
    login?: true
    password?: true
    nom?: true
    prenom?: true
    role?: true
    is_ad?: true
    actif?: true
    created_at?: true
  }

  export type AppUserCountAggregateInputType = {
    id?: true
    login?: true
    password?: true
    nom?: true
    prenom?: true
    role?: true
    is_ad?: true
    actif?: true
    created_at?: true
    _all?: true
  }

  export type AppUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppUser to aggregate.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppUsers
    **/
    _count?: true | AppUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AppUserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AppUserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppUserMaxAggregateInputType
  }

  export type GetAppUserAggregateType<T extends AppUserAggregateArgs> = {
        [P in keyof T & keyof AggregateAppUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppUser[P]>
      : GetScalarType<T[P], AggregateAppUser[P]>
  }




  export type AppUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppUserWhereInput
    orderBy?: AppUserOrderByWithAggregationInput | AppUserOrderByWithAggregationInput[]
    by: AppUserScalarFieldEnum[] | AppUserScalarFieldEnum
    having?: AppUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppUserCountAggregateInputType | true
    _avg?: AppUserAvgAggregateInputType
    _sum?: AppUserSumAggregateInputType
    _min?: AppUserMinAggregateInputType
    _max?: AppUserMaxAggregateInputType
  }

  export type AppUserGroupByOutputType = {
    id: number
    login: string
    password: string
    nom: string
    prenom: string
    role: string
    is_ad: boolean
    actif: boolean
    created_at: Date
    _count: AppUserCountAggregateOutputType | null
    _avg: AppUserAvgAggregateOutputType | null
    _sum: AppUserSumAggregateOutputType | null
    _min: AppUserMinAggregateOutputType | null
    _max: AppUserMaxAggregateOutputType | null
  }

  type GetAppUserGroupByPayload<T extends AppUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppUserGroupByOutputType[P]>
            : GetScalarType<T[P], AppUserGroupByOutputType[P]>
        }
      >
    >


  export type AppUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    login?: boolean
    password?: boolean
    nom?: boolean
    prenom?: boolean
    role?: boolean
    is_ad?: boolean
    actif?: boolean
    created_at?: boolean
  }, ExtArgs["result"]["appUser"]>

  export type AppUserSelectScalar = {
    id?: boolean
    login?: boolean
    password?: boolean
    nom?: boolean
    prenom?: boolean
    role?: boolean
    is_ad?: boolean
    actif?: boolean
    created_at?: boolean
  }



  export type $AppUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AppUser"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      login: string
      password: string
      nom: string
      prenom: string
      role: string
      is_ad: boolean
      actif: boolean
      created_at: Date
    }, ExtArgs["result"]["appUser"]>
    composites: {}
  }


  type AppUserGetPayload<S extends boolean | null | undefined | AppUserDefaultArgs> = $Result.GetResult<Prisma.$AppUserPayload, S>

  type AppUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AppUserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AppUserCountAggregateInputType | true
    }

  export interface AppUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AppUser'], meta: { name: 'AppUser' } }
    /**
     * Find zero or one AppUser that matches the filter.
     * @param {AppUserFindUniqueArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AppUserFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, AppUserFindUniqueArgs<ExtArgs>>
    ): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one AppUser that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AppUserFindUniqueOrThrowArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AppUserFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AppUserFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first AppUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserFindFirstArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AppUserFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, AppUserFindFirstArgs<ExtArgs>>
    ): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first AppUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserFindFirstOrThrowArgs} args - Arguments to find a AppUser
     * @example
     * // Get one AppUser
     * const appUser = await prisma.appUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AppUserFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AppUserFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more AppUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppUsers
     * const appUsers = await prisma.appUser.findMany()
     * 
     * // Get first 10 AppUsers
     * const appUsers = await prisma.appUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appUserWithIdOnly = await prisma.appUser.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AppUserFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AppUserFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a AppUser.
     * @param {AppUserCreateArgs} args - Arguments to create a AppUser.
     * @example
     * // Create one AppUser
     * const AppUser = await prisma.appUser.create({
     *   data: {
     *     // ... data to create a AppUser
     *   }
     * })
     * 
    **/
    create<T extends AppUserCreateArgs<ExtArgs>>(
      args: SelectSubset<T, AppUserCreateArgs<ExtArgs>>
    ): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many AppUsers.
     * @param {AppUserCreateManyArgs} args - Arguments to create many AppUsers.
     * @example
     * // Create many AppUsers
     * const appUser = await prisma.appUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
    **/
    createMany<T extends AppUserCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AppUserCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AppUsers and returns the data saved in the database.
     * @param {AppUserCreateManyAndReturnArgs} args - Arguments to create many AppUsers.
     * @example
     * // Create many AppUsers
     * const appUser = await prisma.appUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AppUsers and only return the `id`
     * const appUserWithIdOnly = await prisma.appUser.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
    **/
    createManyAndReturn<T extends AppUserCreateManyAndReturnArgs<ExtArgs>>(
      args?: SelectSubset<T, AppUserCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, 'createManyAndReturn'>>

    /**
     * Delete a AppUser.
     * @param {AppUserDeleteArgs} args - Arguments to delete one AppUser.
     * @example
     * // Delete one AppUser
     * const AppUser = await prisma.appUser.delete({
     *   where: {
     *     // ... filter to delete one AppUser
     *   }
     * })
     * 
    **/
    delete<T extends AppUserDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, AppUserDeleteArgs<ExtArgs>>
    ): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one AppUser.
     * @param {AppUserUpdateArgs} args - Arguments to update one AppUser.
     * @example
     * // Update one AppUser
     * const appUser = await prisma.appUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AppUserUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, AppUserUpdateArgs<ExtArgs>>
    ): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more AppUsers.
     * @param {AppUserDeleteManyArgs} args - Arguments to filter AppUsers to delete.
     * @example
     * // Delete a few AppUsers
     * const { count } = await prisma.appUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AppUserDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AppUserDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppUsers
     * const appUser = await prisma.appUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AppUserUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, AppUserUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AppUser.
     * @param {AppUserUpsertArgs} args - Arguments to update or create a AppUser.
     * @example
     * // Update or create a AppUser
     * const appUser = await prisma.appUser.upsert({
     *   create: {
     *     // ... data to create a AppUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppUser we want to update
     *   }
     * })
    **/
    upsert<T extends AppUserUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, AppUserUpsertArgs<ExtArgs>>
    ): Prisma__AppUserClient<$Result.GetResult<Prisma.$AppUserPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of AppUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserCountArgs} args - Arguments to filter AppUsers to count.
     * @example
     * // Count the number of AppUsers
     * const count = await prisma.appUser.count({
     *   where: {
     *     // ... the filter for the AppUsers we want to count
     *   }
     * })
    **/
    count<T extends AppUserCountArgs>(
      args?: Subset<T, AppUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppUserAggregateArgs>(args: Subset<T, AppUserAggregateArgs>): Prisma.PrismaPromise<GetAppUserAggregateType<T>>

    /**
     * Group by AppUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppUserGroupByArgs['orderBy'] }
        : { orderBy?: AppUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AppUser model
   */
  readonly fields: AppUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AppUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the AppUser model
   */ 
  interface AppUserFieldRefs {
    readonly id: FieldRef<"AppUser", 'Int'>
    readonly login: FieldRef<"AppUser", 'String'>
    readonly password: FieldRef<"AppUser", 'String'>
    readonly nom: FieldRef<"AppUser", 'String'>
    readonly prenom: FieldRef<"AppUser", 'String'>
    readonly role: FieldRef<"AppUser", 'String'>
    readonly is_ad: FieldRef<"AppUser", 'Boolean'>
    readonly actif: FieldRef<"AppUser", 'Boolean'>
    readonly created_at: FieldRef<"AppUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AppUser findUnique
   */
  export type AppUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser findUniqueOrThrow
   */
  export type AppUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser findFirst
   */
  export type AppUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppUsers.
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppUsers.
     */
    distinct?: AppUserScalarFieldEnum | AppUserScalarFieldEnum[]
  }

  /**
   * AppUser findFirstOrThrow
   */
  export type AppUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter, which AppUser to fetch.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppUsers.
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppUsers.
     */
    distinct?: AppUserScalarFieldEnum | AppUserScalarFieldEnum[]
  }

  /**
   * AppUser findMany
   */
  export type AppUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter, which AppUsers to fetch.
     */
    where?: AppUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppUsers to fetch.
     */
    orderBy?: AppUserOrderByWithRelationInput | AppUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppUsers.
     */
    cursor?: AppUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppUsers.
     */
    skip?: number
    distinct?: AppUserScalarFieldEnum | AppUserScalarFieldEnum[]
  }

  /**
   * AppUser create
   */
  export type AppUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * The data needed to create a AppUser.
     */
    data: XOR<AppUserCreateInput, AppUserUncheckedCreateInput>
  }

  /**
   * AppUser createMany
   */
  export type AppUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AppUsers.
     */
    data: AppUserCreateManyInput | AppUserCreateManyInput[]
  }

  /**
   * AppUser createManyAndReturn
   */
  export type AppUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * The data used to create many AppUsers.
     */
    data: AppUserCreateManyInput | AppUserCreateManyInput[]
  }

  /**
   * AppUser update
   */
  export type AppUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * The data needed to update a AppUser.
     */
    data: XOR<AppUserUpdateInput, AppUserUncheckedUpdateInput>
    /**
     * Choose, which AppUser to update.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser updateMany
   */
  export type AppUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AppUsers.
     */
    data: XOR<AppUserUpdateManyMutationInput, AppUserUncheckedUpdateManyInput>
    /**
     * Filter which AppUsers to update
     */
    where?: AppUserWhereInput
  }

  /**
   * AppUser upsert
   */
  export type AppUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * The filter to search for the AppUser to update in case it exists.
     */
    where: AppUserWhereUniqueInput
    /**
     * In case the AppUser found by the `where` argument doesn't exist, create a new AppUser with this data.
     */
    create: XOR<AppUserCreateInput, AppUserUncheckedCreateInput>
    /**
     * In case the AppUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppUserUpdateInput, AppUserUncheckedUpdateInput>
  }

  /**
   * AppUser delete
   */
  export type AppUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
    /**
     * Filter which AppUser to delete.
     */
    where: AppUserWhereUniqueInput
  }

  /**
   * AppUser deleteMany
   */
  export type AppUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppUsers to delete
     */
    where?: AppUserWhereInput
  }

  /**
   * AppUser without action
   */
  export type AppUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppUser
     */
    select?: AppUserSelect<ExtArgs> | null
  }


  /**
   * Model CronJob
   */

  export type AggregateCronJob = {
    _count: CronJobCountAggregateOutputType | null
    _avg: CronJobAvgAggregateOutputType | null
    _sum: CronJobSumAggregateOutputType | null
    _min: CronJobMinAggregateOutputType | null
    _max: CronJobMaxAggregateOutputType | null
  }

  export type CronJobAvgAggregateOutputType = {
    id: number | null
  }

  export type CronJobSumAggregateOutputType = {
    id: number | null
  }

  export type CronJobMinAggregateOutputType = {
    id: number | null
    name: string | null
    type: string | null
    schedule: string | null
    schedule_type: string | null
    is_active: boolean | null
    last_run: Date | null
    next_run: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CronJobMaxAggregateOutputType = {
    id: number | null
    name: string | null
    type: string | null
    schedule: string | null
    schedule_type: string | null
    is_active: boolean | null
    last_run: Date | null
    next_run: Date | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CronJobCountAggregateOutputType = {
    id: number
    name: number
    type: number
    schedule: number
    schedule_type: number
    is_active: number
    last_run: number
    next_run: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type CronJobAvgAggregateInputType = {
    id?: true
  }

  export type CronJobSumAggregateInputType = {
    id?: true
  }

  export type CronJobMinAggregateInputType = {
    id?: true
    name?: true
    type?: true
    schedule?: true
    schedule_type?: true
    is_active?: true
    last_run?: true
    next_run?: true
    created_at?: true
    updated_at?: true
  }

  export type CronJobMaxAggregateInputType = {
    id?: true
    name?: true
    type?: true
    schedule?: true
    schedule_type?: true
    is_active?: true
    last_run?: true
    next_run?: true
    created_at?: true
    updated_at?: true
  }

  export type CronJobCountAggregateInputType = {
    id?: true
    name?: true
    type?: true
    schedule?: true
    schedule_type?: true
    is_active?: true
    last_run?: true
    next_run?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type CronJobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CronJob to aggregate.
     */
    where?: CronJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CronJobs to fetch.
     */
    orderBy?: CronJobOrderByWithRelationInput | CronJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CronJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CronJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CronJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CronJobs
    **/
    _count?: true | CronJobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CronJobAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CronJobSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CronJobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CronJobMaxAggregateInputType
  }

  export type GetCronJobAggregateType<T extends CronJobAggregateArgs> = {
        [P in keyof T & keyof AggregateCronJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCronJob[P]>
      : GetScalarType<T[P], AggregateCronJob[P]>
  }




  export type CronJobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CronJobWhereInput
    orderBy?: CronJobOrderByWithAggregationInput | CronJobOrderByWithAggregationInput[]
    by: CronJobScalarFieldEnum[] | CronJobScalarFieldEnum
    having?: CronJobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CronJobCountAggregateInputType | true
    _avg?: CronJobAvgAggregateInputType
    _sum?: CronJobSumAggregateInputType
    _min?: CronJobMinAggregateInputType
    _max?: CronJobMaxAggregateInputType
  }

  export type CronJobGroupByOutputType = {
    id: number
    name: string
    type: string
    schedule: string
    schedule_type: string
    is_active: boolean
    last_run: Date | null
    next_run: Date | null
    created_at: Date
    updated_at: Date
    _count: CronJobCountAggregateOutputType | null
    _avg: CronJobAvgAggregateOutputType | null
    _sum: CronJobSumAggregateOutputType | null
    _min: CronJobMinAggregateOutputType | null
    _max: CronJobMaxAggregateOutputType | null
  }

  type GetCronJobGroupByPayload<T extends CronJobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CronJobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CronJobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CronJobGroupByOutputType[P]>
            : GetScalarType<T[P], CronJobGroupByOutputType[P]>
        }
      >
    >


  export type CronJobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    schedule?: boolean
    schedule_type?: boolean
    is_active?: boolean
    last_run?: boolean
    next_run?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["cronJob"]>

  export type CronJobSelectScalar = {
    id?: boolean
    name?: boolean
    type?: boolean
    schedule?: boolean
    schedule_type?: boolean
    is_active?: boolean
    last_run?: boolean
    next_run?: boolean
    created_at?: boolean
    updated_at?: boolean
  }



  export type $CronJobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CronJob"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      type: string
      schedule: string
      schedule_type: string
      is_active: boolean
      last_run: Date | null
      next_run: Date | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["cronJob"]>
    composites: {}
  }


  type CronJobGetPayload<S extends boolean | null | undefined | CronJobDefaultArgs> = $Result.GetResult<Prisma.$CronJobPayload, S>

  type CronJobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CronJobFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CronJobCountAggregateInputType | true
    }

  export interface CronJobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CronJob'], meta: { name: 'CronJob' } }
    /**
     * Find zero or one CronJob that matches the filter.
     * @param {CronJobFindUniqueArgs} args - Arguments to find a CronJob
     * @example
     * // Get one CronJob
     * const cronJob = await prisma.cronJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends CronJobFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, CronJobFindUniqueArgs<ExtArgs>>
    ): Prisma__CronJobClient<$Result.GetResult<Prisma.$CronJobPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one CronJob that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CronJobFindUniqueOrThrowArgs} args - Arguments to find a CronJob
     * @example
     * // Get one CronJob
     * const cronJob = await prisma.cronJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends CronJobFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CronJobFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__CronJobClient<$Result.GetResult<Prisma.$CronJobPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first CronJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CronJobFindFirstArgs} args - Arguments to find a CronJob
     * @example
     * // Get one CronJob
     * const cronJob = await prisma.cronJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends CronJobFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, CronJobFindFirstArgs<ExtArgs>>
    ): Prisma__CronJobClient<$Result.GetResult<Prisma.$CronJobPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first CronJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CronJobFindFirstOrThrowArgs} args - Arguments to find a CronJob
     * @example
     * // Get one CronJob
     * const cronJob = await prisma.cronJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends CronJobFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, CronJobFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__CronJobClient<$Result.GetResult<Prisma.$CronJobPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more CronJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CronJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CronJobs
     * const cronJobs = await prisma.cronJob.findMany()
     * 
     * // Get first 10 CronJobs
     * const cronJobs = await prisma.cronJob.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cronJobWithIdOnly = await prisma.cronJob.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends CronJobFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CronJobFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CronJobPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a CronJob.
     * @param {CronJobCreateArgs} args - Arguments to create a CronJob.
     * @example
     * // Create one CronJob
     * const CronJob = await prisma.cronJob.create({
     *   data: {
     *     // ... data to create a CronJob
     *   }
     * })
     * 
    **/
    create<T extends CronJobCreateArgs<ExtArgs>>(
      args: SelectSubset<T, CronJobCreateArgs<ExtArgs>>
    ): Prisma__CronJobClient<$Result.GetResult<Prisma.$CronJobPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many CronJobs.
     * @param {CronJobCreateManyArgs} args - Arguments to create many CronJobs.
     * @example
     * // Create many CronJobs
     * const cronJob = await prisma.cronJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
    **/
    createMany<T extends CronJobCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CronJobCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CronJobs and returns the data saved in the database.
     * @param {CronJobCreateManyAndReturnArgs} args - Arguments to create many CronJobs.
     * @example
     * // Create many CronJobs
     * const cronJob = await prisma.cronJob.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CronJobs and only return the `id`
     * const cronJobWithIdOnly = await prisma.cronJob.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
    **/
    createManyAndReturn<T extends CronJobCreateManyAndReturnArgs<ExtArgs>>(
      args?: SelectSubset<T, CronJobCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CronJobPayload<ExtArgs>, T, 'createManyAndReturn'>>

    /**
     * Delete a CronJob.
     * @param {CronJobDeleteArgs} args - Arguments to delete one CronJob.
     * @example
     * // Delete one CronJob
     * const CronJob = await prisma.cronJob.delete({
     *   where: {
     *     // ... filter to delete one CronJob
     *   }
     * })
     * 
    **/
    delete<T extends CronJobDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, CronJobDeleteArgs<ExtArgs>>
    ): Prisma__CronJobClient<$Result.GetResult<Prisma.$CronJobPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one CronJob.
     * @param {CronJobUpdateArgs} args - Arguments to update one CronJob.
     * @example
     * // Update one CronJob
     * const cronJob = await prisma.cronJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends CronJobUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, CronJobUpdateArgs<ExtArgs>>
    ): Prisma__CronJobClient<$Result.GetResult<Prisma.$CronJobPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more CronJobs.
     * @param {CronJobDeleteManyArgs} args - Arguments to filter CronJobs to delete.
     * @example
     * // Delete a few CronJobs
     * const { count } = await prisma.cronJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends CronJobDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, CronJobDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CronJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CronJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CronJobs
     * const cronJob = await prisma.cronJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends CronJobUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, CronJobUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CronJob.
     * @param {CronJobUpsertArgs} args - Arguments to update or create a CronJob.
     * @example
     * // Update or create a CronJob
     * const cronJob = await prisma.cronJob.upsert({
     *   create: {
     *     // ... data to create a CronJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CronJob we want to update
     *   }
     * })
    **/
    upsert<T extends CronJobUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, CronJobUpsertArgs<ExtArgs>>
    ): Prisma__CronJobClient<$Result.GetResult<Prisma.$CronJobPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of CronJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CronJobCountArgs} args - Arguments to filter CronJobs to count.
     * @example
     * // Count the number of CronJobs
     * const count = await prisma.cronJob.count({
     *   where: {
     *     // ... the filter for the CronJobs we want to count
     *   }
     * })
    **/
    count<T extends CronJobCountArgs>(
      args?: Subset<T, CronJobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CronJobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CronJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CronJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CronJobAggregateArgs>(args: Subset<T, CronJobAggregateArgs>): Prisma.PrismaPromise<GetCronJobAggregateType<T>>

    /**
     * Group by CronJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CronJobGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CronJobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CronJobGroupByArgs['orderBy'] }
        : { orderBy?: CronJobGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CronJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCronJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CronJob model
   */
  readonly fields: CronJobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CronJob.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CronJobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the CronJob model
   */ 
  interface CronJobFieldRefs {
    readonly id: FieldRef<"CronJob", 'Int'>
    readonly name: FieldRef<"CronJob", 'String'>
    readonly type: FieldRef<"CronJob", 'String'>
    readonly schedule: FieldRef<"CronJob", 'String'>
    readonly schedule_type: FieldRef<"CronJob", 'String'>
    readonly is_active: FieldRef<"CronJob", 'Boolean'>
    readonly last_run: FieldRef<"CronJob", 'DateTime'>
    readonly next_run: FieldRef<"CronJob", 'DateTime'>
    readonly created_at: FieldRef<"CronJob", 'DateTime'>
    readonly updated_at: FieldRef<"CronJob", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CronJob findUnique
   */
  export type CronJobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
    /**
     * Filter, which CronJob to fetch.
     */
    where: CronJobWhereUniqueInput
  }

  /**
   * CronJob findUniqueOrThrow
   */
  export type CronJobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
    /**
     * Filter, which CronJob to fetch.
     */
    where: CronJobWhereUniqueInput
  }

  /**
   * CronJob findFirst
   */
  export type CronJobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
    /**
     * Filter, which CronJob to fetch.
     */
    where?: CronJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CronJobs to fetch.
     */
    orderBy?: CronJobOrderByWithRelationInput | CronJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CronJobs.
     */
    cursor?: CronJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CronJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CronJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CronJobs.
     */
    distinct?: CronJobScalarFieldEnum | CronJobScalarFieldEnum[]
  }

  /**
   * CronJob findFirstOrThrow
   */
  export type CronJobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
    /**
     * Filter, which CronJob to fetch.
     */
    where?: CronJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CronJobs to fetch.
     */
    orderBy?: CronJobOrderByWithRelationInput | CronJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CronJobs.
     */
    cursor?: CronJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CronJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CronJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CronJobs.
     */
    distinct?: CronJobScalarFieldEnum | CronJobScalarFieldEnum[]
  }

  /**
   * CronJob findMany
   */
  export type CronJobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
    /**
     * Filter, which CronJobs to fetch.
     */
    where?: CronJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CronJobs to fetch.
     */
    orderBy?: CronJobOrderByWithRelationInput | CronJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CronJobs.
     */
    cursor?: CronJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CronJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CronJobs.
     */
    skip?: number
    distinct?: CronJobScalarFieldEnum | CronJobScalarFieldEnum[]
  }

  /**
   * CronJob create
   */
  export type CronJobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
    /**
     * The data needed to create a CronJob.
     */
    data: XOR<CronJobCreateInput, CronJobUncheckedCreateInput>
  }

  /**
   * CronJob createMany
   */
  export type CronJobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CronJobs.
     */
    data: CronJobCreateManyInput | CronJobCreateManyInput[]
  }

  /**
   * CronJob createManyAndReturn
   */
  export type CronJobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
    /**
     * The data used to create many CronJobs.
     */
    data: CronJobCreateManyInput | CronJobCreateManyInput[]
  }

  /**
   * CronJob update
   */
  export type CronJobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
    /**
     * The data needed to update a CronJob.
     */
    data: XOR<CronJobUpdateInput, CronJobUncheckedUpdateInput>
    /**
     * Choose, which CronJob to update.
     */
    where: CronJobWhereUniqueInput
  }

  /**
   * CronJob updateMany
   */
  export type CronJobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CronJobs.
     */
    data: XOR<CronJobUpdateManyMutationInput, CronJobUncheckedUpdateManyInput>
    /**
     * Filter which CronJobs to update
     */
    where?: CronJobWhereInput
  }

  /**
   * CronJob upsert
   */
  export type CronJobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
    /**
     * The filter to search for the CronJob to update in case it exists.
     */
    where: CronJobWhereUniqueInput
    /**
     * In case the CronJob found by the `where` argument doesn't exist, create a new CronJob with this data.
     */
    create: XOR<CronJobCreateInput, CronJobUncheckedCreateInput>
    /**
     * In case the CronJob was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CronJobUpdateInput, CronJobUncheckedUpdateInput>
  }

  /**
   * CronJob delete
   */
  export type CronJobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
    /**
     * Filter which CronJob to delete.
     */
    where: CronJobWhereUniqueInput
  }

  /**
   * CronJob deleteMany
   */
  export type CronJobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CronJobs to delete
     */
    where?: CronJobWhereInput
  }

  /**
   * CronJob without action
   */
  export type CronJobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CronJob
     */
    select?: CronJobSelect<ExtArgs> | null
  }


  /**
   * Model Alignment
   */

  export type AggregateAlignment = {
    _count: AlignmentCountAggregateOutputType | null
    _avg: AlignmentAvgAggregateOutputType | null
    _sum: AlignmentSumAggregateOutputType | null
    _min: AlignmentMinAggregateOutputType | null
    _max: AlignmentMaxAggregateOutputType | null
  }

  export type AlignmentAvgAggregateOutputType = {
    id: number | null
  }

  export type AlignmentSumAggregateOutputType = {
    id: number | null
  }

  export type AlignmentMinAggregateOutputType = {
    id: number | null
    name: string | null
    field_rh: string | null
    field_ad: string | null
    is_case_sensitive: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type AlignmentMaxAggregateOutputType = {
    id: number | null
    name: string | null
    field_rh: string | null
    field_ad: string | null
    is_case_sensitive: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type AlignmentCountAggregateOutputType = {
    id: number
    name: number
    field_rh: number
    field_ad: number
    is_case_sensitive: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type AlignmentAvgAggregateInputType = {
    id?: true
  }

  export type AlignmentSumAggregateInputType = {
    id?: true
  }

  export type AlignmentMinAggregateInputType = {
    id?: true
    name?: true
    field_rh?: true
    field_ad?: true
    is_case_sensitive?: true
    created_at?: true
    updated_at?: true
  }

  export type AlignmentMaxAggregateInputType = {
    id?: true
    name?: true
    field_rh?: true
    field_ad?: true
    is_case_sensitive?: true
    created_at?: true
    updated_at?: true
  }

  export type AlignmentCountAggregateInputType = {
    id?: true
    name?: true
    field_rh?: true
    field_ad?: true
    is_case_sensitive?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type AlignmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Alignment to aggregate.
     */
    where?: AlignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Alignments to fetch.
     */
    orderBy?: AlignmentOrderByWithRelationInput | AlignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AlignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Alignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Alignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Alignments
    **/
    _count?: true | AlignmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AlignmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AlignmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AlignmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AlignmentMaxAggregateInputType
  }

  export type GetAlignmentAggregateType<T extends AlignmentAggregateArgs> = {
        [P in keyof T & keyof AggregateAlignment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAlignment[P]>
      : GetScalarType<T[P], AggregateAlignment[P]>
  }




  export type AlignmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AlignmentWhereInput
    orderBy?: AlignmentOrderByWithAggregationInput | AlignmentOrderByWithAggregationInput[]
    by: AlignmentScalarFieldEnum[] | AlignmentScalarFieldEnum
    having?: AlignmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AlignmentCountAggregateInputType | true
    _avg?: AlignmentAvgAggregateInputType
    _sum?: AlignmentSumAggregateInputType
    _min?: AlignmentMinAggregateInputType
    _max?: AlignmentMaxAggregateInputType
  }

  export type AlignmentGroupByOutputType = {
    id: number
    name: string
    field_rh: string
    field_ad: string
    is_case_sensitive: boolean
    created_at: Date
    updated_at: Date
    _count: AlignmentCountAggregateOutputType | null
    _avg: AlignmentAvgAggregateOutputType | null
    _sum: AlignmentSumAggregateOutputType | null
    _min: AlignmentMinAggregateOutputType | null
    _max: AlignmentMaxAggregateOutputType | null
  }

  type GetAlignmentGroupByPayload<T extends AlignmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AlignmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AlignmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AlignmentGroupByOutputType[P]>
            : GetScalarType<T[P], AlignmentGroupByOutputType[P]>
        }
      >
    >


  export type AlignmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    field_rh?: boolean
    field_ad?: boolean
    is_case_sensitive?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["alignment"]>

  export type AlignmentSelectScalar = {
    id?: boolean
    name?: boolean
    field_rh?: boolean
    field_ad?: boolean
    is_case_sensitive?: boolean
    created_at?: boolean
    updated_at?: boolean
  }



  export type $AlignmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Alignment"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      field_rh: string
      field_ad: string
      is_case_sensitive: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["alignment"]>
    composites: {}
  }


  type AlignmentGetPayload<S extends boolean | null | undefined | AlignmentDefaultArgs> = $Result.GetResult<Prisma.$AlignmentPayload, S>

  type AlignmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AlignmentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AlignmentCountAggregateInputType | true
    }

  export interface AlignmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Alignment'], meta: { name: 'Alignment' } }
    /**
     * Find zero or one Alignment that matches the filter.
     * @param {AlignmentFindUniqueArgs} args - Arguments to find a Alignment
     * @example
     * // Get one Alignment
     * const alignment = await prisma.alignment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AlignmentFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, AlignmentFindUniqueArgs<ExtArgs>>
    ): Prisma__AlignmentClient<$Result.GetResult<Prisma.$AlignmentPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Alignment that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AlignmentFindUniqueOrThrowArgs} args - Arguments to find a Alignment
     * @example
     * // Get one Alignment
     * const alignment = await prisma.alignment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AlignmentFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AlignmentFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__AlignmentClient<$Result.GetResult<Prisma.$AlignmentPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Alignment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlignmentFindFirstArgs} args - Arguments to find a Alignment
     * @example
     * // Get one Alignment
     * const alignment = await prisma.alignment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AlignmentFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, AlignmentFindFirstArgs<ExtArgs>>
    ): Prisma__AlignmentClient<$Result.GetResult<Prisma.$AlignmentPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Alignment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlignmentFindFirstOrThrowArgs} args - Arguments to find a Alignment
     * @example
     * // Get one Alignment
     * const alignment = await prisma.alignment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AlignmentFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AlignmentFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__AlignmentClient<$Result.GetResult<Prisma.$AlignmentPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Alignments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlignmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Alignments
     * const alignments = await prisma.alignment.findMany()
     * 
     * // Get first 10 Alignments
     * const alignments = await prisma.alignment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const alignmentWithIdOnly = await prisma.alignment.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AlignmentFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AlignmentFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlignmentPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Alignment.
     * @param {AlignmentCreateArgs} args - Arguments to create a Alignment.
     * @example
     * // Create one Alignment
     * const Alignment = await prisma.alignment.create({
     *   data: {
     *     // ... data to create a Alignment
     *   }
     * })
     * 
    **/
    create<T extends AlignmentCreateArgs<ExtArgs>>(
      args: SelectSubset<T, AlignmentCreateArgs<ExtArgs>>
    ): Prisma__AlignmentClient<$Result.GetResult<Prisma.$AlignmentPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many Alignments.
     * @param {AlignmentCreateManyArgs} args - Arguments to create many Alignments.
     * @example
     * // Create many Alignments
     * const alignment = await prisma.alignment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
    **/
    createMany<T extends AlignmentCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AlignmentCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Alignments and returns the data saved in the database.
     * @param {AlignmentCreateManyAndReturnArgs} args - Arguments to create many Alignments.
     * @example
     * // Create many Alignments
     * const alignment = await prisma.alignment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Alignments and only return the `id`
     * const alignmentWithIdOnly = await prisma.alignment.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
    **/
    createManyAndReturn<T extends AlignmentCreateManyAndReturnArgs<ExtArgs>>(
      args?: SelectSubset<T, AlignmentCreateManyAndReturnArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AlignmentPayload<ExtArgs>, T, 'createManyAndReturn'>>

    /**
     * Delete a Alignment.
     * @param {AlignmentDeleteArgs} args - Arguments to delete one Alignment.
     * @example
     * // Delete one Alignment
     * const Alignment = await prisma.alignment.delete({
     *   where: {
     *     // ... filter to delete one Alignment
     *   }
     * })
     * 
    **/
    delete<T extends AlignmentDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, AlignmentDeleteArgs<ExtArgs>>
    ): Prisma__AlignmentClient<$Result.GetResult<Prisma.$AlignmentPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Alignment.
     * @param {AlignmentUpdateArgs} args - Arguments to update one Alignment.
     * @example
     * // Update one Alignment
     * const alignment = await prisma.alignment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AlignmentUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, AlignmentUpdateArgs<ExtArgs>>
    ): Prisma__AlignmentClient<$Result.GetResult<Prisma.$AlignmentPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Alignments.
     * @param {AlignmentDeleteManyArgs} args - Arguments to filter Alignments to delete.
     * @example
     * // Delete a few Alignments
     * const { count } = await prisma.alignment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AlignmentDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AlignmentDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Alignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlignmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Alignments
     * const alignment = await prisma.alignment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AlignmentUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, AlignmentUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Alignment.
     * @param {AlignmentUpsertArgs} args - Arguments to update or create a Alignment.
     * @example
     * // Update or create a Alignment
     * const alignment = await prisma.alignment.upsert({
     *   create: {
     *     // ... data to create a Alignment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Alignment we want to update
     *   }
     * })
    **/
    upsert<T extends AlignmentUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, AlignmentUpsertArgs<ExtArgs>>
    ): Prisma__AlignmentClient<$Result.GetResult<Prisma.$AlignmentPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Alignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlignmentCountArgs} args - Arguments to filter Alignments to count.
     * @example
     * // Count the number of Alignments
     * const count = await prisma.alignment.count({
     *   where: {
     *     // ... the filter for the Alignments we want to count
     *   }
     * })
    **/
    count<T extends AlignmentCountArgs>(
      args?: Subset<T, AlignmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AlignmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Alignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlignmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AlignmentAggregateArgs>(args: Subset<T, AlignmentAggregateArgs>): Prisma.PrismaPromise<GetAlignmentAggregateType<T>>

    /**
     * Group by Alignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlignmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AlignmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AlignmentGroupByArgs['orderBy'] }
        : { orderBy?: AlignmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AlignmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAlignmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Alignment model
   */
  readonly fields: AlignmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Alignment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AlignmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the Alignment model
   */ 
  interface AlignmentFieldRefs {
    readonly id: FieldRef<"Alignment", 'Int'>
    readonly name: FieldRef<"Alignment", 'String'>
    readonly field_rh: FieldRef<"Alignment", 'String'>
    readonly field_ad: FieldRef<"Alignment", 'String'>
    readonly is_case_sensitive: FieldRef<"Alignment", 'Boolean'>
    readonly created_at: FieldRef<"Alignment", 'DateTime'>
    readonly updated_at: FieldRef<"Alignment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Alignment findUnique
   */
  export type AlignmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
    /**
     * Filter, which Alignment to fetch.
     */
    where: AlignmentWhereUniqueInput
  }

  /**
   * Alignment findUniqueOrThrow
   */
  export type AlignmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
    /**
     * Filter, which Alignment to fetch.
     */
    where: AlignmentWhereUniqueInput
  }

  /**
   * Alignment findFirst
   */
  export type AlignmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
    /**
     * Filter, which Alignment to fetch.
     */
    where?: AlignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Alignments to fetch.
     */
    orderBy?: AlignmentOrderByWithRelationInput | AlignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Alignments.
     */
    cursor?: AlignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Alignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Alignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Alignments.
     */
    distinct?: AlignmentScalarFieldEnum | AlignmentScalarFieldEnum[]
  }

  /**
   * Alignment findFirstOrThrow
   */
  export type AlignmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
    /**
     * Filter, which Alignment to fetch.
     */
    where?: AlignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Alignments to fetch.
     */
    orderBy?: AlignmentOrderByWithRelationInput | AlignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Alignments.
     */
    cursor?: AlignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Alignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Alignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Alignments.
     */
    distinct?: AlignmentScalarFieldEnum | AlignmentScalarFieldEnum[]
  }

  /**
   * Alignment findMany
   */
  export type AlignmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
    /**
     * Filter, which Alignments to fetch.
     */
    where?: AlignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Alignments to fetch.
     */
    orderBy?: AlignmentOrderByWithRelationInput | AlignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Alignments.
     */
    cursor?: AlignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Alignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Alignments.
     */
    skip?: number
    distinct?: AlignmentScalarFieldEnum | AlignmentScalarFieldEnum[]
  }

  /**
   * Alignment create
   */
  export type AlignmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
    /**
     * The data needed to create a Alignment.
     */
    data: XOR<AlignmentCreateInput, AlignmentUncheckedCreateInput>
  }

  /**
   * Alignment createMany
   */
  export type AlignmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Alignments.
     */
    data: AlignmentCreateManyInput | AlignmentCreateManyInput[]
  }

  /**
   * Alignment createManyAndReturn
   */
  export type AlignmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
    /**
     * The data used to create many Alignments.
     */
    data: AlignmentCreateManyInput | AlignmentCreateManyInput[]
  }

  /**
   * Alignment update
   */
  export type AlignmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
    /**
     * The data needed to update a Alignment.
     */
    data: XOR<AlignmentUpdateInput, AlignmentUncheckedUpdateInput>
    /**
     * Choose, which Alignment to update.
     */
    where: AlignmentWhereUniqueInput
  }

  /**
   * Alignment updateMany
   */
  export type AlignmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Alignments.
     */
    data: XOR<AlignmentUpdateManyMutationInput, AlignmentUncheckedUpdateManyInput>
    /**
     * Filter which Alignments to update
     */
    where?: AlignmentWhereInput
  }

  /**
   * Alignment upsert
   */
  export type AlignmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
    /**
     * The filter to search for the Alignment to update in case it exists.
     */
    where: AlignmentWhereUniqueInput
    /**
     * In case the Alignment found by the `where` argument doesn't exist, create a new Alignment with this data.
     */
    create: XOR<AlignmentCreateInput, AlignmentUncheckedCreateInput>
    /**
     * In case the Alignment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AlignmentUpdateInput, AlignmentUncheckedUpdateInput>
  }

  /**
   * Alignment delete
   */
  export type AlignmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
    /**
     * Filter which Alignment to delete.
     */
    where: AlignmentWhereUniqueInput
  }

  /**
   * Alignment deleteMany
   */
  export type AlignmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Alignments to delete
     */
    where?: AlignmentWhereInput
  }

  /**
   * Alignment without action
   */
  export type AlignmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Alignment
     */
    select?: AlignmentSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ParametreScalarFieldEnum: {
    id: 'id',
    cle: 'cle',
    valeur: 'valeur'
  };

  export type ParametreScalarFieldEnum = (typeof ParametreScalarFieldEnum)[keyof typeof ParametreScalarFieldEnum]


  export const AppRoleScalarFieldEnum: {
    id: 'id',
    name: 'name',
    permissions: 'permissions',
    created_at: 'created_at'
  };

  export type AppRoleScalarFieldEnum = (typeof AppRoleScalarFieldEnum)[keyof typeof AppRoleScalarFieldEnum]


  export const AppUserScalarFieldEnum: {
    id: 'id',
    login: 'login',
    password: 'password',
    nom: 'nom',
    prenom: 'prenom',
    role: 'role',
    is_ad: 'is_ad',
    actif: 'actif',
    created_at: 'created_at'
  };

  export type AppUserScalarFieldEnum = (typeof AppUserScalarFieldEnum)[keyof typeof AppUserScalarFieldEnum]


  export const CronJobScalarFieldEnum: {
    id: 'id',
    name: 'name',
    type: 'type',
    schedule: 'schedule',
    schedule_type: 'schedule_type',
    is_active: 'is_active',
    last_run: 'last_run',
    next_run: 'next_run',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type CronJobScalarFieldEnum = (typeof CronJobScalarFieldEnum)[keyof typeof CronJobScalarFieldEnum]


  export const AlignmentScalarFieldEnum: {
    id: 'id',
    name: 'name',
    field_rh: 'field_rh',
    field_ad: 'field_ad',
    is_case_sensitive: 'is_case_sensitive',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type AlignmentScalarFieldEnum = (typeof AlignmentScalarFieldEnum)[keyof typeof AlignmentScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type ParametreWhereInput = {
    AND?: ParametreWhereInput | ParametreWhereInput[]
    OR?: ParametreWhereInput[]
    NOT?: ParametreWhereInput | ParametreWhereInput[]
    id?: IntFilter<"Parametre"> | number
    cle?: StringFilter<"Parametre"> | string
    valeur?: StringFilter<"Parametre"> | string
  }

  export type ParametreOrderByWithRelationInput = {
    id?: SortOrder
    cle?: SortOrder
    valeur?: SortOrder
  }

  export type ParametreWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    cle?: string
    AND?: ParametreWhereInput | ParametreWhereInput[]
    OR?: ParametreWhereInput[]
    NOT?: ParametreWhereInput | ParametreWhereInput[]
    valeur?: StringFilter<"Parametre"> | string
  }, "id" | "cle">

  export type ParametreOrderByWithAggregationInput = {
    id?: SortOrder
    cle?: SortOrder
    valeur?: SortOrder
    _count?: ParametreCountOrderByAggregateInput
    _avg?: ParametreAvgOrderByAggregateInput
    _max?: ParametreMaxOrderByAggregateInput
    _min?: ParametreMinOrderByAggregateInput
    _sum?: ParametreSumOrderByAggregateInput
  }

  export type ParametreScalarWhereWithAggregatesInput = {
    AND?: ParametreScalarWhereWithAggregatesInput | ParametreScalarWhereWithAggregatesInput[]
    OR?: ParametreScalarWhereWithAggregatesInput[]
    NOT?: ParametreScalarWhereWithAggregatesInput | ParametreScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Parametre"> | number
    cle?: StringWithAggregatesFilter<"Parametre"> | string
    valeur?: StringWithAggregatesFilter<"Parametre"> | string
  }

  export type AppRoleWhereInput = {
    AND?: AppRoleWhereInput | AppRoleWhereInput[]
    OR?: AppRoleWhereInput[]
    NOT?: AppRoleWhereInput | AppRoleWhereInput[]
    id?: IntFilter<"AppRole"> | number
    name?: StringFilter<"AppRole"> | string
    permissions?: StringFilter<"AppRole"> | string
    created_at?: DateTimeFilter<"AppRole"> | Date | string
  }

  export type AppRoleOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    permissions?: SortOrder
    created_at?: SortOrder
  }

  export type AppRoleWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: AppRoleWhereInput | AppRoleWhereInput[]
    OR?: AppRoleWhereInput[]
    NOT?: AppRoleWhereInput | AppRoleWhereInput[]
    permissions?: StringFilter<"AppRole"> | string
    created_at?: DateTimeFilter<"AppRole"> | Date | string
  }, "id" | "name">

  export type AppRoleOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    permissions?: SortOrder
    created_at?: SortOrder
    _count?: AppRoleCountOrderByAggregateInput
    _avg?: AppRoleAvgOrderByAggregateInput
    _max?: AppRoleMaxOrderByAggregateInput
    _min?: AppRoleMinOrderByAggregateInput
    _sum?: AppRoleSumOrderByAggregateInput
  }

  export type AppRoleScalarWhereWithAggregatesInput = {
    AND?: AppRoleScalarWhereWithAggregatesInput | AppRoleScalarWhereWithAggregatesInput[]
    OR?: AppRoleScalarWhereWithAggregatesInput[]
    NOT?: AppRoleScalarWhereWithAggregatesInput | AppRoleScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AppRole"> | number
    name?: StringWithAggregatesFilter<"AppRole"> | string
    permissions?: StringWithAggregatesFilter<"AppRole"> | string
    created_at?: DateTimeWithAggregatesFilter<"AppRole"> | Date | string
  }

  export type AppUserWhereInput = {
    AND?: AppUserWhereInput | AppUserWhereInput[]
    OR?: AppUserWhereInput[]
    NOT?: AppUserWhereInput | AppUserWhereInput[]
    id?: IntFilter<"AppUser"> | number
    login?: StringFilter<"AppUser"> | string
    password?: StringFilter<"AppUser"> | string
    nom?: StringFilter<"AppUser"> | string
    prenom?: StringFilter<"AppUser"> | string
    role?: StringFilter<"AppUser"> | string
    is_ad?: BoolFilter<"AppUser"> | boolean
    actif?: BoolFilter<"AppUser"> | boolean
    created_at?: DateTimeFilter<"AppUser"> | Date | string
  }

  export type AppUserOrderByWithRelationInput = {
    id?: SortOrder
    login?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    is_ad?: SortOrder
    actif?: SortOrder
    created_at?: SortOrder
  }

  export type AppUserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    login?: string
    AND?: AppUserWhereInput | AppUserWhereInput[]
    OR?: AppUserWhereInput[]
    NOT?: AppUserWhereInput | AppUserWhereInput[]
    password?: StringFilter<"AppUser"> | string
    nom?: StringFilter<"AppUser"> | string
    prenom?: StringFilter<"AppUser"> | string
    role?: StringFilter<"AppUser"> | string
    is_ad?: BoolFilter<"AppUser"> | boolean
    actif?: BoolFilter<"AppUser"> | boolean
    created_at?: DateTimeFilter<"AppUser"> | Date | string
  }, "id" | "login">

  export type AppUserOrderByWithAggregationInput = {
    id?: SortOrder
    login?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    is_ad?: SortOrder
    actif?: SortOrder
    created_at?: SortOrder
    _count?: AppUserCountOrderByAggregateInput
    _avg?: AppUserAvgOrderByAggregateInput
    _max?: AppUserMaxOrderByAggregateInput
    _min?: AppUserMinOrderByAggregateInput
    _sum?: AppUserSumOrderByAggregateInput
  }

  export type AppUserScalarWhereWithAggregatesInput = {
    AND?: AppUserScalarWhereWithAggregatesInput | AppUserScalarWhereWithAggregatesInput[]
    OR?: AppUserScalarWhereWithAggregatesInput[]
    NOT?: AppUserScalarWhereWithAggregatesInput | AppUserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"AppUser"> | number
    login?: StringWithAggregatesFilter<"AppUser"> | string
    password?: StringWithAggregatesFilter<"AppUser"> | string
    nom?: StringWithAggregatesFilter<"AppUser"> | string
    prenom?: StringWithAggregatesFilter<"AppUser"> | string
    role?: StringWithAggregatesFilter<"AppUser"> | string
    is_ad?: BoolWithAggregatesFilter<"AppUser"> | boolean
    actif?: BoolWithAggregatesFilter<"AppUser"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"AppUser"> | Date | string
  }

  export type CronJobWhereInput = {
    AND?: CronJobWhereInput | CronJobWhereInput[]
    OR?: CronJobWhereInput[]
    NOT?: CronJobWhereInput | CronJobWhereInput[]
    id?: IntFilter<"CronJob"> | number
    name?: StringFilter<"CronJob"> | string
    type?: StringFilter<"CronJob"> | string
    schedule?: StringFilter<"CronJob"> | string
    schedule_type?: StringFilter<"CronJob"> | string
    is_active?: BoolFilter<"CronJob"> | boolean
    last_run?: DateTimeNullableFilter<"CronJob"> | Date | string | null
    next_run?: DateTimeNullableFilter<"CronJob"> | Date | string | null
    created_at?: DateTimeFilter<"CronJob"> | Date | string
    updated_at?: DateTimeFilter<"CronJob"> | Date | string
  }

  export type CronJobOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    schedule?: SortOrder
    schedule_type?: SortOrder
    is_active?: SortOrder
    last_run?: SortOrderInput | SortOrder
    next_run?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CronJobWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: CronJobWhereInput | CronJobWhereInput[]
    OR?: CronJobWhereInput[]
    NOT?: CronJobWhereInput | CronJobWhereInput[]
    name?: StringFilter<"CronJob"> | string
    type?: StringFilter<"CronJob"> | string
    schedule?: StringFilter<"CronJob"> | string
    schedule_type?: StringFilter<"CronJob"> | string
    is_active?: BoolFilter<"CronJob"> | boolean
    last_run?: DateTimeNullableFilter<"CronJob"> | Date | string | null
    next_run?: DateTimeNullableFilter<"CronJob"> | Date | string | null
    created_at?: DateTimeFilter<"CronJob"> | Date | string
    updated_at?: DateTimeFilter<"CronJob"> | Date | string
  }, "id">

  export type CronJobOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    schedule?: SortOrder
    schedule_type?: SortOrder
    is_active?: SortOrder
    last_run?: SortOrderInput | SortOrder
    next_run?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: CronJobCountOrderByAggregateInput
    _avg?: CronJobAvgOrderByAggregateInput
    _max?: CronJobMaxOrderByAggregateInput
    _min?: CronJobMinOrderByAggregateInput
    _sum?: CronJobSumOrderByAggregateInput
  }

  export type CronJobScalarWhereWithAggregatesInput = {
    AND?: CronJobScalarWhereWithAggregatesInput | CronJobScalarWhereWithAggregatesInput[]
    OR?: CronJobScalarWhereWithAggregatesInput[]
    NOT?: CronJobScalarWhereWithAggregatesInput | CronJobScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"CronJob"> | number
    name?: StringWithAggregatesFilter<"CronJob"> | string
    type?: StringWithAggregatesFilter<"CronJob"> | string
    schedule?: StringWithAggregatesFilter<"CronJob"> | string
    schedule_type?: StringWithAggregatesFilter<"CronJob"> | string
    is_active?: BoolWithAggregatesFilter<"CronJob"> | boolean
    last_run?: DateTimeNullableWithAggregatesFilter<"CronJob"> | Date | string | null
    next_run?: DateTimeNullableWithAggregatesFilter<"CronJob"> | Date | string | null
    created_at?: DateTimeWithAggregatesFilter<"CronJob"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"CronJob"> | Date | string
  }

  export type AlignmentWhereInput = {
    AND?: AlignmentWhereInput | AlignmentWhereInput[]
    OR?: AlignmentWhereInput[]
    NOT?: AlignmentWhereInput | AlignmentWhereInput[]
    id?: IntFilter<"Alignment"> | number
    name?: StringFilter<"Alignment"> | string
    field_rh?: StringFilter<"Alignment"> | string
    field_ad?: StringFilter<"Alignment"> | string
    is_case_sensitive?: BoolFilter<"Alignment"> | boolean
    created_at?: DateTimeFilter<"Alignment"> | Date | string
    updated_at?: DateTimeFilter<"Alignment"> | Date | string
  }

  export type AlignmentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    field_rh?: SortOrder
    field_ad?: SortOrder
    is_case_sensitive?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AlignmentWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AlignmentWhereInput | AlignmentWhereInput[]
    OR?: AlignmentWhereInput[]
    NOT?: AlignmentWhereInput | AlignmentWhereInput[]
    name?: StringFilter<"Alignment"> | string
    field_rh?: StringFilter<"Alignment"> | string
    field_ad?: StringFilter<"Alignment"> | string
    is_case_sensitive?: BoolFilter<"Alignment"> | boolean
    created_at?: DateTimeFilter<"Alignment"> | Date | string
    updated_at?: DateTimeFilter<"Alignment"> | Date | string
  }, "id">

  export type AlignmentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    field_rh?: SortOrder
    field_ad?: SortOrder
    is_case_sensitive?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: AlignmentCountOrderByAggregateInput
    _avg?: AlignmentAvgOrderByAggregateInput
    _max?: AlignmentMaxOrderByAggregateInput
    _min?: AlignmentMinOrderByAggregateInput
    _sum?: AlignmentSumOrderByAggregateInput
  }

  export type AlignmentScalarWhereWithAggregatesInput = {
    AND?: AlignmentScalarWhereWithAggregatesInput | AlignmentScalarWhereWithAggregatesInput[]
    OR?: AlignmentScalarWhereWithAggregatesInput[]
    NOT?: AlignmentScalarWhereWithAggregatesInput | AlignmentScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Alignment"> | number
    name?: StringWithAggregatesFilter<"Alignment"> | string
    field_rh?: StringWithAggregatesFilter<"Alignment"> | string
    field_ad?: StringWithAggregatesFilter<"Alignment"> | string
    is_case_sensitive?: BoolWithAggregatesFilter<"Alignment"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"Alignment"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Alignment"> | Date | string
  }

  export type ParametreCreateInput = {
    cle: string
    valeur: string
  }

  export type ParametreUncheckedCreateInput = {
    id?: number
    cle: string
    valeur: string
  }

  export type ParametreUpdateInput = {
    cle?: StringFieldUpdateOperationsInput | string
    valeur?: StringFieldUpdateOperationsInput | string
  }

  export type ParametreUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    cle?: StringFieldUpdateOperationsInput | string
    valeur?: StringFieldUpdateOperationsInput | string
  }

  export type ParametreCreateManyInput = {
    id?: number
    cle: string
    valeur: string
  }

  export type ParametreUpdateManyMutationInput = {
    cle?: StringFieldUpdateOperationsInput | string
    valeur?: StringFieldUpdateOperationsInput | string
  }

  export type ParametreUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    cle?: StringFieldUpdateOperationsInput | string
    valeur?: StringFieldUpdateOperationsInput | string
  }

  export type AppRoleCreateInput = {
    name: string
    permissions?: string
    created_at?: Date | string
  }

  export type AppRoleUncheckedCreateInput = {
    id?: number
    name: string
    permissions?: string
    created_at?: Date | string
  }

  export type AppRoleUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    permissions?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppRoleUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    permissions?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppRoleCreateManyInput = {
    id?: number
    name: string
    permissions?: string
    created_at?: Date | string
  }

  export type AppRoleUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    permissions?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppRoleUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    permissions?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppUserCreateInput = {
    login: string
    password: string
    nom: string
    prenom: string
    role?: string
    is_ad?: boolean
    actif?: boolean
    created_at?: Date | string
  }

  export type AppUserUncheckedCreateInput = {
    id?: number
    login: string
    password: string
    nom: string
    prenom: string
    role?: string
    is_ad?: boolean
    actif?: boolean
    created_at?: Date | string
  }

  export type AppUserUpdateInput = {
    login?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    is_ad?: BoolFieldUpdateOperationsInput | boolean
    actif?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppUserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    login?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    is_ad?: BoolFieldUpdateOperationsInput | boolean
    actif?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppUserCreateManyInput = {
    id?: number
    login: string
    password: string
    nom: string
    prenom: string
    role?: string
    is_ad?: boolean
    actif?: boolean
    created_at?: Date | string
  }

  export type AppUserUpdateManyMutationInput = {
    login?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    is_ad?: BoolFieldUpdateOperationsInput | boolean
    actif?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppUserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    login?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    is_ad?: BoolFieldUpdateOperationsInput | boolean
    actif?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CronJobCreateInput = {
    name: string
    type: string
    schedule: string
    schedule_type: string
    is_active?: boolean
    last_run?: Date | string | null
    next_run?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CronJobUncheckedCreateInput = {
    id?: number
    name: string
    type: string
    schedule: string
    schedule_type: string
    is_active?: boolean
    last_run?: Date | string | null
    next_run?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CronJobUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    schedule?: StringFieldUpdateOperationsInput | string
    schedule_type?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    last_run?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    next_run?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CronJobUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    schedule?: StringFieldUpdateOperationsInput | string
    schedule_type?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    last_run?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    next_run?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CronJobCreateManyInput = {
    id?: number
    name: string
    type: string
    schedule: string
    schedule_type: string
    is_active?: boolean
    last_run?: Date | string | null
    next_run?: Date | string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type CronJobUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    schedule?: StringFieldUpdateOperationsInput | string
    schedule_type?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    last_run?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    next_run?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CronJobUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    schedule?: StringFieldUpdateOperationsInput | string
    schedule_type?: StringFieldUpdateOperationsInput | string
    is_active?: BoolFieldUpdateOperationsInput | boolean
    last_run?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    next_run?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlignmentCreateInput = {
    name: string
    field_rh: string
    field_ad: string
    is_case_sensitive?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AlignmentUncheckedCreateInput = {
    id?: number
    name: string
    field_rh: string
    field_ad: string
    is_case_sensitive?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AlignmentUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    field_rh?: StringFieldUpdateOperationsInput | string
    field_ad?: StringFieldUpdateOperationsInput | string
    is_case_sensitive?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlignmentUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    field_rh?: StringFieldUpdateOperationsInput | string
    field_ad?: StringFieldUpdateOperationsInput | string
    is_case_sensitive?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlignmentCreateManyInput = {
    id?: number
    name: string
    field_rh: string
    field_ad: string
    is_case_sensitive?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type AlignmentUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    field_rh?: StringFieldUpdateOperationsInput | string
    field_ad?: StringFieldUpdateOperationsInput | string
    is_case_sensitive?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlignmentUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    field_rh?: StringFieldUpdateOperationsInput | string
    field_ad?: StringFieldUpdateOperationsInput | string
    is_case_sensitive?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type ParametreCountOrderByAggregateInput = {
    id?: SortOrder
    cle?: SortOrder
    valeur?: SortOrder
  }

  export type ParametreAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ParametreMaxOrderByAggregateInput = {
    id?: SortOrder
    cle?: SortOrder
    valeur?: SortOrder
  }

  export type ParametreMinOrderByAggregateInput = {
    id?: SortOrder
    cle?: SortOrder
    valeur?: SortOrder
  }

  export type ParametreSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AppRoleCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    permissions?: SortOrder
    created_at?: SortOrder
  }

  export type AppRoleAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AppRoleMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    permissions?: SortOrder
    created_at?: SortOrder
  }

  export type AppRoleMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    permissions?: SortOrder
    created_at?: SortOrder
  }

  export type AppRoleSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type AppUserCountOrderByAggregateInput = {
    id?: SortOrder
    login?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    is_ad?: SortOrder
    actif?: SortOrder
    created_at?: SortOrder
  }

  export type AppUserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AppUserMaxOrderByAggregateInput = {
    id?: SortOrder
    login?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    is_ad?: SortOrder
    actif?: SortOrder
    created_at?: SortOrder
  }

  export type AppUserMinOrderByAggregateInput = {
    id?: SortOrder
    login?: SortOrder
    password?: SortOrder
    nom?: SortOrder
    prenom?: SortOrder
    role?: SortOrder
    is_ad?: SortOrder
    actif?: SortOrder
    created_at?: SortOrder
  }

  export type AppUserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CronJobCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    schedule?: SortOrder
    schedule_type?: SortOrder
    is_active?: SortOrder
    last_run?: SortOrder
    next_run?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CronJobAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CronJobMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    schedule?: SortOrder
    schedule_type?: SortOrder
    is_active?: SortOrder
    last_run?: SortOrder
    next_run?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CronJobMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    schedule?: SortOrder
    schedule_type?: SortOrder
    is_active?: SortOrder
    last_run?: SortOrder
    next_run?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type CronJobSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type AlignmentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    field_rh?: SortOrder
    field_ad?: SortOrder
    is_case_sensitive?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AlignmentAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AlignmentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    field_rh?: SortOrder
    field_ad?: SortOrder
    is_case_sensitive?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AlignmentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    field_rh?: SortOrder
    field_ad?: SortOrder
    is_case_sensitive?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type AlignmentSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ParametreDefaultArgs instead
     */
    export type ParametreArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ParametreDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AppRoleDefaultArgs instead
     */
    export type AppRoleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AppRoleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AppUserDefaultArgs instead
     */
    export type AppUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AppUserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CronJobDefaultArgs instead
     */
    export type CronJobArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CronJobDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AlignmentDefaultArgs instead
     */
    export type AlignmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AlignmentDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}