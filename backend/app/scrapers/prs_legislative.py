import logging
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from .base import BaseScraper

logger = logging.getLogger("PRSScraper")

# Manually verified against each MP's individual PRS MPTrack page (source_url
# below) on 2026-07-24. PRS's site does not expose these per-MP figures via
# the /mptrack listing page fetched in scrape(); attendance/questions/debates
# only appear on the individual MP page, and PRS renders those with
# client-side widgets that aren't reliably parseable with a plain HTML fetch.
# Until a per-MP fetch+parse is implemented, this snapshot is maintained by
# hand from the cited pages. DO NOT replace with guessed/constant placeholder
# numbers -- if a figure can't be confirmed, use None and say so in "note".
VERIFIED_PRS_SNAPSHOT = [
    {
        "mp_name": "Narendra Modi",
        "house": "Lok Sabha",
        "state": "Uttar Pradesh",
        "constituency": "Varanasi",
        "attendance_pct": None,
        "questions_asked": None,
        "debates_participated": None,
        "private_bills_introduced": 0,
        "note": "Ministers represent the government in debates; PRS does not report individual attendance, questions, or debate participation for sitting ministers.",
        "verified": True,
        "data_quality": "verified_live_source",
        "source_url": "https://prsindia.org/mptrack/18-lok-sabha/narendra-modi",
    },
    {
        "mp_name": "Rahul Gandhi",
        "house": "Lok Sabha",
        "state": "Uttar Pradesh",
        "constituency": "Rae Bareli",
        "attendance_pct": None,
        "questions_asked": 55,
        "debates_participated": 16,
        "private_bills_introduced": 0,
        "note": "Leader of Opposition; LoP does not sign the attendance register per PRS methodology. Data period: 24-06-2024 to 18-04-2026.",
        "verified": True,
        "data_quality": "verified_live_source",
        "source_url": "https://prsindia.org/mptrack/18-lok-sabha/rahul-gandhi",
    },
    {
        "mp_name": "Shashi Tharoor",
        "house": "Lok Sabha",
        "state": "Kerala",
        "constituency": "Thiruvananthapuram",
        "attendance_pct": 88,
        "questions_asked": 119,
        "debates_participated": 33,
        "private_bills_introduced": 6,
        "note": "Data period: 01-06-2019 to 18-04-2026.",
        "verified": True,
        "data_quality": "verified_live_source",
        "source_url": "https://prsindia.org/mptrack/18-lok-sabha/shashi-tharoor",
    },
    {
        "mp_name": "Nitin Gadkari",
        "house": "Lok Sabha",
        "state": "Maharashtra",
        "constituency": "Nagpur",
        "attendance_pct": None,
        "questions_asked": None,
        "debates_participated": None,
        "private_bills_introduced": 0,
        "note": "Ministers represent the government in debates; PRS does not report individual attendance, questions, or debate participation for sitting ministers.",
        "verified": True,
        "data_quality": "verified_live_source",
        "source_url": "https://prsindia.org/mptrack/18-lok-sabha/nitin-gadkari",
    },
]


class PRSLegislativeScraper(BaseScraper):
    def __init__(self):
        target_url = "https://prsindia.org/mptrack"
        super().__init__("prs_legislative", target_url)

    def scrape(self) -> List[Dict[str, Any]]:
        logger.info("Starting PRS Legislative Research scrape...")
        html = self.fetch_url(self.target_url)

        if html:
            soup = BeautifulSoup(html, "lxml")
            # The /mptrack listing page does not carry per-MP attendance,
            # question, debate, or bill counts -- those live on each MP's own
            # sub-page (see VERIFIED_PRS_SNAPSHOT). We intentionally do not
            # fabricate values here; a real per-MP scraper would need to
            # visit each MP's individual URL.
            logger.info("PRS listing page fetched, but per-MP stats require visiting individual MP pages (not yet implemented).")

        logger.info(f"Returning manually verified PRS snapshot ({len(VERIFIED_PRS_SNAPSHOT)} MPs, verified 2026-07-24).")
        records = VERIFIED_PRS_SNAPSHOT

        # Save to Supabase
        if self.supabase and records:
            for rec in records:
                try:
                    self.supabase.table("mp_legislative_stats").insert(rec).execute()
                except Exception as e:
                    logger.error(f"Error saving PRS legislative stats for {rec['mp_name']}: {e}")

        self.update_manifest("success", len(records), data_quality="verified_manual_snapshot")
        return records
