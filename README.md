# iota-pow-benchmark

IOTA POW Benchmarking for IRI API endpoints for attachToTangle performance (proof of work)

This is a command line app only right now

## Installation

Clone this repository, then run npm install in its directory

```
git clone https://github.com/gagathos/iota-pow-benchmark.git
cd iota-pow-benchmark
npm install
```

## Usage

```
  Usage: node benchmark.js [options]

  Options:

    -V, --version                       output the version number
    -b, --broadcast                     Broadcast transactions (default: transactions don't get sent to tangle)
    -f, --format [format]               Format (JSON, human) (default: human)
    -m, --mwm [mwm]                     Minimum Weight Magnitude (default: 14)
    -M, --max-bundle-size [maxbundles]  Maximum Bundle Size (default: 3)
    -c, --concurrency [concurrency]     Max Concurrent Requests (default: 1)
    -d, --depth [depth]                 Number of times to repeat each test (default: 10)
    -h, --host [host]                   POW API Hostname (default: localhost)
    -p, --port [port]                   POW API Port # (default: 14265)
    -iri-h, --iri-host [host]           IRI API Hostname (default: localhost)
    -iri-p, --iri-port [port]           IRI API Port # (default: 14265)
    -h, --help                          output usage information
```
## Results

```
POWServer     # Full address of the POW server
depth         # Depth (number of tests run per bundle size)                              
concurrency   # Maximum simultaneous tests                                 
maxBundleSize # Largest bundle size                                 
publicTxns    # Did we broadcast our txns?
address       # Address you can use to look up all the txns for this test (if you broadcasted them)
estTPS        # Estimated transactions/second of entire test              
minTime       # Quickest POW time (ms)                 
maxTime       # Slowest POW time (ms)            
totalTxns     # Total transactions created                              
totalTime     # Total cumulative time of all POW work (ms)           
testTime      # Overall test runtime from first POW request to completion (ms)                 
errors        # Number of unsuccessful POW attempts                                 
medianTime    # Median individual txn POW time (ms)                        
avgTime       # Average individual txn POW time (ms)
```
Note that times for multi-transaction bundles are calculated as an average as we can only measure the API call for the entire batch of transfers in a bundle.

## Examples

Run a benchmark on a local POW server (for instance, running [iota-gpu-pow](https://github.com/gagathos/iota-gpu-pow)), do 60 bundles of 1 transaction each, one at a time
```
node benchmark.js --iri-host=https://field.carriota.com --iri-port=443 -h http://localhost -p 80 -d 60 -M 1 -c 1 -b
```

## Caveats

This is still under development. We are obviously missing some metrics and also would like to develop some standard benchmarks that make sense for rating how an API endpoint would perform in real-world scenarios.

## Donate

Support my projects and make it more likely I will maintain these projects going forward:

**IOTA:** S9HPAJXIIPEGZ9AZBZALTDDDRGGBQEMWMCPRHELZFD9KHFFIMMOABFSAPT9OXTSQ9YAUSCTJUTWWXLGHCICGGWQUUB
