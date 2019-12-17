### smlygift

This program allows twitter users to tip each other using the SmileyCoin cryptocurrency protocol. The bot responds automatically to mentions and direct messages so depositing to your account address is the only thing that happens outside of Twitter.

#### tipping

Tipping is fairly straigth forward. All you need to do is @mention the users you plan to tip and specify an amount. The bot will take care of setting up an address, in case the user has not yet done so, and making the transactions.

Example:

```
@smlygift @smlycoin @smlybot tip: 20!
```

As you can see tipping multiple users at once is easy, the bot will send each of the mentioned users the amount specified.

Notice that the format of `tip: 20!` is required. The bot matches to op and uses the exlamation point as a delimiter.

#### direct messaging

Currently the bot supports 5 operations in the chat

- `address: {your desired return address}!`
  > Sets or updates the return address on your account. This is the address the funds will be sent to in case you do withdraw
- `withdraw!`
  > Sends the smly in your balance to your return address.
- `delete!`
  > Deletes your account, after withdrawing the funds to your return address
- `balance!`
  > Sends you information about your balance, amount and its current address
- `help!`
  > Sends you roughly this message

Some behaviour hasn't quite been defined. I've still got to work out what should happen when withdrawing/deleting without a return address. Assume funds will be lost for now.

### Project Information

The project is written in Typescript using NodeJS and making extensive use of the Twitter-Autohook library. ORM is handled through Sequelize.

#### Running

Start by running

```
git clone {this repo}
cd smlygift
yarn install
```

Then set up your `.env` file following the example

When yarn is finished you can run the project using these scripts

- `yarn build`: this will compile our Typescript code into ES5 and place it in the dist folder.
- `yarn start`: will run the compiled es5, for production use mostly.
- `yarn dev`: will run ts-node and watch for changes.
- `yarn test`: will run Jest in watch mode. (no test coverage yet)

_This has only been tested on an Ubuntu 18 machine, YMMV_

#### Structure

The project is split into 3 main sections

- `bot_actions`: the main purpose of the bot is realized here
- `twitter`: interaction with the twitter api, both for the webhooks as well as rest endpoints
- `smiley`: wrappers around the smileycoin-cli.
- `db`: very small database setup. Only a single table to store the accounts

#### Requirements and dependencies

- Yarn ~1.21.1
- NodeJS ~12.5.0
- The smileycoin wallet
- A twitter developer account and an app with the relevant keys and permissions
- PostgreSQL 10.10

> Author: Gunnar Ingi Stefánsson gis20@hi.is
