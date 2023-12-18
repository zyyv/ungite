import process from 'node:process'
import consola from 'consola'
import cac from 'cac'
import { version } from '../package.json'
import { branchUI } from './ui'

startCli().catch(consola.error)

async function startCli(cwd = process.cwd()) {
  const cli = cac('ungite')

  cli.option('-d, --debug', 'Debug mode')

  cli.command('b', 'List of branchs')
    .option('-r, --remote', 'Include remote branchs')
    .option('-f, --filter <filter>', 'Filter branchs by name')
    .option('-del, --delete', 'Delete branchs')
    .option('-s, --switch', 'Switch branchs')
    .action((opt) => {
      const { remote, filter, delete: del, switch: sw } = opt
      branchUI({
        cwd,
        remote,
        filter,
        delete: del,
        switch: sw,
      })
    })

  cli.help()
  cli.version(version)
  cli.parse()
}
