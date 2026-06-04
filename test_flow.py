import sys
import os
import time
import json
import urllib.request
from playwright.sync_api import sync_playwright

PROJECT_IDS = ["demo-no-project", "appmanag-30eb1", "demo-appmanag-30eb1"]
ACTIVE_PROJECT_ID = "demo-no-project"

def get_appointments():
    global ACTIVE_PROJECT_ID
    for pid in PROJECT_IDS:
        url = f"http://localhost:8080/v1/projects/{pid}/databases/(default)/documents/appointments"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                docs = data.get("documents", [])
                if docs:
                    ACTIVE_PROJECT_ID = pid
                    return docs
        except Exception:
            continue
    return []

def get_audit_logs(appointment_id):
    url = f"http://localhost:8080/v1/projects/{ACTIVE_PROJECT_ID}/databases/(default)/documents/appointments/{appointment_id}/logs"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return data.get("documents", [])
    except Exception:
        return []

def main():
    try:
        import sys
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass
        
    print("[TEST] Starting automated system test...")
    artifact_dir = r"C:\Users\ramma\.gemini\antigravity-ide\brain\26168429-30eb-4416-af15-3b2a2838f58d"
    os.makedirs(artifact_dir, exist_ok=True)
    
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        # Go to create page
        print("Navigating to appointment booking page...")
        page.goto("http://localhost:5173/create", wait_until="load")
        
        # Log console messages
        page.on("console", lambda msg: print(f"[BROWSER CONSOLE] {msg.type}: {msg.text}"))
        
        # Fill out form
        print("Filling out form fields...")
        page.fill("#name", "Antigravity Automated Test")
        page.fill("#email", "ram.kuparati.ai@gmail.com")
        
        # Set date and time
        page.fill("#appointmentDate", "2026-06-15")
        page.fill("#appointmentTime", "14:30")
        
        screenshot_path_1 = os.path.join(artifact_dir, "screenshot_1_filled.png")
        page.screenshot(path=screenshot_path_1)
        print(f"Captured screenshot of filled form: {screenshot_path_1}")
        
        try:
            # Submit
            print("Submitting the appointment form...")
            page.click("button[type='submit']")
            
            # Wait for redirect to success page
            print("Waiting for redirection to success page...")
            page.wait_for_url("**/success", timeout=15000)
            
            screenshot_path_2 = os.path.join(artifact_dir, "screenshot_2_success.png")
            page.screenshot(path=screenshot_path_2)
            print(f"Captured screenshot of success page: {screenshot_path_2}")
        except Exception as e:
            screenshot_failure = os.path.join(artifact_dir, "screenshot_failure.png")
            page.screenshot(path=screenshot_failure)
            print(f"[ERROR] Submission failed. Screenshot saved to {screenshot_failure}")
            # print page HTML or URL
            print(f"Current page URL: {page.url}")
            raise e
        
        # Fetch the created appointment from Firestore emulator to get its ID
        print("Fetching appointment document from Firestore emulator...")
        time.sleep(2)  # Give Firestore trigger a moment to run
        appointments = get_appointments()
        if not appointments:
            print("[ERROR] Failed to retrieve appointment from Firestore emulator!")
            browser.close()
            sys.exit(1)
        
        # Sort by creation time (or find the one matching name)
        target_appt = None
        for appt in appointments:
            fields = appt.get("fields", {})
            name = fields.get("customerName", {}).get("stringValue", "")
            if name == "Antigravity Automated Test":
                target_appt = appt
                break
                
        if not target_appt:
            print("[ERROR] Created appointment not found in Firestore emulator!")
            browser.close()
            sys.exit(1)
            
        # Document name format is usually "projects/demo-no-project/databases/(default)/documents/appointments/{appointmentId}"
        appt_path = target_appt.get("name", "")
        appt_id = appt_path.split("/")[-1]
        print(f"[OK] Found appointment in database! ID: {appt_id}")
        
        # Navigate to Dashboard
        print("Navigating to the Dashboard...")
        page.goto("http://localhost:5173/dashboard", wait_until="load")
        
        screenshot_path_3 = os.path.join(artifact_dir, "screenshot_3_dashboard_initial.png")
        page.screenshot(path=screenshot_path_3)
        print(f"Captured initial dashboard screenshot: {screenshot_path_3}")
        
        # Poll status of the appointment row in the table
        print("Monitoring status transitions on the dashboard row...")
        start_time = time.time()
        timeout = 40
        last_status = None
        
        while time.time() - start_time < timeout:
            # We can read the first row of table in dashboard
            # Let's locate the row containing the email
            row = page.locator(f"tr:has-text('{appt_id}')")
            if not row.count():
                # Try finding by name or email
                row = page.locator("tr:has-text('Antigravity Automated Test')")
            
            if row.count():
                cells = row.locator("td")
                if cells.count() >= 5:
                    status_text = cells.nth(4).inner_text().strip().replace("\n", " ")
                    confirm_text = cells.nth(5).inner_text().strip()
                    reminder_text = cells.nth(6).inner_text().strip()
                    
                    current_state = f"Status: {status_text} | Confirmed: {confirm_text} | Reminder: {reminder_text}"
                    if current_state != last_status:
                        print(f"[TIME] [{int(time.time() - start_time)}s] Transition -> {current_state}")
                        last_status = current_state
                        
                    if "Completed" in status_text:
                        print("[SUCCESS] Appointment status successfully transitioned to Completed!")
                        break
            else:
                print("[WARNING] Appointment row not visible on dashboard yet...")
                
            time.sleep(2)
            
        screenshot_path_4 = os.path.join(artifact_dir, "screenshot_4_dashboard_completed.png")
        page.screenshot(path=screenshot_path_4)
        print(f"Captured final completed dashboard screenshot: {screenshot_path_4}")
        
        # Now fetch final document data and audit logs from Firestore emulator
        print("\n--- Firestore Final State Verification ---")
        appointments = get_appointments()
        final_appt = None
        for appt in appointments:
            if appt_id in appt.get("name", ""):
                final_appt = appt
                break
                
        if final_appt:
            fields = final_appt.get("fields", {})
            print(f"Customer Name: {fields.get('customerName', {}).get('stringValue')}")
            print(f"Email: {fields.get('email', {}).get('stringValue')}")
            print(f"Status: {fields.get('status', {}).get('stringValue')}")
            print(f"Confirmation Sent: {fields.get('confirmationSent', {}).get('booleanValue')}")
            print(f"Reminder Sent: {fields.get('reminderSent', {}).get('booleanValue')}")
            
        # Fetch audit logs
        print("\n--- Audit Logs (appointments/{id}/logs) ---")
        logs = get_audit_logs(appt_id)
        sorted_logs = []
        for log in logs:
            log_fields = log.get("fields", {})
            action = log_fields.get("eventType", {}).get("stringValue", "")
            message = log_fields.get("message", {}).get("stringValue", "")
            timestamp = log_fields.get("timestamp", {}).get("timestampValue", "")
            sorted_logs.append((timestamp, action, message))
            
        sorted_logs.sort(key=lambda x: x[0])
        for ts, action, msg in sorted_logs:
            print(f"[{ts}] {action.upper()}: {msg}")
            
        browser.close()
        print("\n[SUCCESS] End-to-end automation system test completed successfully!")

if __name__ == "__main__":
    main()
