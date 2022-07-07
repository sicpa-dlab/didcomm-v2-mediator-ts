import { ReflectMetadataProvider } from '@mikro-orm/core'
import * as entities from './src/common/entities'
import commonConfig from './src/config/mikro-orm'

export default {
    ...commonConfig(),
    entities: Object.values(entities),
    migrations: {
        tableName: 'migrations', // name of database table with log of executed transactions
        path: './migrations', // path to the folder with migrations
        transactional: true, // wrap each migration in a transaction
        disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
        allOrNothing: true, // wrap all migrations in master transaction
    },
    tsNode: false,
    metadataProvider: ReflectMetadataProvider,
    cache: {
        enabled: false,
    }
}

