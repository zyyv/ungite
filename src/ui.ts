import process from 'node:process'
import { log } from 'node:console'
import { cancel, isCancel, multiselect } from '@clack/prompts'
import { chalk } from 'zx'
import { getAllBranches } from './utils'

interface BranchUIOptions {
  cwd?: string
  remote?: boolean
  filter?: string
  switch?: boolean
  delete?: boolean
}

export async function branchUI(options: BranchUIOptions) {
  const { remote = false, filter } = options
  let branches = await getAllBranches(remote)

  if (filter) {
    const reg = new RegExp(filter ?? '', 'i')
    branches = branches.filter(i => reg.test(i[0]))
  }

  const MaxBranchLenth = 40

  const selectOptions = branches.map((i) => {
    let label = `${(i[0].startsWith('* ') ? i[0].slice(2) : i[0]).padEnd(MaxBranchLenth, ' ')} ${i[1].padEnd(20)} ${i[2]}`
    if (i[0].startsWith('* '))
      label = chalk.green(label)
    else if (i[2] === 'remotes')
      label = chalk.gray(label)
    else if (i[2] === 'local')
      label = chalk.yellow(label)

    return {
      value: i,
      label,
      hint: i[0].startsWith('* ') ? 'Current Branch' : '',
    }
  })

  const result = await multiselect({
    message: `${chalk.yellow('List of branchs'.padEnd(MaxBranchLenth + 2))} ${chalk.blue('RemoteName'.padEnd(20))} ${chalk.red('Type')}`,
    required: false,
    options: selectOptions,
    cursorAt: selectOptions[branches.findIndex(i => i[0].startsWith('* '))].value,
  })

  if (isCancel(result)) {
    cancel('Ungite Operation cancelled.')
    return process.exit(0)
  }

  if (result.length === 0)
    return process.exit(0)

  log('result: ', result)
}
