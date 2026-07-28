# Post-merge production checklist

Run **after** the Foundation branches land on `main` and Vercel has redeployed.
Disabling source maps in the build does not retract maps already published.

---

## 1. Current production JS carries no `sourceMappingURL`

```bash
JS=$(curl -s https://fightmetrics.app/ | grep -o '/assets/[^"]*\.js' | head -1)
echo "asset: $JS"
curl -s "https://fightmetrics.app$JS" | tail -c 400 | grep -o 'sourceMappingURL=.*' \
  && echo "FAIL — map reference still present" \
  || echo "PASS — no sourceMappingURL"
```

A trailing `//# sourceMappingURL=index-XXXX.js.map` means the deployed bundle is
still a map-emitting build.

## 2. The corresponding `.map` returns 404

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://fightmetrics.app${JS}.map"
```

Expect **404**. A 200 means the map is still being served — either the deploy
did not take, or a CDN edge is still holding the old artifact. Purge the Vercel
cache and re-check rather than assuming propagation.

## 3. Older deployments still hold the maps

**This is the part that is easy to miss.** Vercel keeps every previous deployment
addressable at its own immutable URL (`<project>-<hash>.vercel.app`). Each one
that was built with source maps still serves the complete `src/App.js` —
including the `MODEL` object and the v2 logistic coefficients — regardless of
what `main` now builds.

If model confidentiality matters:

- Vercel dashboard → Deployments → delete the historical deployments built
  before source maps were disabled, **or** enable Deployment Protection
  (Vercel Authentication / password) so preview and historical URLs require a
  login.
- Deleting the *current* production deployment is not required; deleting
  historical ones is what removes the exposure.
- Assume anything already public may have been retrieved. Rotate nothing here
  (no secrets are in the bundle), but do not treat prior exposure as undone.

## 4. Minification is not secrecy

Recording this so it is not quietly assumed later.

With maps off, the bundle is minified — identifiers mangled, whitespace gone.
That is **obfuscation, not protection**. The `MODEL` object, every coefficient,
the sigmoid parameters (`a = 2.0, b = 0`), the bet-action gates
(`0.60 / 0.65 / 0.70`) and the sub-53 % NO READ threshold all remain present as
literal values in the shipped JavaScript. Anyone willing to spend an afternoon
in devtools can recover them. Minified client code is readable client code.

**If protecting the coefficients is a genuine requirement, the only real answer
is server-side inference:** the browser posts a matchup, the server returns
probabilities, and the weights never leave the server. That is a meaningful
architectural change — it means the model can no longer run offline, the app
gains a backend dependency and latency on every Simulator interaction, and
freeze-at-save has to be reconciled with a remote call.

It is **not** part of the Foundation plan. Natural earliest point is Stage 7,
when a backend exists for persistence anyway (Gate A → Supabase/Postgres) — the
same infrastructure could host a `/predict` endpoint. Worth deciding then, on
its merits, rather than bolting it on.

Until that decision is made, treat the model as **publicly readable** and let
that inform how much the exposure in §3 actually matters. If it does not matter,
say so explicitly and skip §3; the point is to choose, not to drift.
