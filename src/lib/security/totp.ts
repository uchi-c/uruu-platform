import { authenticator } from "otplib";

// otplib's default verification window is 0 (zero tolerance) — a code is only
// accepted in the exact 30-second step it was generated in. That rejects
// otherwise-correct codes any time normal human/network latency between
// reading a code and submitting it crosses a step boundary. Allow ±1 step,
// the standard RFC 6238 tolerance for clock skew and submission delay.
authenticator.options = { window: 1 };

export { authenticator };
