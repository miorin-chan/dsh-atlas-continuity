import assert from 'node:assert/strict'
import { readFile, realpath, stat } from 'node:fs/promises'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const root = new URL('../', import.meta.url)
const members = [
  { id: 'dsh-vcs-panel', config: { enabled: true } },
  { id: 'dsh-sideby-note' },
]

const read = (path: string) => readFile(new URL(path, root), 'utf8')

test('inserts the two original plugin rows in order plus the aggregate runtime row', async () => {
  const manifest = JSON.parse(await read('package.json'))
  const names = members.map(({ id }) => `@miorin/${id}`)
  assert.equal(manifest.private, true)
  assert.equal(manifest.exports['.'], './index.js')
  assert.equal(manifest.exports['./client'], './client.js')
  assert.deepEqual(manifest.dsh.bundle, { patch: './cordis.patch.yml' })
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.equal(manifest.dsh.client.immediately, true)
  assert.deepEqual(manifest.dsh.aggregate, {
    version: 1,
    runtimeRowId: 'dsh-atlas-continuity',
    plugins: names,
    defaults: Object.fromEntries(names.map(name => [name, true])),
  })
  assert.deepEqual(parse(await read(manifest.dsh.bundle.patch)), [{
    insert: [
      ...members.map(({ id, ...fields }, index) => ({ id, name: names[index], ...fields })),
      { id: 'dsh-atlas-continuity', name: '@miorin/dsh-atlas-continuity' },
    ],
  }])
})

for (const { id } of members) {
  const name = `@miorin/${id}`
  test(`resolves ${name} from its sibling checkout`, async () => {
    const checkout = await realpath(new URL(`../${id}/`, root))
    const installed = await realpath(new URL(`node_modules/${name}/`, root))
    assert.equal(installed, checkout)
    const manifest = JSON.parse(await read(`node_modules/${name}/package.json`))
    assert.equal(manifest.name, name)
    for (const entry of [name, `${name}/client`, `${name}/locale/en.json`, `${name}/icon`]) {
      assert.ok((await stat(fileURLToPath(import.meta.resolve(entry)))).isFile(), entry)
    }
  })
}
