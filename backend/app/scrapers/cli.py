import argparse
import sys
import logging
from .myneta_mps import MyNetaMPScraper
from .prs_legislative import PRSLegislativeScraper
from .aob_rules_parser import AoBRulesParser
from .ias_civil_list import IASCivilListScraper
from .entity_matcher import EntityMatcher
from .mlalad_gujarat import MLALADGujaratScraper
from .njdg_judicial import NJDGJudicialScraper

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("DataSourcingCLI")

def run_scrapers(target: str):
    logger.info(f"========== Data Sourcing Execution Started [Target: {target}] ==========")

    results = {}

    if target in ["all", "myneta"]:
        logger.info("--> Executing MyNeta MP Scraper...")
        myneta = MyNetaMPScraper()
        results["myneta"] = myneta.scrape()

    if target in ["all", "prs"]:
        logger.info("--> Executing PRS Legislative Performance Scraper...")
        prs = PRSLegislativeScraper()
        results["prs"] = prs.scrape()

    if target in ["all", "aob"]:
        logger.info("--> Executing Allocation of Business Rules Parser...")
        aob = AoBRulesParser()
        results["aob"] = aob.parse()

    if target in ["all", "ias"]:
        logger.info("--> Executing DoPT IAS e-Civil List Scraper...")
        ias = IASCivilListScraper()
        results["ias"] = ias.scrape()

    if target in ["all", "match"]:
        logger.info("--> Executing Entity Resolution & Alias Matcher...")
        matcher = EntityMatcher()
        results["match"] = matcher.run_matching()

    if target in ["all", "mlalad"]:
        logger.info("--> Executing Gujarat MLALAD State Pilot Scraper...")
        mlalad = MLALADGujaratScraper()
        results["mlalad"] = mlalad.scrape()

    if target in ["all", "njdg"]:
        logger.info("--> Executing NJDG Judicial Aggregates Scraper...")
        njdg = NJDGJudicialScraper()
        results["njdg"] = njdg.scrape()

    logger.info("========== Data Sourcing Execution Summary ==========")
    for key, data in results.items():
        count = len(data) if isinstance(data, list) else data
        logger.info(f"Target '{key}': {count} records processed successfully.")

    return results

def main():
    parser = argparse.ArgumentParser(description="PrajaNeeti Data Sourcing Pipeline CLI")
    parser.add_argument("--target", type=str, default="all", choices=["all", "myneta", "prs", "aob", "ias", "match", "mlalad", "njdg"], help="Scraper target module to run")
    parser.add_argument("--test", action="store_true", help="Run quick diagnostic test")

    args = parser.parse_args()

    if args.test:
        logger.info("Running diagnostic test import check for all scrapers...")
        print("Scraper modules successfully compiled and loaded.")
        sys.exit(0)

    run_scrapers(args.target)

if __name__ == "__main__":
    main()
