from loguru import logger
import chromedriver_autoinstaller
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from tempfile import mkdtemp
import time
from bs4 import BeautifulSoup, Tag, NavigableString, Comment
import re

chromedriver_autoinstaller.install()

class Crawler:
    def __init__(self, scroll_limit: int = 5):
        options = webdriver.ChromeOptions()
        options.add_argument("--no-sandbox")
        options.add_argument("--headless=new")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--log-level=3")
        options.add_argument("--disable-popup-blocking")
        options.add_argument("--disable-notifications")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-background-networking")
        options.add_argument("--ignore-certificate-errors")
        options.add_argument(f"--user-data-dir={mkdtemp()}")
        options.add_argument(f"--data-path={mkdtemp()}")
        options.add_argument(f"--disk-cache-dir={mkdtemp()}")
        options.add_argument("--remote-debugging-port=9226")

        self.scroll_limit = scroll_limit
        self.driver = webdriver.Chrome(options=options)

    def scroll_page(self):
        current_scroll = 0
        last_height = self.driver.execute_script("return document.body.scrollHeight")
        while True:
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(5)
            new_height = self.driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height or (self.scroll_limit and current_scroll >= self.scroll_limit):
                break
            last_height = new_height
            current_scroll += 1

    def fetch_html(self, url):
        self.driver.get(url)
        WebDriverWait(self.driver, 15).until(
            expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "div#mw-content-text .mw-parser-output"))
        )
        time.sleep(0.5)
        return self.driver.page_source

    def _is_heading_tag(self, el):
        return isinstance(el, Tag) and re.fullmatch(r"h[1-6]", el.name or "")

    def _is_inside_ignored_box(self, tag):
        for anc in tag.parents:
            classes = anc.get("class") or []
            if any(c in ("infobox", "navbox", "vertical-navbox", "toc", "metadata") for c in classes):
                return True
        return False

    def _collect_lead_text(self, content, first_heading):
        parts = []
        for ch in content.children:
            if ch is first_heading:
                break
            if not isinstance(ch, Tag):
                continue
            for p in ch.find_all(["p", "li", "dd", "dt"]):
                if self._is_inside_ignored_box(p):
                    continue
                t = p.get_text(" ", strip=True)
                t = re.sub(r'\[\s*\d+\s*\]', '', t)
                t = re.sub(r'\n', ' ', t)
                if t:
                    parts.append(t)
        return " ".join(parts).strip()

    def _collect_text_for_heading(self, h, h_level):
        parts = []
        for el in h.next_elements:
            if isinstance(el, Comment):
                continue
            if isinstance(el, NavigableString):
                continue

            if self._is_heading_tag(el):
                try:
                    lvl = int(el.name[1])
                except:
                    lvl = 1
                if lvl <= h_level:
                    break
                else:
                    continue

            if not isinstance(el, Tag):
                continue

            if self._is_inside_ignored_box(el):
                continue

            if el.name in ("p", "li", "dd", "dt"):
                t = el.get_text(" ", strip=True)
                t = re.sub(r'\[\s*\d+\s*\]', '', t)
                t = re.sub(r'\n', ' ', t)
                if t:
                    parts.append(t)

        return " ".join(parts).strip()

    def parse_sections_by_headings(self, html):
        soup = BeautifulSoup(html, "html.parser")
        content = soup.select_one("div#mw-content-text .mw-parser-output") or soup.select_one("#mw-content-text")
        if not content:
            raise RuntimeError("Nie znaleziono kontenera artykułu")

        headings = [h for h in content.find_all(re.compile(r"^h[1-6]$"))]

        sections = []

        if headings:
            first = headings[0]
            lead_text = self._collect_lead_text(content, first)
            sections.append({"title": "", "level": 1, "text": lead_text})
        else:
            whole_parts = []
            for p in content.find_all(["p", "li", "dd", "dt"]):
                if self._is_inside_ignored_box(p):
                    continue
                t = p.get_text(" ", strip=True)
                t = re.sub(r'\[\s*\d+\s*\]', '', t)
                t = re.sub(r'\n', ' ', t)
                if t:
                    whole_parts.append(t)
            sections.append({"title": "", "level": 1, "text": " ".join(whole_parts).strip()})
            return sections

        for h in headings:
            try:
                h_level = int(h.name[1])
            except:
                h_level = 2
            headline = h.get_text(strip=True)
            text = self._collect_text_for_heading(h, h_level)
            sections.append({"title": headline, "level": h_level, "text": text})
        return sections

    def scrape_article_sections(self, url):
        html = self.fetch_html(url)
        secs = self.parse_sections_by_headings(html)
        out = []
        for s in secs:
            out.append({
                "page_url": url,
                "title": s["title"],
                "text": s["text"],
                "level": s.get("level")
            })
        return out

    def extract(self, link):
        sections = self.scrape_article_sections(link)
        sections = [s for s in sections if s.get('text') and s.get('title') is not None]
        logger.info(f"Znaleziono sekcji: {len(sections)}")
        # for i, s in enumerate(sections[:10], start=1):
        #     logger.info(f"{i}. {s['title'] or 'Lead'}  (len text: {len(s['text'])})")
        return sections

    def close(self):
        try:
            self.driver.quit()
        except Exception:
            pass
