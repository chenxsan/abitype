---
description: "ABIType types as Zod schemas via the `'abitype/zod'` entrypoint."
title: 'Zod'
---

# Zod

ABIType exports the [core types](/api/types) as [Zod](https://github.com/colinhacks/zod) schemas from the `'abitype/zod'` entrypoint.

## Install

Install the Zod peer dependency:

::: code-group

```bash [pnpm]
pnpm add zod
```

```bash [npm]
npm i zod
```

```bash [yarn]
yarn add zod
```

:::

## Usage

Import and use schemas:

```ts
import { Abi } from 'abitype/zod'

const result = await fetch(
  'https://api.etherscan.io/api?module=contract&action=getabi&address=0x…',
)
const abi = Abi.parse(result)
```

## Schemas

```ts
export {
  Abi,
  AbiConstructor,
  AbiEvent,
  AbiError,
  AbiFallback,
  AbiFunction,
  AbiParameter,
  AbiReceive,
  AbiStateMutability,
  SolidityAddress,
  SolidityArray,
  SolidityArrayWithoutTuple,
  SolidityArrayWithTuple,
  SolidityBool,
  SolidityBytes,
  SolidityFunction,
  SolidityInt,
  SolidityString,
  SolidityTuple,
} from 'abitype/zod'
```
