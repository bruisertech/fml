import os
from playwright.sync_api import sync_playwright

def run_verification(page):
    page.set_viewport_size({"width": 1280, "height": 800})

    # 1. Open Index - Role Modal should appear on first load
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    # 2. Select Cliente Role
    page.get_by_role("button", name="Soy Persona Natural / Cliente").click()
    page.wait_for_timeout(1000)

    # 3. Triage Step 1 -> Click Urgencia Inmediata
    page.get_by_role("button", name="Urgencia Inmediata").click()
    page.wait_for_timeout(1000)

    # 4. Triage Step 2 -> Click SÍ, HAY HERIDOS
    page.get_by_role("button", name="SÍ, HAY HERIDOS").click()
    page.wait_for_timeout(1000)

    # 5. Click Continuation Button [ Ya me comuniqué con emergencias / Continuar con asistencia legal ]
    page.get_by_role("button", name="Ya me comuniqué con emergencias / Continuar con asistencia legal").click()
    page.wait_for_timeout(1000)

    # 6. Select Accidente de tránsito con lesionados
    page.get_by_role("button", name="Accidente de tránsito con lesionados").click()
    page.wait_for_timeout(1000)

    # 7. Select Role Víctima
    page.get_by_role("button", name="Soy Víctima / Afectado").click()
    page.wait_for_timeout(1000)

    # Take screenshot of Client Triage Step 5
    page.screenshot(path="/home/jules/verification/screenshots/client_triage.png")

    # 8. Switch Role to Abogado
    page.get_by_role("button", name="Cliente").click()
    page.wait_for_timeout(1000)

    # 9. Toggle Online on Driver Panel
    page.get_by_role("button", name="CONECTARSE").click()
    page.wait_for_timeout(1500)

    # 10. Click Aceptar Caso on first incoming case
    page.get_by_role("button", name="Aceptar Caso").first.click()
    page.wait_for_timeout(1500)

    # Take screenshot of Lawyer Accepted Case Modal with Legal Resources Table
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")

    # 11. Open Admin Portal
    page.goto("http://localhost:3000/admin.html")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/admin_portal.png")

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
