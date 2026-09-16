#!/usr/bin/env node
import { runCli } from './interfaces/cli.js';

runCli(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
