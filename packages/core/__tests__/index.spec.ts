import { it, expect } from 'vitest'
import * as path from 'path'
import { generateRoutes } from '../src'

const resolve = (p: string): string => path.resolve(__dirname, p)

it('Integration test', () => {
  const res = generateRoutes({
    pages: resolve('./fixtures')
  })

  expect(res).toMatchSnapshot()
})
