"""
concern_clustering.py
─────────────────────
Periodic background job that groups pending citizen concerns using an LLM.

Usage:
    python -m backend.app.jobs.concern_clustering
    — or —
    python backend/app/jobs/concern_clustering.py

Schedule via cron (example — run every 6 hours):
    0 */6 * * * /path/to/venv/bin/python /path/to/concern_clustering.py

Environment variables required:
    SUPABASE_URL        — Supabase project URL
    SUPABASE_SERVICE_KEY — Supabase service-role key (bypasses RLS)
    OPENAI_API_KEY      — OpenAI API key
"""

import json
import logging
import os
import sys
from typing import Any

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("concern_clustering")


# ── Environment ───────────────────────────────────────────────────────────────

def _require_env(name: str) -> str:
    """Return the value of an environment variable or exit with an error."""
    value = os.environ.get(name)
    if not value:
        logger.error("Missing required environment variable: %s", name)
        sys.exit(1)
    return value


# ── OpenAI client helper ──────────────────────────────────────────────────────

def _call_openai_chat(
    api_key: str,
    system_prompt: str,
    user_message: str,
    model: str = "gpt-4o",
) -> dict[str, Any]:
    """
    Calls the OpenAI Chat Completions API and returns the parsed JSON response.

    The LLM is instructed to return a JSON object so `response_format` is set
    to `{"type": "json_object"}` (supported by gpt-4o and gpt-4-turbo).

    Raises:
        RuntimeError: on API errors or JSON decode failures.
    """
    import urllib.request

    payload = {
        "model": model,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.2,  # low temp for deterministic JSON output
    }

    req = urllib.request.Request(
        url="https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"OpenAI API request failed: {exc}") from exc

    try:
        content_str: str = body["choices"][0]["message"]["content"]
        return json.loads(content_str)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            f"Failed to parse OpenAI response: {exc}\nRaw body: {body}"
        ) from exc


# ── LLM system prompt ─────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are a civic analysis assistant for PrajaNeeti (MakeGovAccountable), a
non-partisan Indian government accountability platform.

You will receive a JSON array of citizen concerns in the format:
  [{"id": "<uuid>", "content": "<concern text>"}, ...]

Your task:
1. Identify 1–10 meaningful thematic groups across the batch. Each group must
   represent a distinct, concrete civic issue (e.g., road infrastructure,
   water supply, judicial delays, agricultural subsidies).

2. For each group:
   a. Write a concise `title` (≤10 words, title case).
   b. Write a factual `description` (2–4 sentences) summarising the common
      problem and its civic significance.
   c. List all `concern_ids` (UUIDs) from the input that belong to this group.
      A concern may belong to only ONE group (the best-fit group).
   d. If a concern contains inflammatory, personally abusive, or legally
      problematic language, still include it in the group but add a
      `contains_inflammatory_language: true` flag on the concern entry.
      Do NOT redact or modify the original text; only flag it.

3. Return ONLY valid JSON in exactly this schema (no markdown, no prose):
{
  "groups": [
    {
      "title": "string",
      "description": "string",
      "concern_ids": ["uuid", ...]
    }
  ]
}

Important rules:
- Do not invent concern_ids. Only use UUIDs from the input.
- Do not add political bias. Remain strictly factual.
- If the batch is too small or too heterogeneous to form meaningful groups,
  return {"groups": []} rather than forcing artificial clusters.
- Respond with JSON ONLY.
"""


# ── Core job ──────────────────────────────────────────────────────────────────

def group_concerns() -> None:
    """
    Main job function:

    1. Loads environment variables.
    2. Fetches all concerns with status='pending' from Supabase.
    3. If none found, exits early.
    4. Sends the batch to GPT-4o for theme extraction.
    5. For each suggested group:
       a. Inserts a row into `concern_groups` with status='suggested'.
       b. Inserts rows into `concern_entity_links` mapping each concern_id
          to the group (entity_type='concern_group').
    6. Does NOT change concern status — manual moderator review required.
    """
    # ── Load env ──────────────────────────────────────────────────────────
    try:
        from dotenv import load_dotenv  # optional — won't fail if absent
        load_dotenv()
    except ImportError:
        pass

    supabase_url = _require_env("SUPABASE_URL")
    supabase_service_key = _require_env("SUPABASE_SERVICE_KEY")
    openai_api_key = _require_env("OPENAI_API_KEY")

    # ── Connect to Supabase ───────────────────────────────────────────────
    try:
        from supabase import create_client, Client  # type: ignore[import]
    except ImportError as exc:
        logger.error("supabase-py is not installed. Run: pip install supabase")
        raise SystemExit(1) from exc

    logger.info("Connecting to Supabase: %s", supabase_url)
    client: Client = create_client(supabase_url, supabase_service_key)

    # ── Fetch pending concerns ─────────────────────────────────────────────
    logger.info("Fetching pending concerns…")
    response = (
        client.table("concerns")
        .select("id, content")
        .eq("status", "pending")
        .execute()
    )

    concerns: list[dict[str, str]] = response.data or []

    if not concerns:
        logger.info("No pending concerns found. Exiting early.")
        return

    logger.info("Found %d pending concerns.", len(concerns))

    # Safety: trim content to avoid token overruns (keep first 500 chars each)
    trimmed_concerns = [
        {"id": c["id"], "content": c["content"][:500]}
        for c in concerns
    ]

    # ── Call LLM ──────────────────────────────────────────────────────────
    logger.info("Calling OpenAI (gpt-4o) for theme extraction…")
    user_message = json.dumps(trimmed_concerns, ensure_ascii=False)

    try:
        llm_result = _call_openai_chat(
            api_key=openai_api_key,
            system_prompt=SYSTEM_PROMPT,
            user_message=user_message,
            model="gpt-4o",
        )
    except RuntimeError as exc:
        logger.error("LLM call failed: %s", exc)
        return

    groups: list[dict] = llm_result.get("groups", [])

    if not groups:
        logger.info("LLM returned no groups — batch too small or too diverse.")
        return

    logger.info("LLM suggested %d concern groups.", len(groups))

    # ── Persist groups ────────────────────────────────────────────────────
    inserted = 0
    skipped = 0

    for group in groups:
        title: str = (group.get("title") or "").strip()
        description: str = (group.get("description") or "").strip()
        concern_ids: list[str] = group.get("concern_ids") or []

        if not title or not concern_ids:
            logger.warning("Skipping malformed group: %s", group)
            skipped += 1
            continue

        # Insert concern_group with status='suggested'
        try:
            group_resp = (
                client.table("concern_groups")
                .insert(
                    {
                        "title": title,
                        "description": description,
                        "status": "suggested",
                    }
                )
                .select("id")
                .single()
                .execute()
            )
            group_id: str = group_resp.data["id"]
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to insert concern_group '%s': %s", title, exc)
            skipped += 1
            continue

        # Insert concern_entity_links for each concern_id in the group
        links = [
            {
                "concern_id": cid,
                "entity_type": "concern_group",
                "entity_id": group_id,
            }
            for cid in concern_ids
        ]

        try:
            client.table("concern_entity_links").insert(links).execute()
            logger.info(
                "Group '%s' (id=%s): linked %d concerns.",
                title,
                group_id,
                len(links),
            )
            inserted += 1
        except Exception as exc:  # noqa: BLE001
            logger.error(
                "Failed to insert concern_entity_links for group '%s': %s",
                title,
                exc,
            )
            skipped += 1

    logger.info(
        "Done. %d groups inserted, %d skipped. Concerns remain 'pending' for moderator review.",
        inserted,
        skipped,
    )


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    group_concerns()
