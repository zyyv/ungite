import process from 'node:process'
import { multiselect } from '@clack/prompts'
import { getAllBranches } from './utils'

export function ui(cwd = process.cwd()) {

}

interface BranchUIOptions {
  cwd?: string
  remote?: boolean
  filter?: string
}

export async function branchUI(options: BranchUIOptions) {
  const { remote = false, filter } = options
  let branches = await getAllBranches(remote)

  if (filter) {
    const reg = new RegExp(filter ?? '', 'i')
    branches = branches.filter(i => reg.test(i[0]))
  }

  await multiselect({
    message: 'List of branchs',
    required: false,
    options: branches.map(i => ({ value: i[0], label: `${i[0].padEnd(50, ' ')}  ${i[1]}` })),
  })
}
