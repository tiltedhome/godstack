# Security Policy

Godstack is a static site: one HTML file with no server, no accounts and no data collection. The places a real vulnerability could live are the page's own script, the build and its dependencies, and the GitHub Actions workflows.

## Reporting a vulnerability

Please **do not** open a pull request, discussion or public comment for a security issue.

Report it privately through GitHub instead: go to the **Security** tab of this repository and choose **Report a vulnerability**. Include what you found, how to reproduce it, and what you think the impact is.

You can expect an acknowledgement within a few days. Once it's fixed, we're happy to credit you in the advisory if you'd like.

## Supported versions

Only the current `main` branch, which is what https://tiltedhome.github.io/godstack/ serves, receives fixes.
