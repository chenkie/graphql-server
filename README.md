# GraphQL Students-Courses Server

This is the GraphQL server implementation used in Front End Masters' GraphQL workshop. It contains GraphQL queries and mutations to handle CRUD operations on a **courses** and **students** resource. MongoDB is used to persist the data and a connection to mLab is provided.

## Getting Started

Clone the repo, install the dependencies, and run the server.

```bash
npm i
# for live reload
npm run dev
# for prod
npm start
```

## Why Did You Commit Your mLab Credentials?

There is a `.env` file included with a connection string to an mLab database. Normally the `.env` file would not be committed and any access to a remote server would be hidden. The database used for this example is a throwaway. For the sake of getting started quickly, it is easier to provide direct access to a working database out of the box.

If you will be publishing work based on this example, be sure to keep any database credentials out of source control.

## Why Is There A `Data` Folder?

Some static data is provided for the getting started examples during the workshop.

## Using Your Own mLab Connection

To use your own mLab database, change the connection string value for `MLAB_URL` in the `.env` file. Read the [mLab docs](http://docs.mlab.com/) to get started if you are unfamiliar with it.

## License

MIT
