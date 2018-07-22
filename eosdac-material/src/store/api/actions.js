import Eos from 'eosjs'
import Timeout from 'await-timeout'
import configFile from '../../statics/config.json'

//dont knwo how to implement a latency timeout method that works with scatter
const tokenContractName = configFile.network.tokenContract.name

const eosConfig = {
  chainId: configFile.network.chainId,
  expireInSeconds: 60,
  broadcast: true,
  debug: false,
  sign: true
}

async function scatterNetwork(state) {
  let pp
  if (state.endpoints[state.activeEndpointIndex].httpEndpoint.split(':')[0].replace(/\//g, '') === 'https') {
    pp = 443
  } else if (state.endpoints[state.activeEndpointIndex].httpEndpoint.split(':')[0].replace(/\//g, '') === 'http') {
    pp = 80
  } else {
    pp = null
  }
  const network = await {
    blockchain: 'eos',
    protocol: state.endpoints[state.activeEndpointIndex].httpEndpoint.split(':')[0].replace(/\//g, ''),
    host: state.endpoints[state.activeEndpointIndex].httpEndpoint.split(':')[1].replace(/\//g, ''),
    port: state.endpoints[state.activeEndpointIndex].httpEndpoint.split(':')[2] || pp
  }
  return network
}

export async function memberreg({
  state,
  rootState
}, payload) {
  try {
    eosConfig.httpEndpoint = state.endpoints[state.activeEndpointIndex].httpEndpoint
    eosConfig.keyProvider = rootState.account.pkeysArray
    let eos = Eos(eosConfig)
    if (payload.scatter) {
      const network = await scatterNetwork(state)
      const identity = await state.scatter.getIdentity({
        accounts: [network]
      })
      eos = state.scatter.eos(network, Eos, eosConfig)
    }
    const contract = await eos.contract(tokenContractName)
    const res = await contract.memberreg(payload.data)
    return res
  } catch (error) {
    throw error
  }
}

export async function transfer({
  state,
  rootState
}, payload) {
  try {
    eosConfig.httpEndpoint = state.endpoints[state.activeEndpointIndex].httpEndpoint
    eosConfig.keyProvider = rootState.account.pkeysArray
    let eos = Eos(eosConfig)
    if (payload.scatter) {
      const network = await scatterNetwork(state)
      const identity = await state.scatter.getIdentity({
        accounts: [network]
      })
      eos = state.scatter.eos(network, Eos, eosConfig)
    }
    const contract = await eos.contract(tokenContractName)
    const res = await contract.transfer(payload.data)
    return res
  } catch (error) {
    throw error
  }
}

export async function transferMain({
  state,
  rootState
}, payload) {

  try {
    eosConfig.httpEndpoint = state.endpoints[state.activeEndpointIndex].httpEndpoint
    eosConfig.keyProvider = rootState.account.pkeysArray
    let eos = Eos(eosConfig)
    if (payload.scatter) {
      const network = await scatterNetwork(state)
      const identity = await state.scatter.getIdentity({
        accounts: [network]
      })
      eos = state.scatter.eos(network, Eos, eosConfig)
    }
    const res = await eos.transfer(payload.data)
    return res
  } catch (error) {
    throw error
  }
}

function timeOut(time) {
  return new Promise(function(resolve, reject) {
    setTimeout(reject('timeout'), time)
  })
}

export async function pingCurrentEndpoint({
  state,
  commit
}) {
  const timeout = new Timeout()
  try {
    eosConfig.httpEndpoint = state.endpoints[state.activeEndpointIndex].httpEndpoint
    const eos = Eos(eosConfig)
    const sTime = Date.now()
    const timer = timeout.set(state.connectionTimeoutMilSec, 'timeout')
    const ginfo = eos.getInfo({})
    const info = await Promise.race([ginfo, timer])
    const ping = Math.floor((Date.now() - sTime) / 1000)
    const utcD = new Date().toISOString().slice(0, -5)
    if (info.chain_id !== configFile.network.chainId) {
      throw Error('Wrong chainId')
    }
    if (new Date(info.head_block_time).getTime() + 10000 > new Date(utcD).getTime()) {
      commit('PING_ENDPOINT_SUCCESS', {
        getInfo: info,
        ping: ping
      })
    } else {
      commit('PING_ENDPOINT_STUCK', {
        getInfo: info,
        ping: ping
      })
    }
    return info
  } catch (error) {
    clearTimeout(timeout)
    commit('PING_ENDPOINT_FAIL')
    throw error
  } finally {
    timeout.clear()
  }
}

export async function testEndpoint({
  state,
  commit
}, url) {
  const timeout = new Timeout()
  try {
    eosConfig.httpEndpoint = url
    const eos = Eos(eosConfig)
    const sTime = Date.now()
    const timer = timeout.set(state.connectionTimeoutMilSec, 'timeout')
    const ginfo = eos.getInfo({})
    const info = await Promise.race([ginfo, timer])
    if (info.chain_id !== configFile.network.chainId) {
      throw Error('Wrong chainId')
    }
    return info
  } catch (error) {
    throw error
  } finally {
    timeout.clear()
  }
}

export async function getRegistered({
  state
}, payload) {
  try {
    eosConfig.httpEndpoint = state.endpoints[state.activeEndpointIndex].httpEndpoint
    let eos = Eos(eosConfig)
    const members = await eos.getTableRows({
      json: true,
      scope: configFile.network.tokenContract.name,
      code: configFile.network.tokenContract.name,
      table: 'members'
    })
    return members
  } catch (error) {
    throw error
  }
}

export async function getContractRicardian({
  state,
  commit
}, payload) {
  try {
    eosConfig.httpEndpoint = state.endpoints[state.activeEndpointIndex].httpEndpoint
    let eos = Eos(eosConfig)
    const contract = await eos.contract(payload)
    let ricardian = contract.fc.abi.actions
    commit('ADD_CONTRACT_RICARDIAN', {
      ricardian: ricardian.actions,
      contract: payload
    })
    return ricardian
  } catch (error) {
    throw error
  }
}

export async function getTokenContractBalance({
  state,
  rootState,
  commit
}) {
  try {
    eosConfig.httpEndpoint = state.endpoints[state.activeEndpointIndex].httpEndpoint
    let eos = Eos(eosConfig)
    const balances = await eos.getCurrencyBalance(configFile.network.tokenContract.name, rootState.account.info.account_name, configFile.network.tokenContract.token)
    let balance
    if (balances[0]) {
      balance = parseFloat(balances[0])
    } else {
      balance = 0
    }
    commit('account/UPDATE_TOKEN_BALANCE', balance, {
      root: true
    })
    return balance
  } catch (error) {
    throw error
  }
}

export async function updateAccountInfo({
  state,
  rootState,
  commit
}) {
  try {
    eosConfig.httpEndpoint = state.endpoints[state.activeEndpointIndex].httpEndpoint
    let eos = Eos(eosConfig)
    const account = await eos.getAccount({
      account_name: rootState.account.info.account_name
    })
    commit('account/UPDATE_ACCOUNT_INFO', account, {
      root: true
    })
    return account
  } catch (error) {
    throw error
  }
}

export async function getAccount({
  state
}, payload) {
  try {
    eosConfig.httpEndpoint = state.endpoints[state.activeEndpointIndex].httpEndpoint
    let eos = Eos(eosConfig)
    const account = await eos.getAccount({
      account_name: payload.account_name
    })
    return account
  } catch (error) {
    throw error
  }
}
