# n8n-nodes-healthchecks-ping

An n8n community node that sends **start, success, fail and log pings** to [Healthchecks.io](https://healthchecks.io) (cloud or self-hosted). Built for the Automation Compliance Guide, usable in any workflow.

## What it does

- **Event:** Start (measures run time), Success, Fail, Log (adds a log entry without changing the status).
- **Check Slug:** the short name of the check. It is validated before the request (lowercase letters, digits, `-`, `_`).
- **Message:** optional text, sent as POST body and shown with the ping in Healthchecks (the first 100 kB are kept).
- **Options:** create the check on the first ping, a run ID (UUID) that pairs a start ping with its end ping, and "Add Result to Output".
- The data passes through unchanged, so the node can sit in the middle of a chain. With "Add Result to Output" every item gets a field `healthchecks` (`ok`, `status`, `event`, `slug`).
- Supports "Continue On Fail", so a failed ping never stops the workflow.

## Compared with an HTTP Request node

- The ping key lives in a credential (type "Healthchecks API", with a base URL for self-hosted instances), not in a URL inside the workflow.
- The ping key never appears in error messages, so it cannot leak into execution logs or alerts.
- Clear help texts for the common errors (404 no check with this slug, 409 the slug matches several checks, 429 too many pings).

Healthchecks allows 5 pings per minute and check, endpoints are `https://hc-ping.com/<ping-key>/<slug>` plus `/start`, `/fail`, `/log`.

## Build and install

```
npm install
npm run build
```

The build writes the compiled node to `dist/`. Install the package into the nodes folder of your n8n instance (for a Docker setup: `/home/node/.n8n/nodes`) and restart n8n. With n8n 2.x use `npm install <path-to-package> --legacy-peer-deps` there, because the install otherwise fails on the n8n peer dependency.

## Limits

A ping node is a **run log**, not a watchdog from outside. It notices failures inside a run and runs that start and never end. It cannot notice that n8n itself is down.
