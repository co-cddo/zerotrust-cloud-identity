module.exports = {
  default: [
    "--require-module ts-node/register",
    "--require step-definitions/**/*.steps.ts", // Include your step definitions
    "--format html:cucumber-report.html", // HTML report
    "--format json:cucumber-report.json", // JSON report
    "--format junit:cucumber-report.xml", // JUnit XML report
    "--exit",
  ].join(" "),
};
