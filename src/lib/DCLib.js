import DCLib from 'dclib'
import * as messaging from 'dc-messaging'

export default new class DC {
  constructor () {
    this.lib      = DCLib
    this.chat     = messaging

    this.lib.on('ready', () => {
      window.Game = new DCLib.DApp({
        slug: 'dicetest_v42',
        contract: {
          address: '0x674f8b960d103ccbabc0b0201da0cd52b9f5d352',
          abi: JSON.parse('[{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"disputes","outputs":[{"name":"disputeSeed","type":"bytes32"},{"name":"disputeBet","type":"uint256"},{"name":"initiator","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"bytes32"},{"name":"_session","type":"uint256"},{"name":"_disputeBet","type":"uint256"},{"name":"_gameData","type":"uint256[]"},{"name":"_disputeSeed","type":"bytes32"},{"name":"_sign","type":"bytes"}],"name":"openDispute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_gameData","type":"uint256[]"},{"name":"_bet","type":"uint256"}],"name":"getProfit","outputs":[{"name":"_profit","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"playerWL","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"bytes32"},{"name":"_N","type":"bytes"},{"name":"_E","type":"bytes"},{"name":"_rsaSign","type":"bytes"}],"name":"resolveDispute","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"bytes32"},{"name":"_playerBalance","type":"uint256"},{"name":"_bankrollerBalance","type":"uint256"},{"name":"_totalBet","type":"uint256"},{"name":"_session","type":"uint256"},{"name":"_sign","type":"bytes"}],"name":"updateChannel","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"config","outputs":[{"name":"maxBet","type":"uint256"},{"name":"minBet","type":"uint256"},{"name":"gameDevReward","type":"uint8"},{"name":"bankrollReward","type":"uint8"},{"name":"platformReward","type":"uint8"},{"name":"refererReward","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"channels","outputs":[{"name":"state","type":"uint8"},{"name":"player","type":"address"},{"name":"bankroller","type":"address"},{"name":"playerBalance","type":"uint256"},{"name":"bankrollerBalance","type":"uint256"},{"name":"totalBet","type":"uint256"},{"name":"session","type":"uint256"},{"name":"endBlock","type":"uint256"},{"name":"RSAHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rsa","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_hash","type":"bytes32"},{"name":"signature","type":"bytes"}],"name":"recoverSigner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"_sigseed","type":"bytes"},{"name":"_min","type":"uint256"},{"name":"_max","type":"uint256"}],"name":"generateRnd","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"bytes32"},{"name":"_playerBalance","type":"uint256"},{"name":"_bankrollerBalance","type":"uint256"},{"name":"_totalBet","type":"uint256"},{"name":"_session","type":"uint256"},{"name":"_close","type":"bool"},{"name":"_sign","type":"bytes"}],"name":"closeByConsent","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_gameData","type":"uint256[]"},{"name":"_bet","type":"uint256"},{"name":"_sigseed","type":"bytes"}],"name":"game","outputs":[{"name":"_win","type":"bool"},{"name":"_amount","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"developer","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"safeTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"refContract","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"bytes32"},{"name":"_player","type":"address"},{"name":"_bankroller","type":"address"},{"name":"_playerBalance","type":"uint256"},{"name":"_bankrollerBalance","type":"uint256"},{"name":"_openingBlock","type":"uint256"},{"name":"_gameData","type":"uint256[]"},{"name":"_N","type":"bytes"},{"name":"_E","type":"bytes"},{"name":"_sign","type":"bytes"}],"name":"openChannel","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"gameWL","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"bytes32"}],"name":"closeByTime","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_gameData","type":"uint256[]"},{"name":"_bet","type":"uint256"}],"name":"checkGameData","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_token","type":"address"},{"name":"_ref","type":"address"},{"name":"_gameWL","type":"address"},{"name":"_playerWL","type":"address"},{"name":"_rsa","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"action","type":"string"},{"indexed":false,"name":"id","type":"bytes32"},{"indexed":false,"name":"playerBalance","type":"uint256"},{"indexed":false,"name":"bankrollerBalance","type":"uint256"},{"indexed":false,"name":"session","type":"uint256"}],"name":"logChannel","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"action","type":"string"},{"indexed":false,"name":"initiator","type":"address"},{"indexed":false,"name":"id","type":"bytes32"},{"indexed":false,"name":"session","type":"uint256"},{"indexed":false,"name":"seed","type":"bytes32"}],"name":"logDispute","type":"event"}]')
        },
        rules: {
          depositX:2
        }
      })
      this.Game = window.Game
    })
  }

  install (Vue) {
    Object.defineProperty(Vue.prototype, '$DC', { value: this })
  }

  async getBalance () {
    const bets = await this.lib.Eth.getBalances(this.lib.Account.get().openkey)
    if (bets) return bets
  }

  chatInit () {
    return new this.chat.RTC(this.lib.Account.get().openkey, `chatRoom__DICE`)
  }
}()
