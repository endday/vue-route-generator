import * as path from 'path'
import { generateRoutes } from '../src'

it('Integration test', () => {
  const res = generateRoutes({
    pages: path.resolve(__dirname, 'fixtures'),
  })

  expect(res).toMatchSnapshot()
})
