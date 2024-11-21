/* eslint-disable @typescript-eslint/no-unused-vars */
// globals.d.ts

declare module "yup" {
  interface StringSchema<TType, TContext, TDefault, TFlags> {
    append(appendStr: string): this;
  }
}
