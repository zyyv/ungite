import process from 'node:process'
import { $ } from 'zx'
import type { branchTypes } from './types'

export async function getAllBranches(remote = false) {
  return new Promise<branchTypes[]>((resolve) => {
    const child = $.spawn('git', ['branch', '-a', '--format', '"%(refname:short)"'], {
      cwd: process.cwd(),
    })

    child.stdout.on('data', (data) => {
      const branches = data.toString().trim().split('\n')
        .map((i: string) => {
          i = i.slice(1, -1)
          const s = i.split('/').reverse()
          return [s[0], s[1] ?? 'local'] as branchTypes
        })
        .filter((i: branchTypes) => i[0] !== 'HEAD')
        .filter((i: branchTypes) => remote ? true : i[1] === 'local')

      resolve(branches)
    })
  })
}
