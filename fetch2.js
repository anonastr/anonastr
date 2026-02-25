fetch("https://api.web3modal.com/getWallets?projectId=cc3b17726de4636f1ac1ece93616fb36&search=okx").then(r => console.log(r.status)).catch(console.error)
fetch("https://explorer-api.walletconnect.com/v3/wallets?projectId=cc3b17726de4636f1ac1ece93616fb36").then(r => console.log(r.status))
