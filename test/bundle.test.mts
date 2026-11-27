import assert from 'node:assert/strict'
import { readFile, realpath, stat } from 'node:fs/promises'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
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
  assert.equal(en.meta.detail, 'docs/DETAIL.md')
  assert.equal(zh.meta.detail, 'docs/DETAIL.zh.md')
  for (const detail of [en.meta.detail, zh.meta.detail]) {
    assert.ok(manifest.files.includes(detail), `${detail} should be listed in package.json files`)
    assert.ok((await stat(fileURLToPath(new URL(detail, root)))).isFile(), detail)
  }
})

test('loads built index.js and client.js via ModuleLoader envelope', async () => {
  const hostMod = await import(new URL('index.js', root).href) as { name?: unknown; apply?: unknown }
  assert.equal(hostMod.name, '@miorin/dsh-atlas-continuity')
  assert.equal(typeof hostMod.apply, 'function')

  const clientCode = await read('client.js')
  let loaded: { id: string; factory: (req: (id: string) => unknown) => Record<string, unknown> } | undefined
  vm.runInNewContext(clientCode, {
    window: { __ModuleLoader__: { load(payload: typeof loaded) { loaded = payload } } },
  })
  assert.equal(loaded?.id, '@miorin/dsh-atlas-continuity')
  const mod = loaded!.factory(id => {
    if (id === 'react') {
      return {
        Fragment: Symbol('Fragment'),
        createElement: () => null,
        useEffect: () => {},
        useId: () => 'id',
        useRef: (v: unknown) => ({ current: v }),
        useState: (v: unknown) => [v, () => {}],
        useSyncExternalStore: (_sub: unknown, get: () => unknown) => get(),
      }
    }
    if (id === '@deepseek-ai/dsh-client-ui-primitives') {
      return {
        Button: () => null,
        IconChevronRightOutlineRegular: () => null,
        IconChevronsUpDownOutlineMedium: () => null,
        Modal: () => null,
        PluginArtworkSubagent: () => null,
        Switch: () => null,
        Tooltip: ({ children }: { children: unknown }) => children,
      }
    }
    throw new Error(`unexpected require: ${id}`)
  }) as { inject: readonly string[]; apply: (ctx: unknown) => void }
  assert.deepEqual([...mod.inject], ['locale', 'slots', 'remote', 'remote.pluginManager'])
  assert.equal(typeof mod.apply, 'function')
})
