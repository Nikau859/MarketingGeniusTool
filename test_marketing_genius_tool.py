import unittest
from marketing_genius_tool import MarketingGeniusTool
import os
import json
import tempfile

class TestMarketingGeniusTool(unittest.TestCase):
    def setUp(self):
        """Set up test cases."""
        self.tool = MarketingGeniusTool()
        
        # Create temporary config file for testing
        self.test_config = {
            "industry_map": {
                "test_industry": {
                    "channels": ["TestChannel"],
                    "age_range": (20, 30),
                    "interests": ["test"],
                    "strategy": "Test strategy"
                }
            }
        }
        self.temp_config_file = tempfile.NamedTemporaryFile(mode='w', delete=False)
        json.dump(self.test_config, self.temp_config_file)
        self.temp_config_file.close()

    def tearDown(self):
        """Clean up after tests."""
        os.unlink(self.temp_config_file.name)

    def test_parse_url_keywords(self):
        """Test URL keyword parsing."""
        # Test valid URL
        url = "https://www.example.com/products/skincare"
        keywords = self.tool.parse_url_keywords(url)
        self.assertIsInstance(keywords, list)
        self.assertTrue(len(keywords) > 0)
        
        # Test invalid URL
        invalid_url = "not-a-url"
        keywords = self.tool.parse_url_keywords(invalid_url)
        self.assertEqual(keywords, [])

    def test_classify_industry(self):
        """Test industry classification."""
        # Test known industry
        keywords = "skincare,beauty,organic"
        industry = self.tool.classify_industry(keywords)
        self.assertEqual(industry, "skincare")
        
        # Test unknown industry
        keywords = "unknown,keywords"
        industry = self.tool.classify_industry(keywords)
        self.assertEqual(industry, "general")

    def test_suggest_business_size(self):
        """Test business size suggestions."""
        # Test small business
        self.assertEqual(self.tool.suggest_business_size(10), "small")
        
        # Test medium business
        self.assertEqual(self.tool.suggest_business_size(100), "medium")
        
        # Test large business
        self.assertEqual(self.tool.suggest_business_size(300), "large")
        
        # Test invalid input
        self.assertEqual(self.tool.suggest_business_size(-1), "small")
        self.assertEqual(self.tool.suggest_business_size(None), "small")

    def test_roi_dashboard(self):
        """Test ROI calculations."""
        # Test normal case
        roi = self.tool.roi_dashboard(spend=100, conversions=10, revenue_per_conversion=20)
        self.assertEqual(roi["ROAS"], 2.0)
        
        # Test zero spend
        roi = self.tool.roi_dashboard(spend=0, conversions=10, revenue_per_conversion=20)
        self.assertEqual(roi["ROAS"], 0)

    def test_config_loading(self):
        """Test configuration loading."""
        # Test with custom config
        tool_with_config = MarketingGeniusTool(self.temp_config_file.name)
        self.assertIn("test_industry", tool_with_config.industry_map)
        
        # Test with default config
        tool_default = MarketingGeniusTool()
        self.assertIn("skincare", tool_default.industry_map)

    def test_cache_clearing(self):
        """Test cache clearing functionality."""
        # First call should cache results
        url = "https://www.example.com/test"
        self.tool.parse_url_keywords(url)
        
        # Clear cache
        self.tool.clear_cache()
        
        # Cache should be empty
        self.assertEqual(self.tool.parse_url_keywords.cache_info().currsize, 0)

if __name__ == '__main__':
    unittest.main() 