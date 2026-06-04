import sys
import os
import time
from playwright.sync_api import sync_playwright
from datetime import datetime, timedelta

def main():
    print("\n[TEST] Starting live Web App browser test on https://appmanag-30eb1.web.app...")
    
    with sync_playwright() as p:
        print("Launching headless browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        # Go to live create page
        print("Navigating to live booking page https://appmanag-30eb1.web.app/create...")
        page.goto("https://appmanag-30eb1.web.app/create", wait_until="load")
        
        # Fill out form
        print("Filling out form fields...")
        page.fill("#name", "Real Webapp Test")
        page.fill("#email", "ram.kuparati.ai@gmail.com")
        
        # Set date and time (tomorrow at 15:45)
        tomorrow = datetime.now() + timedelta(days=1)
        tomorrow_date = tomorrow.strftime("%Y-%m-%d")
        print(f"Setting appointment date to tomorrow: {tomorrow_date} and time: 15:45")
        
        page.fill("#appointmentDate", tomorrow_date)
        page.fill("#appointmentTime", "15:45")
        
        # Submit
        print("Submitting the appointment form on the live webapp...")
        page.click("button[type='submit']")
        
        # Wait for redirect to success page
        print("Waiting for redirection to success page...")
        try:
            page.wait_for_url("**/success", timeout=15000)
            print(f"Successfully redirected to success page: {page.url}")
        except Exception as e:
            print(f"[ERROR] Submission failed or redirection timeout. Current URL: {page.url}")
            browser.close()
            sys.exit(1)
            
        # Navigate to Dashboard
        print("Navigating to live Dashboard https://appmanag-30eb1.web.app/dashboard...")
        page.goto("https://appmanag-30eb1.web.app/dashboard", wait_until="load")
        
        # Find the row containing 'Real Webapp Test'
        print("Waiting for dashboard table rows to load...")
        time.sleep(3) # Wait for Firestore snapshot to render
        
        row = page.locator("tr:has-text('Real Webapp Test')")
        if row.count():
            cells = row.locator("td")
            status_text = cells.nth(4).inner_text().strip().replace("\n", " ")
            confirm_text = cells.nth(5).inner_text().strip()
            reminder_text = cells.nth(6).inner_text().strip()
            print(f"[LIVE DASHBOARD STATE] Status: {status_text} | Confirmed: {confirm_text} | Reminder: {reminder_text}")
        else:
            print("[WARNING] Could not find the new appointment row on the live dashboard table.")
            
        browser.close()
        print("[OK] Live Web App browser verification completed.\n")

if __name__ == "__main__":
    main()
