const packageJson = require('../../package.json')

export default function main() {
  let vue = null
  const data = {
    isVue2: false,
    isVue3: false
  }
  try {
    vue = require('vue')
  } catch (e) {
    console.log(`[${packageJson.name}] not current Vue version, please use Vue2/3`)
    return data
  }
  const { version } = vue

  if (typeof version !== 'string' || !(version.startsWith('2.') || version.startsWith('3.'))) {
    console.log(`[${packageJson.name}] not current Vue version, please use Vue2/3`)
    return data
  }

  data.isVue2 = version.startsWith('2.')
  data.isVue3 = version.startsWith('3.')

  return data
}
