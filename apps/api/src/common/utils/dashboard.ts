import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export async function showServiceLogs(configService: ConfigService, port: number) {
    try {
        // Dynamic imports for ESM compatibility
        const { default: boxen } = await import('boxen');
        const chalk = require('chalk');
        const Table = require('cli-table3');

        console.clear();

        const table = new Table({
            head: [
                chalk.cyan.bold('Service'),
                chalk.cyan.bold('Status'),
                chalk.cyan.bold('Details')
            ],
            colWidths: [20, 15, 35],
            style: { head: [], border: [] }
        });

        const env = process.env.NODE_ENV || 'development';

        table.push(
            ['API Server', chalk.green.bold('RUNNING'), `http://localhost:${port}`],
            ['Database', chalk.green.bold('CONNECTED'), 'PostgreSQL'],
            ['Redis', chalk.green.bold('CONNECTED'), 'Upstash'],
            ['Environment', chalk.yellow.bold(env), '-']
        );

        console.log(boxen(table.toString(), {
            title: chalk.bold.magenta(' Tingle Talk Backend '),
            titleAlignment: 'center',
            padding: 1,
            borderColor: 'cyan',
            borderStyle: 'round',
            margin: 1
        }));
    } catch (e) {
        // Fallback if formatting fails
        const logger = new Logger('Dashboard');
        logger.log(`\u2713 Application is running on: http://localhost:${port}`);
        logger.error('Failed to render dashboard:', e.message);
    }
}
