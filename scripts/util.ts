import * as fs from 'fs'
import { resolve } from 'path'

const defaultPath = resolve(process.cwd(), 'package.json')

export function getExternals(filePath: string = defaultPath) {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const {
    dependencies,
    devDependencies,
    peerDependencies
  } = json
  const data = Object.assign({}, dependencies, devDependencies, peerDependencies)
  return Object.keys(data)
}

export function noExternal (filePath: string = defaultPath) {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Object.keys(json.dependencies || {}).concat(
    Object.keys(json.devDependencies || {})
  )
}

