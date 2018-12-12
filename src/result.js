module.exports = class Result {
  constructor(siteId, account) {
    this.siteId = siteId
    this.accountName = account.name
    this.key = account.key
    this.deployId = null
    this.tests = []
    this.completedTests = []
  }

  static countTests(resultsCollection) {
    return resultsCollection.reduce((sum, result) => sum + result.tests.length, 0)
  }

  static countCompletedTests(resultsCollection) {
    return resultsCollection.reduce((sum, result) => sum + result.completedTests.length, 0)
  }

  updateFromApiResponse(res) {
    this.deployId = res.deploy_id

    if (typeof res.info["tests-added"] !== "undefined") {
      this.tests = res.info["tests-added"]
    }

    if (typeof res.info["tests-completed"] !== "undefined") {
      this.completedTests = res.info["tests-completed"]
    }
  }
}