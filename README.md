# vote-transaction-cli
Internal Netvote CLI for viewing and rerunning vote transactions

```
# print all transactions
node index.js 2c6c8b2-06b0-423a-b93a-1977990bec1a

# print all pending transactions
node index.js --status pending d2c6c8b2-06b0-423a-b93a-1977990bec1a

# print all complete transactions
node index.js --status complete d2c6c8b2-06b0-423a-b93a-1977990bec1a

# print all error transactions
node index.js --status error d2c6c8b2-06b0-423a-b93a-1977990bec1a

# re-run all pending transactions
node index.js --rerun --status pending d2c6c8b2-06b0-423a-b93a-1977990bec1a

# re-run all pending and error transactions
node index.js --rerun d2c6c8b2-06b0-423a-b93a-1977990bec1a
```
