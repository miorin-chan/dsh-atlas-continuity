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
  assert.notEqual(manifest.private, true)
  assert.equal(manifest.publishConfig?.access, 'public')
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
  test(`resolves ${name} runtime exports`, async () => {
    const pkg = JSON.parse(await read('package.json'))
    const spec = pkg.dependencies?.[name]
    const installed = await realpath(new URL(`node_modules/${name}/`, root))
    if (typeof spec === 'string' && spec.startsWith('link:')) {
      const checkout = await realpath(new URL(`../${id}/`, root))
      assert.equal(installed, checkout)
    }
    const manifest = JSON.parse(await read(`node_modules/${name}/package.json`))
    assert.equal(manifest.name, name)
    for (const entry of [name, `${name}/client`, `${name}/locale/en.json`, `${name}/icon`]) {
      assert.ok((await stat(fileURLToPath(import.meta.resolve(entry)))).isFile(), entry)
    }
  })
}

test('declares packaged English and Chinese meta.detail documents', async () => {
  const manifest = JSON.parse(await read('package.json'))
  const en = JSON.parse(await read('locale/en.json'))
  const zh = JSON.parse(await read('locale/zh.json'))
  assert.equal(en.meta.detail, 'README.md')
  assert.equal(zh.meta.detail, 'README.zh.md')
  for (const detail of [en.meta.detail, zh.meta.detail]) {
    assert.ok(manifest.files.includes(detail), `${detail} should be listed in package.json files`)
    assert.ok((await stat(fileURLToPath(new URL(detail, root)))).isFile(), detail)
  }
})
