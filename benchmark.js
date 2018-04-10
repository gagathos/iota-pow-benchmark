"use strict"

const IOTA = require('iota.lib.js')
const program = require('commander')
const columnify = require('columnify')
const generate = require('iota-generate-seed')
const semaphore = require('semaphore')


program
  .version('1.0.0')
  .option('-b, --broadcast', 'Broadcast transactions (for instance, to test Carriota Field nodes)', false)
  .option('-m, --mwm [mwm]', 'Minimum Weight Magnitude', 14)
  .option('-M, --max-bundle-size [maxbundles]', 'Maximum Bundle Size', 3)
  .option('-c, --concurrency [concurrency]', 'Max Concurrent Requests', 1)
  .option('-d, --depth [depth]', 'Number of times to repeat each test', 10)
  .option('-h, --host [host]', 'POW API Hostname', 'localhost')
  .option('-p, --port [port]', 'POW API Port #', 14265)
  .option('-iri-h, --iri-host [host]', 'IRI API Hostname', 'localhost')
  .option('-iri-p, --iri-port [port]', 'IRI API Port #', 14265)
  .parse(process.argv)
 
var tests = []
var running = 0
// in case they differ, we instantiate two different versions of API
const iota = new IOTA({host: program.iriHost, port: program.iriPort}) 
const pow = new IOTA({host: program.host, port: program.port})
const limiter = semaphore(program.concurrency)
// console.log(program)
runTests()


async function runTests(){
  let seed = generate()
  let address = await getAddress(seed, 1)
  let root = await getTransactionsToApprove(3)
  console.log(address)
  console.log(program.maxBundleSize + ' max bundles')
  for(var i = 1; i <= program.maxBundleSize; i++){
    console.log('generating '+ program.depth + ' bundles of '+ i +' transactions')
    for(var k = 0; k < program.depth; k++) {
      let transfers = createTransfer(address, i)
      running++
      prepareAndAttach(seed, transfers, root)
    }
  }
  setTimeout(checkForFinished, 1000)
}

async function checkForFinished(){
  if(running > 0){
    console.log(running + ' remaining')
    setTimeout(checkForFinished, 1000)
  } else {
    runReport()
  }
}

function runReport(){
  console.log('Totally done!')
  let bundleSummary = []
  let summary = {
    POWServer: program.host+':'+program.port,
    Depth: program.depth,
    maxBundleSize: program.maxBundleSize,
    publicTxns: program.broadcast ? 'yes' : 'no',
    minTime: 999999999999,
    maxTime: 0,
    totalTxns: 0,
    totalTime: 0
  }
  let times = []
  for(var i = 0; i < tests.length; i++){
    let test = tests[i]
    
    test.totalTime = test.endTime - test.startTime
    test.avgTime = test.totalTime / test.bundleSize
    for(var k = 0; k < test.bundleSize; k++) {
      times.push(test.avgTime)
    }
    summary.maxTime = Math.max(summary.maxTime, test.avgTime)
    summary.minTime = Math.min(summary.minTime, test.avgTime)
    summary.totalTxns += test.bundleSize
    summary.totalTime += test.totalTime
    tests[i] = test
  }
  times.sort()
  summary.medianTime = times[Math.floor(times.length/2)]
  summary.avgTime = summary.totalTime / summary.totalTxns
  let testColumns = columnify(tests, {
    columns: ['bundleSize', 'totalTime', 'avgTime']
  })
  console.log(testColumns + '\n')
  let summaryColumns = columnify(summary)
  console.log(summaryColumns)
  
}

async function prepareAndAttach(seed, transfer, root) {
  iota.api.prepareTransfers(seed, transfer, function(error, trytes){
    limiter.take(() => {
      let test = {
          startTime: Date.now(),
          bundleSize: transfer.length
      }
      pow.api.attachToTangle(root.trunk, root.branch, program.mwm, trytes, function(error, success){
        test.endTime = Date.now()
        if(error){
          console.log(error)
          test.error = error
        }
          console.log('Success!')
            if(program.broadcast && success){
              let attached = iota.utils.transactionObject(success[0])
              iota.api.broadcastTransactions(success, (error, success) => {
                  if(success){
                      console.log('POW successful and valid ' + attached.hash);
                      test.hash = attached.hash
                  } else {
                    test.error = error
                    console.log(error)
                  }
                  finalize(test)
                })
              } else {
                finalize(test)
              }
        })
      
      })
    })
}

function finalize(test) {
  limiter.leave()
  tests.push(test) // commit test to storage
  running-- //decrement running
}

/**
 * Quick promise function to grab a single address by index
 */

function getAddress(seed, index) {
    return new Promise((resolve, reject) => {
        iota.api.getNewAddress(seed, {index : index}, (error, success)=>{
            if(error){
              reject(error)
            } else {
              resolve(success)
            }
        })
    })
}

function getTransactionsToApprove(depth) {
  return new Promise((resolve, reject) => {
    iota.api.getTransactionsToApprove(depth, null, function(error, toApprove){
      if(error){
        reject(error)
      } else {
        resolve({trunk: toApprove.trunkTransaction, branch: toApprove.branchTransaction})
      }
    })
  })
}

/**
 * Create a transfer to send POW on
 */

function createTransfer(address, size) {
  let transfers = []
  for (var i=0; i < size; i++){
    let payload = {benchmark: 'https://github.com/gagathos/iota-pow-benchmark', seq: i, rand: Math.random()}
    let transfer = {
      address: address,
      value: 0,
      message: iota.utils.toTrytes(JSON.stringify(payload)),
      tag: 'BENCHMARK'
    }
    transfers.push(transfer)
  }
  return transfers
}