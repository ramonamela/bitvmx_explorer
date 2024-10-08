import { useNetworkStore } from '../stores/network' // Import the network store

let fetchTransactionDataAPI
let fetchAddressDataAPI
let fetchTransactionURLAPI

const networkStore = useNetworkStore() // Create an instance of the network store
const currentNetwork = networkStore.networkId // Access the networkId from the store

const loadNetworkFunctions = async (networkId) => {
  if (networkId === 'mainnet') {
    // Import mainnet functions
    const mainnet = await import('./networkTransactions/mainnet')
    fetchTransactionDataAPI = mainnet.fetchTransactionData
    fetchAddressDataAPI = mainnet.fetchAddressData
    fetchTransactionURLAPI = mainnet.fetchTransactionURL
  } else if (networkId === 'testnet') {
    // Import testnet functions
    const testnet = await import('./networkTransactions/testnet')
    fetchTransactionDataAPI = testnet.fetchTransactionData
    fetchAddressDataAPI = testnet.fetchAddressData
    fetchTransactionURLAPI = testnet.fetchTransactionURL
  } else {
    // Import mutinynet functions
    const mutinynet = await import('./networkTransactions/mutinynet')
    fetchTransactionDataAPI = mutinynet.fetchTransactionData
    fetchAddressDataAPI = mutinynet.fetchAddressData
    fetchTransactionURLAPI = mutinynet.fetchTransactionURL
  }
}

export const fetchTransactionData = async (txid) => {
  // Call the appropriate network implementation
  return fetchTransactionDataAPI(txid)
}

export const fetchAddressData = async (txid, address) => {
  // Call the appropriate network implementation
  return fetchAddressDataAPI(txid, address)
}

export const fetchTransactionURL = (txid) => {
  return fetchTransactionURLAPI(txid)
}

export const fetchProtocolData = async (txid) => {
  let newTransaction = await fetchTransactionData(txid)
  let initialArray = [newTransaction]
  while (newTransaction.vin[0].prevout.scriptpubkey_type === 'v1_p2tr') {
    newTransaction = await fetchTransactionData(newTransaction.vin[0].txid)
    initialArray.unshift(newTransaction)
  }
  newTransaction = initialArray[initialArray.length - 1]
  while (newTransaction && newTransaction.vout[0].scriptpubkey_type === 'v1_p2tr') {
    newTransaction = await fetchAddressData(
      newTransaction.txid,
      newTransaction.vout[0].scriptpubkey_address
    )
    if (newTransaction) {
      initialArray.push(newTransaction)
    }
  }
  return initialArray
}

export const updateNetwork = async (newNetworkId) => {
  await loadNetworkFunctions(newNetworkId)
  console.log(`Network functions updated for ${newNetworkId}`)
}
