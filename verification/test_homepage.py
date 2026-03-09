from playwright.sync_api import sync_playwright
import urllib.request
import urllib.error
import os

def test_homepage():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_page()
        url = "https://rangolimall.com"

        if not os.path.exists("verification"):
            os.makedirs("verification")

        with open("verification/test_results.log", "w") as log_file:
            def log(message):
                print(message)
                log_file.write(message + "\n")

            log(f"Navigating to {url}...")
            try:
                context.goto(url, wait_until="networkidle", timeout=60000)
            except Exception as e:
                log(f"Failed to load homepage: {e}")
                browser.close()
                return

            # 1. Verify Sections Visibility
            sections = {
                "Header": "header.header",
                "Hero Banner": ".hero-banner-wrapper",
                "Brands We Love": ".brands-we-love",
                "Featured Collection": ".collection",
                "Footer": "footer"
            }

            log("\n--- Section Visibility Check ---")
            for name, selector in sections.items():
                element = context.locator(selector).first
                if element.is_visible():
                    log(f"[PASS] {name} is visible.")
                else:
                    log(f"[FAIL] {name} is NOT visible or missing.")

            # 2. Capture Screenshots
            log("\n--- Capturing Screenshots ---")
            try:
                context.screenshot(path="verification/homepage_full.png", full_page=True)
                log("[INFO] Full page screenshot saved: verification/homepage_full.png")

                # Individual sections
                for name, selector in sections.items():
                    element = context.locator(selector).first
                    if element.is_visible():
                        path = f"verification/section_{name.lower().replace(' ', '_')}.png"
                        element.screenshot(path=path)
                        log(f"[INFO] {name} screenshot saved: {path}")
            except Exception as e:
                log(f"[ERROR] Screenshot failed: {e}")

            # 3. Link Verification
            log("\n--- Link Verification Check ---")
            links = context.eval_on_selector_all("a[href]", "elements => elements.map(e => e.href)")
            unique_links = sorted(list(set(links)))
            log(f"Found {len(unique_links)} unique links.")

            broken_links = []
            for link in unique_links:
                if link.startswith("mailto:") or link.startswith("tel:") or link.startswith("javascript:"):
                    log(f"[SKIP] {link}")
                    continue

                try:
                    # Use urllib to check status code
                    req = urllib.request.Request(link, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
                    try:
                        with urllib.request.urlopen(req, timeout=10) as response:
                            log(f"[PASS] {response.getcode()} - {link}")
                    except urllib.error.HTTPError as e:
                        # Retry with GET in case HEAD is not allowed
                        req = urllib.request.Request(link, method='GET', headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req, timeout=10) as response:
                            log(f"[PASS] {response.getcode()} - {link}")
                except urllib.error.HTTPError as e:
                    log(f"[FAIL] {e.code} - {link}")
                    broken_links.append((link, e.code))
                except Exception as e:
                    log(f"[ERROR] {link} - {e}")
                    broken_links.append((link, str(e)))

            log("\n--- Summary ---")
            if not broken_links:
                log("All tested links are working correctly.")
            else:
                log(f"Found {len(broken_links)} broken or unreachable links.")
                for link, status in broken_links:
                    log(f"- {link}: {status}")

        browser.close()

if __name__ == "__main__":
    test_homepage()
