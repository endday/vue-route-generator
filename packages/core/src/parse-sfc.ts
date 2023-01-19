import getVersion from './util/getVersion'
import type { parseComponent as _parserV2 } from 'vue-template-compiler'
import type { parse as _parserV3 } from '@vue/compiler-sfc'

const packageJson = require('../../package.json')

const { isVue2 } = getVersion()

export interface ParseResult {
  customBlocks: CustomBlock[]
}

export interface CustomBlock {
  type: string
  content: string
}

function parserV2Fn(code: string) {
  const parserV2: typeof _parserV2 = require('vue-template-compiler')
    .parseComponent
  return parserV2(code, {
    pad: 'space'
  })
}

function parserV3Fn(code: string) {
  const parserV3: typeof _parserV3 = require('@vue/compiler-sfc').parse
  return parserV3(code, {
    pad: 'space'
  }).descriptor
}

export function parseSFC(code: string): ParseResult {
  try {
    if (isVue2) {
      return parserV2Fn(code)
    } else {
      return parserV3Fn(code)
    }
  } catch {
    throw new Error(
      `[${packageJson.name}] Either "vue-template-compiler" or "@vue/compiler-sfc" is required.`
    )
  }
}
