import process from 'node:process'
import { cancel, isCancel, log, multiselect, note } from '@clack/prompts'
import { $ } from 'zx'

interface RemoteUIOptions {
  cwd?: string
  delete?: boolean
}

interface Remote {
  name: string
  addresses: string[]
}

export async function remoteUI(options: RemoteUIOptions = {}) {
  const git = $({ cwd: options.cwd ?? process.cwd(), quiet: true })
  const output = await git`git remote -v`
  const remotes = new Map<string, Remote>()

  for (const line of output.stdout.split('\n')) {
    const match = line.match(/^(\S+)\s+(.+) \((fetch|push)\)$/)
    if (!match)
      continue

    const [, name, url, type] = match
    const remote = remotes.get(name) ?? { name, addresses: [] }
    remote.addresses.push(`${url} (${type})`)
    remotes.set(name, remote)
  }

  if (remotes.size === 0) {
    log.info('No remotes configured.')
    return
  }

  const nameWidth = Math.max(...Array.from(remotes.keys(), name => name.length))
  note(Array.from(remotes.values()).flatMap(remote =>
    remote.addresses.map(address => `${remote.name.padEnd(nameWidth)}  ${address}`),
  ).join('\n'), 'Git remotes')

  if (!options.delete)
    return

  if (remotes.size === 1 && remotes.has('origin')) {
    log.info('origin is protected. No remotes available to delete.')
    return
  }

  const selected = await multiselect({
    message: 'Select remotes to remove from this repository',
    required: false,
    options: Array.from(remotes.values(), remote => ({
      value: remote.name,
      label: remote.name,
      hint: remote.name === 'origin' ? 'Protected — cannot be deleted' : remote.addresses.join(' | '),
      disabled: remote.name === 'origin',
    })),
  })

  if (isCancel(selected)) {
    cancel('Ungite operation cancelled.')
    return
  }

  for (const name of selected) {
    if (name === 'origin')
      throw new Error('origin is protected and cannot be deleted.')

    await git`git remote remove ${name}`
    log.success(`Removed remote ${name}.`)
  }
}
