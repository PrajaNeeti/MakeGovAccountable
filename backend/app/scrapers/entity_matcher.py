import logging
from typing import List, Dict, Any, Optional
from thefuzz import fuzz, process
from .base import BaseScraper

logger = logging.getLogger("EntityMatcher")

class EntityMatcher(BaseScraper):
    def __init__(self):
        super().__init__("entity_matcher", "internal://entity-resolution")

    def resolve_department(self, raw_posting: str, canonical_departments: Dict[str, str]) -> Optional[str]:
        """
        Given a raw posting string (e.g. 'Secretary, Department for Promotion of Industry and Internal Trade'),
        find the best matching canonical department ID from a dictionary of {dept_name: dept_id}.
        """
        if not raw_posting or not canonical_departments:
            return None

        dept_names = list(canonical_departments.keys())
        best_match, score = process.extractOne(raw_posting, dept_names, scorer=fuzz.partial_ratio)

        if score >= 70:
            logger.info(f"Matched '{raw_posting}' -> '{best_match}' (score: {score})")
            return canonical_departments[best_match]
        return None

    def run_matching(self):
        logger.info("Starting Entity Resolution & Alias Linking pipeline...")

        if not self.supabase:
            logger.warning("Supabase client not available. Running dry-run entity resolution.")
            # Illustrative dry-run examples only (used when there's no DB to match
            # against) -- these are generic, well-known department name aliases,
            # not claims about any specific record, so flagged as placeholder for
            # consistency with the rest of the pipeline.
            sample_aliases = [
                {"alias_name": "Ministry of Home Affairs", "canonical_name": "Ministry of Home Affairs", "entity_type": "department", "similarity": 1.0, "is_placeholder": True},
                {"alias_name": "MHA India", "canonical_name": "Ministry of Home Affairs", "entity_type": "department", "similarity": 0.85, "is_placeholder": True},
                {"alias_name": "DPIIT", "canonical_name": "Ministry of Commerce and Industry", "entity_type": "department", "similarity": 0.90, "is_placeholder": True}
            ]
            self.update_manifest("success", len(sample_aliases), data_quality="placeholder")
            return sample_aliases

        try:
            # Fetch canonical departments
            deps_res = self.supabase.table("departments").select("id", "name").execute()
            canonical_deps = {row["name"]: row["id"] for row in deps_res.data} if deps_res.data else {}

            # Fetch IAS officers without department_id
            officers_res = self.supabase.table("ias_officers").select("id", "officer_name", "current_posting").is_("department_id", "null").execute()
            officers = officers_res.data if officers_res.data else []

            matched_count = 0
            for officer in officers:
                posting = officer.get("current_posting", "")
                dept_id = self.resolve_department(posting, canonical_deps)
                if dept_id:
                    self.supabase.table("ias_officers").update({"department_id": dept_id}).eq("id", officer["id"]).execute()

                    # Save alias mapping
                    self.supabase.table("entity_aliases").upsert({
                        "alias_name": posting,
                        "canonical_entity_id": dept_id,
                        "entity_type": "department",
                        "similarity_score": 0.85
                    }, on_conflict="alias_name").execute()
                    matched_count += 1

            self.update_manifest("success", matched_count)
            return matched_count
        except Exception as e:
            logger.error(f"Error executing Entity Matcher: {e}")
            self.update_manifest("failed", 0, str(e))
            return 0
