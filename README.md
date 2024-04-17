# ShrinkURL Server

## Description

ShrinkURL is a sleek, user-friendly URL shortener project designed to simplify link sharing and management. With its intuitive interface and robust backend, ShrinkURL allows users to generate concise, custom short links for long URLs effortlessly.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Husky and Commitlint Configuration

ShrinkURL utilizes Husky and Commitlint for ensuring consistent commit messages and running pre-commit hooks. To set up Husky and Commitlint, follow these steps:

1. Install Husky and Commitlint as dev dependencies:

```bash
pnpm install --save-dev husky @commitlint/{config-conventional,cli}
```

- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `chore`: Regular code maintenance.
- `ci`: Changes to your CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- `docs`: Documentation only changes
- `feat`: A new feature
- `fix`: A bug fix
- `perf`: A code change that improves performance
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `revert`: If the commit reverts a previous commit, it should begin with `revert:` , followed by the header of the reverted commit. In the body, it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `test`: Adding missing tests or correcting existing tests

Now, whenever you make a commit, Husky will ensure that your commit message conforms to the conventional commit format specified by Commitlint.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

# Credits

Developed by [Alejandro Sandí](https://alejandrosandi.dev).
