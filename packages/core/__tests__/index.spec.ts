import { resolve } from 'path'
import { generateRoutes } from '../src'

it('Integration test', () => {
  const res = generateRoutes({
    pages: resolve('./fixtures'),
  })

  expect(res).toMatchSnapshot()
})
