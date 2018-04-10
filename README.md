# iota-pow-benchmark

IOTA POW Benchmarking for IRI API endpoints for attachToTangle performance (proof of work)

This is a command line app only right now

## Usage

```
  Usage: benchmark [options]

  Options:

    -V, --version                       output the version number
    -b, --broadcast                     Broadcast transactions
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

## Examples

Run a benchmark on a local POW server (for instance, running [iota-gpu-pow](https://github.com/gagathos/iota-gpu-pow)), do 60 bundles of 1 transaction each, one at a time
```
node benchmark.js --iri-host=https://field.carriota.com --iri-port=443 -h http://localhost -p 80 -d 60 -M 1 -c 1 -b
```

## Caveats

This is still under development. We are obviously missing some metrics and also would like to develop some standard benchmarks that make sense for rating how an API endpoint would perform in real-world scenarios.
