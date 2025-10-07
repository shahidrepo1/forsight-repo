- you must have node js LTS version and Git installed.
- clone the repo from Github.
- select the required branch
- In terminal, goto the root folder of the project.
- run **npm install** or **npm i** to install all the dependencies.
- use **npm run stagebuild** command to build the project for staging.
- use **npm run build** command to build the project for production.
- you can use **npm run preview** command to test-run the project after build.
- staging and production environments picks variable from .env.staging and
  .env.production files respectively.
