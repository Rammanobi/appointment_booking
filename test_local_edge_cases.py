import time
from datetime import datetime, timedelta
from playwright.sync_api import sync_playwright, expect

def test_local_edge_cases():
    print("\n[TEST] Starting local Web App edge-cases browser test on http://localhost:5173...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        # --- TEST 1: INVALID PHONE NUMBER FORMAT ---
        print("\n--- TEST 1: Invalid Phone Format ---")
        try:
            page.goto("http://localhost:5173/create", wait_until="load")
            page.fill("#name", "Invalid Phone User")
            page.fill("#phone", "12345") # Invalid format, missing '+'
            
            tomorrow = datetime.now() + timedelta(days=1)
            tomorrow_date = tomorrow.strftime("%Y-%m-%d")
            page.fill("#appointmentDate", tomorrow_date)
            page.fill("#appointmentTime", "10:00")
            
            # Click submit
            page.click("button[type='submit']")
            time.sleep(1)
            
            # The HTML5 pattern validation should block form submission, so we shouldn't navigate away.
            if page.url.endswith("/create"):
                print("PASSED: Form validation correctly blocked invalid phone format.")
            else:
                print("FAILED: Form allowed invalid phone format submission.")
                
        except Exception as e:
            print(f"Test 1 Error: {e}")

        # --- TEST 2 & 3: VALID SUBMISSION + DUPLICATE PREVENTION ---
        print("\n--- TEST 2 & 3: Valid Submission + Duplicate Prevention ---")
        try:
            page.goto("http://localhost:5173/create", wait_until="load")
            
            # Submitting first valid appointment
            name = f"Duplicate Tester {int(time.time())}"
            phone = "+918520845152"
            
            page.fill("#name", name)
            page.fill("#phone", phone)
            page.fill("#appointmentDate", tomorrow_date)
            page.fill("#appointmentTime", "11:00")
            
            print("Submitting first valid appointment...")
            time.sleep(2) # Avoid React double-submit race condition
            page.click("button[type='submit']")
            page.wait_for_url("**/success", timeout=10000)
            print("First appointment submitted successfully.")
            
            # Submitting the EXACT SAME appointment immediately to trigger duplicate check
            print("Submitting second (duplicate) appointment...")
            page.goto("http://localhost:5173/create", wait_until="load")
            page.fill("#name", name)
            page.fill("#phone", phone)
            page.fill("#appointmentDate", tomorrow_date)
            page.fill("#appointmentTime", "11:00")
            
            page.click("button[type='submit']")
            page.wait_for_url("**/success", timeout=10000)
            print("Second appointment submitted successfully (but backend should block it).")
            
            # Check the Dashboard for results
            print("\nNavigating to Dashboard to verify backend validation...")
            page.goto("http://localhost:5173/dashboard", wait_until="load")
            
            # Search for the user to isolate the records
            page.fill("input[type='text']", phone)
            time.sleep(3) # Wait for Firestore sync
            
            # Find the rows for this phone number
            rows = page.locator("tbody tr").all()
            print(f"Found {len(rows)} matching rows in dashboard.")
            
            has_failed = False
            has_created = False
            
            for row in rows:
                text = row.inner_text()
                if "Failed" in text or "Duplicate appointment submission detected" in text:
                    has_failed = True
                elif "Created" in text or "Confirming" in text or "Confirmed" in text:
                    has_created = True
                    
            if has_failed and has_created:
                print("PASSED: Backend correctly processed the first appointment and FAILED the duplicate.")
            else:
                print("FAILED: Did not find both a successful and a failed duplicate record.")
                
        except Exception as e:
            print(f"Test 2/3 Error: {e}")

        # --- TEST 4: INTERACTIVE CANCELLATION ---
        print("\n--- TEST 4: Interactive Cancellation ---")
        try:
            # We are already on the dashboard, filtered by the duplicate user.
            # Click the 'Cancel' button on the successful row.
            
            # We need to accept the JS dialog alert.
            page.on("dialog", lambda dialog: dialog.accept())
            
            print("Clicking Cancel on the active appointment...")
            cancel_btn = page.locator("button:has-text('Cancel')").first
            if cancel_btn.is_visible():
                cancel_btn.click()
                time.sleep(2) # wait for Firestore sync
                
                rows = page.locator("tbody tr").all()
                cancelled_found = False
                for row in rows:
                    if "Cancelled" in row.inner_text():
                        cancelled_found = True
                        break
                        
                if cancelled_found:
                    print("PASSED: Appointment was successfully cancelled and updated in UI.")
                else:
                    print("FAILED: Appointment status did not update to Cancelled.")
            else:
                print("FAILED: Cancel button not found.")
                
        except Exception as e:
            print(f"Test 4 Error: {e}")
            
        print("\n[TEST] End of Edge Cases execution.")
        browser.close()

if __name__ == "__main__":
    test_local_edge_cases()
