import consola from 'consola'
import cac from 'cac'
import { version } from '../package.json'
import { ui, branchUI } from './ui'


startCli().catch(consola.error)

async function startCli(cwd = process.cwd()) {
  const cli = cac('ungite')

  cli.option('-d, --debug', 'Debug mode')

  cli.command('b', 'List of branchs')
    .option('-r, --remote', 'Include remote branchs')
    .action((options) => {
      consola.log(options)
      branchUI(cwd)
    })

  cli.help()
  cli.version(version)
  cli.parse()
}
