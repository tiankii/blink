
const privateGetPositionsResponse = {result: 
  [{
    collateralUsed: 0.328866663378,
    cost: -0.9872,
    entryPrice: 9872,
    estimatedLiquidationPrice: 0,
    future: 'BTC-PERP',
    initialMarginRequirement: 0.33333333,
    longOrderSize: 0,
    maintenanceMarginRequirement: 0.03,
    netSize: -0.0001,
    openSize: 0.0001,
    realizedPnl: -0.01195,
    shortOrderSize: 0,
    side: 'sell',
    size: 0.0001,
    unrealizedPnl: 0.0006
}]}

const createMarketBuyOrderError = {error: "Size too small", success: false}


const fetchOrderResponse = {
  result: {
    info: {
      avgFillPrice: 9892.5,
      clientId: null,
      createdAt: '2020-06-23T00:00:58.777148+00:00',
      filledSize: 0.0001,
      future: 'BTC-PERP',
      id: 6103637365,
      ioc: true,
      liquidation: false,
      market: 'BTC-PERP',
      postOnly: false,
      price: null,
      reduceOnly: false,
      remainingSize: 0,
      side: 'buy',
      size: 0.0001,
      status: 'closed',
      type: 'market'
    },
    id: '6103637365',
    clientOrderId: undefined,
    timestamp: 1592870458777,
    datetime: '2020-06-23T00:00:58.777Z',
    lastTradeTimestamp: undefined,
    symbol: 'BTC-PERP',
    type: 'market',
    side: 'buy',
    price: 9892.5,
    amount: 0.0001,
    cost: 0.9892500000000001,
    average: 9892.5,
    filled: 0.0001,
    remaining: 0,
    status: 'closed',
    fee: undefined,
    trades: undefined
  }
}

const createMarketBuyOrderResponse = { result: {
  info: {
    avgFillPrice: null,
    clientId: null,
    createdAt: '2020-06-23T00:00:58.777148+00:00',
    filledSize: 0,
    future: 'BTC-PERP',
    id: 6103637365,
    ioc: true,
    liquidation: false,
    market: 'BTC-PERP',
    postOnly: false,
    price: null,
    reduceOnly: false,
    remainingSize: 0.0001,
    side: 'buy',
    size: 0.0001,
    status: 'new',
    type: 'market'
  },
  id: '6103637365',
  clientOrderId: undefined,
  timestamp: 1592870458777,
  datetime: '2020-06-23T00:00:58.777Z',
  lastTradeTimestamp: undefined,
  symbol: 'BTC-PERP',
  type: 'market',
  side: 'buy',
  price: undefined,
  amount: 0.0001,
  cost: undefined,
  average: undefined,
  filled: 0,
  remaining: 0.0001,
  status: 'open',
  fee: undefined,
  trades: undefined
}}


export class ftx {

  constructor() {}

  privateGetPositions() {
    return new Promise((resolve, reject) => {
      resolve(privateGetPositionsResponse)
    })
  }

  fetchOrder() {
    return new Promise((resolve, reject) => {
      resolve(createMarketBuyOrderResponse)
    })
  }

  createMarketBuyOrder(symbol, amount) {
    return new Promise((resolve, reject) => {
      if (amount >= 0.0001) {
        resolve(createMarketBuyOrderResponse)
      } else {
        reject(createMarketBuyOrderError)
      }
    })
  }
}



// merge split

const priceResponse = [
  [ 1595455200000, 9392.7, 9642.4, 9389.8, 9520.1, 2735.99917304 ],
  [ 1595458800000, 9523.2, 9557.8, 9523.2, 9557.7, 193.67510759 ],
  [
    1595462400000,
    9557.7,
    9560,
    9532.543735,
    9533.632496,
    153.55108745
  ],
  [ 1595466000000, 9533.9, 9547.5, 9524.4, 9547, 35.2271581 ],
  [ 1595469600000, 9544.8, 9551.9, 9525.9, 9528.67346509, 73.89652209 ],
  [ 1595473200000, 9528.67346509, 9528.8, 9499, 9520, 66.01617843 ],
  [ 1595476800000, 9521.1, 9521.4, 9512.5, 9521.4, 38.93224177 ],
  [ 1595480400000, 9521.4, 9521.4, 9491.6, 9515.1, 50.06497061 ],
  [ 1595484000000, 9515.1, 9524.5, 9512.9, 9522.37122605, 36.79139999 ],
  [ 1595487600000, 9522.4, 9535.11947864, 9520.7, 9522.9, 56.48531178 ],
  [ 1595491200000, 9522.7, 9554.6, 9512.6, 9543.9, 129.33571288 ],
  [ 1595494800000, 9543.4, 9543.9, 9518.7, 9528.1, 42.28475636 ],
  [ 1595498400000, 9528.1, 9538.9, 9517.9, 9518.2, 74.4279258 ],
  [ 1595502000000, 9518.2, 9534.4, 9513.6, 9531.9, 55.33630351 ],
  [ 1595505600000, 9531.9, 9533.27158144, 9511.5, 9515, 141.20326531 ],
  [ 1595509200000, 9515.01258682, 9520.7, 9511.1, 9520.7, 71.18293438 ],
  [ 1595512800000, 9520.7, 9612.47847642, 9475, 9513.6, 747.75786977 ],
  [
    1595516400000,
    9513.5397999,
    9550,
    9501.1,
    9549.86370793,
    102.35260218
  ],
  [
    1595520000000,
    9549.39875114,
    9644,
    9539.98337618,
    9642.1,
    406.53829462
  ],
  [
    1595523600000,
    9642.1,
    9685.43228684,
    9596.5,
    9623.23531914,
    1923.65931188
  ],
  [
    1595527200000,
    9623.23531914,
    9626.48231128,
    9580,
    9595.5,
    160.28741716
  ],
  [ 1595530800000, 9595.7, 9608.8, 9587.2, 9608.71945707, 52.3883769 ],
  [ 1595534400000, 9608.71945707, 9608.8, 9582.6, 9590.6, 79.62352906 ],
  [ 1595538000000, 9591.3, 9618.5, 9585.23211966, 9618.5, 65.22280458 ],
  [ 1595541600000, 9618.5, 9618.5, 9604.4, 9614, 97.54861275 ]
]

export class bitfinex {

  constructor() {}

  fetchOHLCV() {
    return new Promise((resolve, reject) => {
      resolve(priceResponse)
    })
  }

}