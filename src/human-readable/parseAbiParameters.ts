import type { AbiParameter } from '../abi'
import { BaseError } from '../errors'
import type { Narrow } from '../narrow'
import type { Error, Filter } from '../types'
import {
  isStructSignature,
  modifiers,
  parseAbiParameter as parseAbiParameter_,
  parseStructs,
  splitParameters,
} from './runtime'
import type {
  IsStructSignature,
  Modifier,
  ParseAbiParameters as ParseAbiParameters_,
  ParseStructs,
  SplitParameters,
} from './types'

/**
 * Parses human-readable ABI parameters into {@link AbiParameter}s
 *
 * @param TParams - Human-readable ABI parameters
 * @returns Parsed {@link AbiParameter}s
 *
 * @example
 * type Result = ParseAbiParameters('address from, address to, uint256 amount')
 * //   ^? type Result: [{ type: "address"; name: "from"; }, { type: "address";...
 *
 * @example
 * type Result = ParseAbiParameters<
 *   // ^? type Result: [{ type: "tuple"; components: [{ type: "string"; name:...
 *   ['Baz bar', 'struct Baz { string name; }']
 * >
 */
export type ParseAbiParameters<
  TParams extends string | readonly string[] | readonly unknown[],
> =
  | (TParams extends string
      ? TParams extends ''
        ? never
        : string extends TParams
        ? readonly AbiParameter[]
        : ParseAbiParameters_<SplitParameters<TParams>, { Modifier: Modifier }>
      : never)
  | (TParams extends readonly string[]
      ? string[] extends TParams
        ? AbiParameter // Return generic AbiParameter item since type was no inferrable
        : ParseStructs<TParams> extends infer Structs
        ? {
            [K in keyof TParams]: TParams[K] extends string
              ? IsStructSignature<TParams[K]> extends true
                ? never
                : ParseAbiParameters_<
                    SplitParameters<TParams[K]>,
                    { Modifier: Modifier; Structs: Structs }
                  >
              : never
          } extends infer Mapped extends readonly unknown[]
          ? Filter<Mapped, never>[0] extends infer Result
            ? Result extends undefined
              ? never
              : Result
            : never
          : never
        : never
      : never)

/**
 * Parses human-readable ABI parameters into {@link AbiParameter}s
 *
 * @param params - Human-readable ABI parameters
 * @returns Parsed {@link AbiParameter}s
 *
 * @example
 * const abiParameters = parseAbiParameters('address from, address to, uint256 amount')
 * //    ^? const abiParameters: [{ type: "address"; name: "from"; }, { type: "address";...
 *
 * @example
 * const abiParameters = parseAbiParameters([
 *   //  ^? const abiParameters: [{ type: "tuple"; components: [{ type: "string"; name:...
 *   'Baz bar',
 *   'struct Baz { string name; }',
 * ])
 */
export function parseAbiParameters<
  TParams extends string | readonly string[] | readonly unknown[],
>(
  params: Narrow<TParams> &
    (
      | (TParams extends string
          ? TParams extends ''
            ? Error<'Empty string is not allowed.'>
            : unknown
          : never)
      | (TParams extends readonly string[]
          ? TParams extends readonly [] // empty array
            ? Error<'At least one parameter required.'>
            : string[] extends TParams
            ? unknown
            : unknown // TODO: Validate param string
          : never)
    ),
): ParseAbiParameters<TParams> {
  const abiParameters: AbiParameter[] = []
  if (typeof params === 'string') {
    const parameters = splitParameters(params)
    const length = parameters.length
    for (let i = 0; i < length; i++) {
      abiParameters.push(parseAbiParameter_(parameters[i]!, { modifiers }))
    }
  } else {
    const structs = parseStructs(params as readonly string[])
    const length = params.length
    for (let i = 0; i < length; i++) {
      const signature = (params as readonly string[])[i]!
      if (isStructSignature(signature)) continue
      const parameters = splitParameters(signature)
      const length = parameters.length
      for (let k = 0; k < length; k++) {
        abiParameters.push(
          parseAbiParameter_(parameters[k]!, { modifiers, structs }),
        )
      }
    }
  }

  if (abiParameters.length === 0)
    throw new BaseError('Failed to parse ABI parameters.', {
      details: `parseAbiParameters(${JSON.stringify(params, null, 2)})`,
      docsPath: '/api/human.html#parseabiparameters-1',
    })
  return abiParameters as ParseAbiParameters<TParams>
}
