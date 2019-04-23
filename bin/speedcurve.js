#!/usr/bin/env node
const yargs = require("yargs")
const log = require("../src/log")
const api = require("../src/api")

const opts = yargs
  .command("deploy", "Create a deploy and trigger testing for one or more sites", {
    note: {
      describe: "Short note for this deploy",
      type: "string"
    },
    detail: {
      describe: "Longer expanded detail for this deploy",
      type: "string"
    },
    site: {
      describe: "Only trigger deploys for the specified site ID(s) or name(s)",
      type: "array",
      default: []
    },
    wait: {
      describe: "Wait for deploys to finish before exiting",
      type: "boolean",
      default: false
    }
  })
  .command("tests", "Get the latest synthetic test data for one or more URLs in a site", {
    site: {
      describe: "Get test data for the specified site ID or name",
      type: "string",
      demandOption: true
    },
    url: {
      describe: "Only get test data for the specific URL ID(s) or name(s)",
      type: "array",
      default: []
    },
    days: {
      describe: "How many days worth of test data to get",
      type: "number",
      default: 1
    },
    region: {
      describe: "Only get tests from the specified region",
      type: "string"
    },
    browser: {
      describe: "Only get tests from the specified browser",
      type: "string"
    }
  })
  .command("list-sites", "List all of the sites in an account", {
    json: {
      describe: "Display results as JSON",
      type: "boolean",
      default: false
    }
  })
  .options({
    key: {
      describe:
        "SpeedCurve API key. Can also be specified in the SPEEDCURVE_API_KEY environment variable"
    },
    api: {
      coerce: str => {
        try {
          return new URL(str).toString()
        } catch (e) {
          log.error("Invalid URL supplied to --api")
          process.exit(400)
        }
      },
      default: "https://api.speedcurve.com/",
      describe: "Set the SpeedCurve API endpoint",
      hidden: true
    },
    quiet: {
      describe: "Quiet mode. Only report errors",
      type: "boolean"
    },
    verbose: {
      alias: "v",
      describe: "Show verbose output",
      type: "boolean"
    }
  })
  .help()
  .version().argv

api.base = opts.api
log.level = opts.verbose ? "verbose" : opts.quiet ? "error" : "warn"
opts.key = opts.key ? opts.key : process.env.SPEEDCURVE_API_KEY

if (!opts.key) {
  log.error(
    `No API key was given. Please specify an API key in the SPEEDCURVE_API_KEY environment variable.`
  )
  process.exit(400)
}

if (!opts._.length) {
  yargs.showHelp()
  process.exit(400)
}

const command = (() => {
  switch (opts._[0]) {
    case "deploy":
      return require("../src/command/deploy")
    case "tests":
      return require("../src/command/tests")
    case "list-sites":
      return require("../src/command/list-sites")
    default:
      yargs.showHelp()
      process.exit(400)
  }
})()

try {
  command(opts)
} catch (e) {
  log.error(e)
  process.exit(500)
}
