import process from 'node:process'
import consola from 'consola'
import cac from 'cac'
import { version } from '../package.json'
import { branchUI } from './ui'
import { remoteUI } from './remote'

startCli().catch(consola.error)

async function startCli(cwd = process.cwd()) {
  const cli = cac('ungite')

  // cli.option('-d, --debug', 'Debug mode')

  cli.command('b', 'List of branchs')
    .option('-r, --remote', 'Include remote branchs')
    .option('-f, --filter <filter>', 'Filter branchs by name')
    .option('-d, --delete', 'Delete branchs')
    .option('-s, --switch', 'Switch branchs')
    .action((opt) => {
      const { remote, filter, delete: del, switch: sw } = opt
      return branchUI({
        cwd,
        remote,
        filter,
        delete: del,
        switch: sw,
      })
    })

  cli.command('r', 'List remotes')
    .option('-d, --delete', 'Delete remotes (origin is protected)')
    .action(opt => remoteUI({ cwd, delete: opt.delete }))

  cli.help()
  cli.version(version)
  cli.parse(process.argv, { run: false })
  await cli.runMatchedCommand()
}
