import process from 'node:process'
import { cancel, confirm, isCancel, multiselect, select } from '@clack/prompts'
import { $, chalk } from 'zx'
import { deleteBranch, deleteBranches, getAimBranch, getAllBranches } from './utils'
import type { branchTypes } from './types'

interface BranchUIOptions {
  cwd?: string
  remote?: boolean
  filter?: string
  switch?: boolean
  delete?: boolean
}

export async function branchUI(options: BranchUIOptions) {
  let branches = await getAllBranches(options.remote ?? false)

  if (options.filter) {
    const reg = new RegExp(options.filter ?? '', 'i')
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

  const realResult = result.filter(i => !i[0].startsWith('* '))

  if (realResult.length === 0)
    return process.exit(0)

  if (realResult.length === 1) {
    const branchMeta = realResult[0] as branchTypes
    const aimBranch = getAimBranch(branchMeta)

    if (options.switch) {
      await $`git checkout ${aimBranch}`
    }

    else if (options.delete) {
      await deleteBranch(branchMeta)
    }
    // TODO options.delete
    else {
      const operation = await select({
        message: `How do you want to operate the ${chalk.red(aimBranch)} branch?`,
        options: [
          { value: 'switch', label: 'Switch' },
          { value: 'delete', label: 'Delete', hint: '⚠️ Danger, please pay attention to your operation!' },
        ],
        initialValue: 'delete',
      })

      if (isCancel(operation)) {
        cancel('Ungite Operation cancelled.')
        return process.exit(0)
      }

      if (operation === 'switch')
        await handleSwitch(branchMeta)

      else if (operation === 'delete')
        await handleDelete(branchMeta)
    }
  }
  // multi select
  else {
    if (options.delete)
      return await deleteBranches(realResult)

    const operation = await select({
      message: `How do you want to operate those branchs?`,
      options: [
        { value: 'delete', label: 'Delete', hint: '⚠️ Danger, please pay attention to your operation!' },
      ],
      initialValue: 'delete',
    })

    if (isCancel(operation)) {
      cancel('Ungite Operation cancelled.')
      return process.exit(0)
    }

    if (operation === 'delete')
      await deleteBranches(realResult)
  }
}

async function handleSwitch(meta: branchTypes) {
  await $`git checkout ${getAimBranch(meta)}`
}

async function handleDelete(meta: branchTypes) {
  const aimBranch = getAimBranch(meta)

  const deleteConfirm = await confirm({
    message: `Delete branch ${aimBranch}?`,
    initialValue: true,
  })

  if (isCancel(deleteConfirm)) {
    cancel('Ungite Operation cancelled.')
    return process.exit(0)
  }

  if (deleteConfirm)
    await deleteBranch(meta)

  return process.exit(0)
}
