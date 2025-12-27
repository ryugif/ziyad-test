## Project setup

```bash
pnpm install

cp .env.example .env
```

## Run with Docker Compose

```bash
# build containers and start app + postgres
docker compose up --build

# stop containers
docker compose down
```

On container startup the app will run `pnpm migration:run` to ensure database tables exist before launching.

Configuration values live in [.env.example](.env.example). Copy it to `.env` before running Docker; the compose stack loads that file for both the app and Postgres. Adjust `POSTGRES_HOST` to `localhost` only if you are running the app outside Docker.

## Compile and run the project

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# production mode
pnpm run build
pnpm run start:prod
```
