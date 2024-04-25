import process from 'node:process'
import { $ } from 'zx'
import type { branchTypes } from './types'

export async function getAllBranches(remote = false) {
  return new Promise<branchTypes[]>((resolve) => {
    const child = $.spawn('git', ['branch', '-a'], {
      cwd: process.cwd(),
    })

    child.stdout.on('data', (data) => {
      const branches = (data.toString() as string).split('\n').map(i => i.trim()).filter(Boolean)
      const remoteIndex = branches.findIndex(i => i.startsWith('remotes/'))
      const localBranches = branches.slice(0, remoteIndex).map(i => normalizeBranch(i))
      const remoteBranches = remote ? branches.slice(remoteIndex).map(i => normalizeBranch(i, true)) : []
      resolve([...localBranches, ...remoteBranches].filter(i => !i[0].includes('HEAD ->')))
    })
  })
}

function normalizeBranch(branch: string, isRemote = false): branchTypes {
  if (isRemote) {
    const [remoteTag, remoteName, ...branchName] = branch.split('/')
    return [branchName.join('/'), remoteName, remoteTag]
  }
  else {
    return [branch, 'local', 'local']
  }
}

export async function deleteBranch(meta: branchTypes) {
  const [name, remote, type] = meta
  const isLocal = type === 'local'
  if (isLocal)
    await $`git branch -d ${getAimBranch(meta)}`

  else
    await $`git push ${remote} --delete ${name}`
}

export async function deleteBranches(metas: branchTypes[]) {
  for (const meta of metas)
    await deleteBranch(meta)
}

export function getAimBranch(meta: branchTypes) {
  meta[1] = meta[1] === 'local' ? '' : meta[1]
  meta[2] = meta[2] === 'local' ? '' : meta[2]
  return meta.filter(Boolean).reverse().join('/')
}
