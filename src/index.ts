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
    .action(({ remote, filter }) => {
      branchUI({
        remote,
        filter,
      })
    })

  cli.help()
  cli.version(version)
  cli.parse()
}
