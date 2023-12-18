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
