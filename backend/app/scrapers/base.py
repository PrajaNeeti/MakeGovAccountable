import os
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("BaseScraper")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "http://localhost:54321")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY") or ""
MANIFEST_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "sourcing", "metadata.json"))

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

class BaseScraper:
    def __init__(self, source_name: str, target_url: str):
        self.source_name = source_name
        self.target_url = target_url
        self.supabase = self._init_supabase()

    def _init_supabase(self):
        if not SUPABASE_KEY or not SUPABASE_URL:
            logger.warning("Supabase URL or Key not set. Direct database insertion will be skipped or mocked.")
            return None
        try:
            from supabase import create_client
            return create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            return None

    def fetch_url(self, url: str, method: str = "GET", data: Optional[Dict] = None, params: Optional[Dict] = None) -> Optional[str]:
        """Fetch URL content with standard browser headers."""
        try:
            with httpx.Client(headers=DEFAULT_HEADERS, timeout=30.0, follow_redirects=True, verify=False) as client:
                if method.upper() == "POST":
                    resp = client.post(url, data=data, params=params)
                else:
                    resp = client.get(url, params=params)
                resp.raise_for_status()
                return resp.text
        except Exception as e:
            logger.error(f"HTTP fetch failed for {url}: {e}")
            self.log_extraction_failure(url, str(e))
            return None

    def log_extraction_failure(self, url: str, error_message: str):
        """Record extraction error to Supabase extraction_logs table."""
        if not self.supabase:
            logger.info(f"[Mock Log Failure] URL: {url} | Error: {error_message}")
            return
        try:
            self.supabase.table("extraction_logs").insert({
                "source_url": url,
                "raw_content": f"ERROR: {error_message}",
                "status": "FAILED"
            }).execute()
        except Exception as e:
            logger.error(f"Failed to log extraction failure to Supabase: {e}")

    def update_manifest(self, status: str, records_count: int, error: Optional[str] = None):
        """Update manifest file data/sourcing/metadata.json."""
        if not os.path.exists(MANIFEST_PATH):
            logger.warning(f"Manifest path not found at {MANIFEST_PATH}")
            return

        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                manifest = json.load(f)

            manifest["updated_at"] = datetime.now(timezone.utc).isoformat()
            if "sources" not in manifest:
                manifest["sources"] = {}

            manifest["sources"][self.source_name] = {
                "name": self.source_name,
                "target_url": self.target_url,
                "status": status,
                "records_ingested": records_count,
                "last_run": datetime.now(timezone.utc).isoformat(),
                "error": error
            }

            with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2)
            logger.info(f"Manifest updated for {self.source_name}: {status} ({records_count} records)")
        except Exception as e:
            logger.error(f"Failed to update manifest: {e}")
