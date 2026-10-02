from playwright.sync_api import sync_playwright

def run_verification(page):
    page.set_viewport_size({"width": 1280, "height": 800})

    # 1. Open Index
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    # 2. Select Lawyer Role
    page.get_by_role("button", name="Soy Abogado / Profesional").click()
    page.wait_for_timeout(1000)

    # 3. Open Lawyer Profile Modal
    page.get_by_role("button", name="Configurar Perfil").click()
    page.wait_for_timeout(1000)

    # Fill T.P. and Date
    page.locator("#input-profile-tp-date").fill("2012-03-20")
    page.locator("#input-profile-tp-date").dispatch_event("change")
    page.wait_for_timeout(1000)

    # Take screenshot of Lawyer Profile Configuration Modal
    page.screenshot(path="/home/jules/verification/screenshots/lawyer_profile_modal.png")

    # Save Profile
    page.get_by_role("button", name="Guardar Perfil Profesional").click()
    page.wait_for_timeout(1000)

    # 4. Open Admin Portal
    page.goto("http://localhost:3000/admin.html")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/admin_directory.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
