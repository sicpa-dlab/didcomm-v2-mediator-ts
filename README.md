# DIDComm v2 Mediator

## Description

DIDComm v2 Mediator is a web service for messages mediation in DIDComm v2 protocols. Based on [NestJS](https://nestjs.com/) framework

## Persistence

For persistence this backend uses `MikroORM` with `Postgres` and requires access to pre-configured `Postgres` instance.
To start `postgres` compatible with default settings in docker use the following command:

```bash
# Starting container
$ docker run --name cloud-agent-postgres -e POSTGRES_DB=cloud_agent -e POSTGRES_USER=cloud_agent -e POSTGRES_PASSWORD=cloud_agent_password -p 5432:5432 -d postgres
```

## Migrations

To manage db schema we use migrations stored in ```./migrations``` directory.
You need to call ```npm run migration:up``` before starting any BE app.
Commands to manage migrations are:

```bash
# Migrate database to the latest version
$ npm run migration:up

# Migration:up help for advanced options
$ npm run migration:up -- -h

# Migrate one version down. Note we don't support down migrations for the moment and it will fail
$ npm run migration:down

# See list of applied migrations
$ npm run migration:list

# See list of pending migrations
$ npm run migration:pending

# Automatically create new migration as a diff between current database and updated model
$ npm run migration:create

# Drop database schema and migrations table. Note you can skip --drop-migrations-table flag to keep migrations table
# or remove -r to just see help.
$ npm run schema:drop -- --drop-migrations-table -r
```

## Build the app

```bash
# Build code
$ npm run build
```

## Run the app

```bash
# Run in development mode
$ npm run start

# Run in development mode, watch for changes and automatically restart
$ npm run watch

# Run in debug mode
$ npm run debug
```

## Test the app

```bash
# Run unit tests
$ npm run test

# Run e2e tests
$ npm run test:e2e

# Run tests and produce coverage report
$ npm run test:cov
```

## Development tools

```bash
# Run prettier to auto-format all source code
$ npm run style:fix

# Produce linter report
$ npm run lint

# ...with auto-fix
$ npm run lint:fix
```

## Mediation Invitation

Find Mediator provisioning invitation URL in the service output under `MEDIATOR PROVISIONING INVITATION` log statement.
By default, Mediator starts at `http://localhost:3000`. In order to use Mediator outside you local host you need to set `EXPRESS_PUBLIC_URL` environment variable.

## SBoM (Software Bill of Materials)

To generate SBoM reports, run following command: 

```bash
$ npm run generate-sbom
```