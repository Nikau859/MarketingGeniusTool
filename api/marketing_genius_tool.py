from typing import List, Dict, Optional, Any
from urllib.parse import urlparse
import random
import re
from decimal import Decimal, DivisionByZero
import logging
import json
import os
from pathlib import Path
from functools import lru_cache
import time
from threading import Lock

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, calls_per_second: float = 1.0):
        self.calls_per_second = calls_per_second
        self.last_call_time = 0
        self.lock = Lock()

    def wait(self):
        with self.lock:
            current_time = time.time()
            time_since_last_call = current_time - self.last_call_time
            if time_since_last_call < 1.0 / self.calls_per_second:
                time.sleep(1.0 / self.calls_per_second - time_since_last_call)
            self.last_call_time = time.time()

class MarketingGeniusTool:
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the Marketing Genius Tool with optional configuration.
        
        Args:
            config_path: Path to configuration JSON file. If None, uses default config.
        """
        self.config = self._load_config(config_path)
        
        # Load configurations
        self.industry_map = self.config.get('industry_map', {})
        self.social_platforms = self.config.get('social_platforms', {})
        self.cta_list = self.config.get('cta_list', [])
        self.business_size_templates = self.config.get('business_size_templates', {})
        
        # Initialize rate limiter
        self.rate_limiter = RateLimiter(calls_per_second=2.0)  # 2 calls per second
        
        logger.info("Marketing Genius Tool initialized successfully")

    def _load_config(self, config_path: Optional[str]) -> Dict:
        """
        Load configuration from file or use defaults.
        
        Args:
            config_path: Path to configuration file
            
        Returns:
            Dict containing configuration
        """
        default_config = {
            "industry_map": {
                "skincare": {
                    "channels": ["Facebook", "Instagram"],
                    "age_range": (25, 40),
                    "interests": ["organic", "beauty"],
                    "strategy": "Focus on influencer partnerships and video demos."
                },
                "tech": {
                    "channels": ["Google", "LinkedIn"],
                    "age_range": (18, 45),
                    "interests": ["software", "gadgets"],
                    "strategy": "Leverage thought leadership and product webinars."
                },
                # ... other industries ...
            },
            "social_platforms": {
                "Facebook": {"max_length": 125, "hashtags": True},
                "Instagram": {"max_length": 150, "hashtags": True},
                "TikTok": {"max_length": 100, "hashtags": True},
                "LinkedIn": {"max_length": 600, "hashtags": False},
                "Twitter": {"max_length": 280, "hashtags": True},
                "Google": {"max_length": 90, "hashtags": False},
            },
            "cta_list": ["Buy Now", "Learn More", "Get Yours Today", "Sign Up", "Try Free", "Discover More"],
            "business_size_templates": {
                "small": "Focus on local marketing, social proof, and budget-friendly digital ads.",
                "medium": "Expand multi-channel campaigns with retargeting and email automation.",
                "large": "Invest in brand-building, influencer partnerships, and advanced analytics."
            }
        }

        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    user_config = json.load(f)
                    # Merge user config with defaults
                    default_config.update(user_config)
                logger.info(f"Loaded configuration from {config_path}")
            except Exception as e:
                logger.error(f"Error loading configuration: {e}")
                logger.info("Using default configuration")
        else:
            logger.info("No configuration file provided, using defaults")

        return default_config

    @lru_cache(maxsize=1000)
    def parse_url_keywords(self, url: str) -> List[str]:
        """
        Lightweight URL parsing to extract keywords from domain and path.
        Results are cached for better performance.
        
        Args:
            url: The URL to parse
            
        Returns:
            List of extracted keywords
        """
        self.rate_limiter.wait()  # Rate limit the parsing
        
        try:
            parsed = urlparse(url)
            if not parsed.netloc:
                logger.warning(f"Invalid URL provided: {url}")
                return []
            
            keywords = []

            # Extract domain parts (split by dot and hyphen)
            domain_parts = re.split(r"[.-]", parsed.netloc)
            keywords.extend([part.lower() for part in domain_parts if len(part) > 2])

            # Extract path parts
            path_parts = re.split(r"[/-]", parsed.path)
            keywords.extend([part.lower() for part in path_parts if len(part) > 2])

            # Filter out common stopwords
            stopwords = {"www", "com", "net", "org", "html", "php", "index"}
            keywords = [kw for kw in keywords if kw not in stopwords]

            logger.info(f"Successfully extracted {len(keywords)} keywords from URL")
            return keywords
        except Exception as e:
            logger.error(f"Error parsing URL {url}: {e}")
            return []

    @lru_cache(maxsize=100)
    def classify_industry(self, keywords: str) -> str:
        """
        Classify industry by matching keywords with industry map keys.
        Results are cached for better performance.
        
        Args:
            keywords: Comma-separated string of keywords
            
        Returns:
            Industry classification
        """
        self.rate_limiter.wait()
        keyword_list = keywords.split(',')
        for industry in self.industry_map:
            if industry in keyword_list:
                return industry
        return "general"

    def suggest_audience(self, industry: str) -> Dict:
        """
        Suggest audience segments based on industry.
        Defaults if industry unknown.
        """
        return self.industry_map.get(industry, {
            "channels": ["Facebook", "Google"],
            "age_range": (18, 65),
            "interests": ["general"],
            "strategy": "Use broad marketing to test your audience."
        })

    def suggest_business_size(self, employee_count: Optional[int]) -> str:
        """
        Rough business size categorization by employee count.
        None defaults to small.
        """
        if employee_count is None or employee_count < 0:
            return "small"
        if employee_count < 50:
            return "small"
        elif employee_count < 250:
            return "medium"
        else:
            return "large"

    def build_campaign(self, keywords: List[str], industry: str) -> Dict:
        """
        Build campaign with ad copy, image prompts, channels, targeting.
        """
        audience = self.suggest_audience(industry)
        ad_copy = self.generate_ad_copy(keywords)
        image_prompt = self.generate_image_prompt(keywords)
        channels = audience.get("channels", ["Facebook", "Google"])
        targeting = {
            "age_range": audience.get("age_range", (18, 65)),
            "interests": audience.get("interests", []),
            "geo": "default"  # Could be enhanced
        }

        return {
            "ad_copy": ad_copy,
            "image_prompt": image_prompt,
            "channels": channels,
            "targeting": targeting
        }

    def generate_ad_copy(self, keywords: List[str]) -> List[Dict]:
        """
        Generate several ad copy variations: headline, description, CTA.
        """
        if not keywords or not self.cta_list:
            return [{
                "headline": "Discover our products now!",
                "description": "Try our products and feel the difference today.",
                "cta": "Learn More"
            }]

        headlines = [f"Discover the best {k.capitalize()} now!" for k in keywords[:3]]
        descriptions = [f"Try our {k} and feel the difference today." for k in keywords[:3]]
        ads = []
        for i in range(min(len(headlines), len(descriptions))):
            ads.append({
                "headline": headlines[i],
                "description": descriptions[i],
                "cta": random.choice(self.cta_list)
            })
        return ads

    def generate_image_prompt(self, keywords: List[str]) -> str:
        """
        Generate an image prompt for creative visual ideas.
        """
        prompt = f"Professional product photo featuring {' and '.join(keywords[:3])}"
        return prompt

    def suggest_marketing_strategy(self, industry: str, business_size: str) -> str:
        """
        Combine industry strategy + business size template.
        """
        industry_strategy = self.industry_map.get(industry, {}).get("strategy", "Use general marketing approaches.")
        size_strategy = self.business_size_templates.get(business_size, "")
        return f"{industry_strategy} {size_strategy}"

    def generate_social_post_ideas(self, industry: str) -> Dict[str, List[str]]:
        """
        Generate platform-specific social media post ideas.
        """
        ideas = {
            "Facebook": [
                f"Share a customer testimonial about your {industry} products.",
                f"Post a behind-the-scenes look at how your {industry} items are made.",
                f"Run a poll about favorite {industry} features."
            ],
            "Instagram": [
                f"Create a visually stunning carousel showcasing your {industry} products.",
                f"Use Stories to highlight limited-time offers on {industry} items.",
                f"Post short videos demonstrating {industry} benefits."
            ],
            "TikTok": [
                f"Post fun, trending videos related to {industry} tips or hacks.",
                f"Show quick tutorials or product unboxings in {industry}.",
                f"Create challenges or hashtag campaigns around {industry}."
            ],
            "LinkedIn": [
                f"Publish articles on industry trends related to {industry}.",
                f"Share professional testimonials or case studies.",
                f"Highlight company culture focused on {industry} innovation."
            ],
            "Twitter": [
                f"Tweet quick tips related to {industry}.",
                f"Engage with trending topics about {industry}.",
                f"Share links to blog posts or news in the {industry} space."
            ]
        }
        return ideas

    def predict_performance(self, campaign: Dict) -> Dict:
        """
        Predict CTR, CPC, conversion rates with dummy plausible numbers.
        """
        ctr = round(random.uniform(1.5, 4.0), 2)  # %
        cpc = round(random.uniform(0.5, 1.5), 2)  # $
        conversion_rate = round(random.uniform(1.0, 3.0), 2)  # %
        return {
            "CTR": f"{ctr}%",
            "CPC": f"${cpc}",
            "Conversion Rate": f"{conversion_rate}%"
        }

    def ab_test_variations(self, campaign: Dict) -> List[Dict]:
        """
        Create simple A/B test variations by modifying headlines.
        """
        base_ads = campaign.get("ad_copy", [])
        variations = []
        suffixes = [" - Limited Offer!", " Today Only!", " Exclusive Deal!"]
        for ad in base_ads:
            for suffix in suffixes:
                variations.append({
                    "headline": ad["headline"] + suffix,
                    "description": ad["description"],
                    "cta": ad["cta"]
                })
        return variations

    def allocate_budget(self, campaign: Dict, budget: float) -> Dict:
        """
        Evenly split budget across channels.
        """
        if budget <= 0:
            return {}
            
        channels = campaign.get("channels", [])
        if not channels:
            return {}
            
        budget_per_channel = round(budget / len(channels), 2)
        return {channel: budget_per_channel for channel in channels}

    def schedule_campaign(self, campaign: Dict) -> Dict:
        """
        Suggest best days and hours to post (stub).
        """
        return {
            "best_days": ["Tuesday", "Thursday"],
            "best_hours": ["12pm-2pm", "7pm-9pm"]
        }

    def monitor_campaign(self, performance: Dict) -> List[str]:
        """
        Generate alerts based on CPC and CTR.
        """
        alerts = []
        cpc = float(performance["CPC"].strip("$"))
        ctr = float(performance["CTR"].strip("%"))
        if cpc > 1.2:
            alerts.append("Warning: High cost-per-click detected.")
        if ctr < 2.0:
            alerts.append("Warning: Low click-through rate detected.")
        return alerts

    def roi_dashboard(self, spend: float, conversions: int, revenue_per_conversion: float) -> Dict:
        """
        Calculate ROAS and other KPIs.
        """
        try:
            revenue = conversions * revenue_per_conversion
            roas = round(revenue / spend, 2) if spend and spend > 0 else 0
            return {
                "Spend": f"${spend}",
                "Conversions": conversions,
                "Revenue": f"${revenue}",
                "ROAS": roas
            }
        except Exception as e:
            print(f"Error calculating ROI: {e}")
            return {
                "Spend": f"${spend}",
                "Conversions": conversions,
                "Revenue": "$0",
                "ROAS": 0
            }

    def generate_content_strategy(self, past_performance: Dict) -> List[str]:
        """
        Suggest content strategy based on past CTR.
        """
        recommendations = []
        ctr = float(past_performance.get("CTR", "0%").strip("%"))
        if ctr < 2.5:
            recommendations.append("Try short-form video next week.")
        else:
            recommendations.append("Carousel posts performed best this month.")
        recommendations.append("Consider retargeting recent visitors.")
        return recommendations

    def clear_cache(self):
        """
        Clear all cached results.
        Useful when configuration changes.
        """
        self.parse_url_keywords.cache_clear()
        self.classify_industry.cache_clear()
        logger.info("Cache cleared successfully")

# === Example usage ===

if __name__ == "__main__":
    tool = MarketingGeniusTool(config_path="your_config.json")

    # Input: business website URL and optional employee count
    url = "https://www.organicskincare.co.nz/products/serum"
    employee_count = 35  # optional, for business size

    # Parse URL to get keywords
    url_keywords = tool.parse_url_keywords(url)
    print("URL Keywords:", url_keywords)

    # Classify industry
    industry = tool.classify_industry(','.join(url_keywords))
    print("Industry:", industry)

    # Determine business size
    biz_size = tool.suggest_business_size(employee_count)
    print("Business Size:", biz_size)

    # Build campaign
    campaign = tool.build_campaign(url_keywords, industry)
    print("\nCampaign:")
    print(campaign)

    # Marketing strategy recommendation
    strategy = tool.suggest_marketing_strategy(industry, biz_size)
    print("\nMarketing Strategy Recommendation:")
    print(strategy)

    # Social media post ideas
    social_ideas = tool.generate_social_post_ideas(industry)
    print("\nSocial Media Post Ideas (sample):")
    for platform, ideas in social_ideas.items():
        print(f"{platform}: {ideas[:2]}")  # print first 2 ideas per platform

    # Predict campaign performance
    performance = tool.predict_performance(campaign)
    print("\nPredicted Campaign Performance:")
    print(performance)

    # Generate A/B test variations
    ab_variations = tool.ab_test_variations(campaign)
    print(f"\nA/B Test Variations (sample {min(len(ab_variations),3)}):")
    for var in ab_variations[:3]:
        print(var)

    # Budget allocation
    budget_alloc = tool.allocate_budget(campaign, budget=500)
    print("\nBudget Allocation:")
    print(budget_alloc)

    # Scheduling suggestion
    schedule = tool.schedule_campaign(campaign)
    print("\nCampaign Schedule Suggestion:")
    print(schedule)

    # Monitoring alerts
    alerts = tool.monitor_campaign(performance)
    print("\nCampaign Alerts:")
    print(alerts)

    # ROI dashboard example
    roi = tool.roi_dashboard(spend=500, conversions=30, revenue_per_conversion=25)
    print("\nROI Dashboard:")
    print(roi)

    # Content strategy suggestions
    content_recs = tool.generate_content_strategy(performance)
    print("\nContent Strategy Recommendations:")
    print(content_recs)
