import os
import random
import requests
from datetime import date

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:3000")

USER_EMAIL = os.getenv("USER_EMAIL", "ghokih@yandex.ru")
USER_PASSWORD = os.getenv("USER_PASSWORD", "12345678")

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@phoenix.memorial")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "PhoenixAdmin2024!")

PAGES_TO_CREATE = int(os.getenv("PAGES_TO_CREATE", "100"))

FIRST_NAMES = [
    "Иван", "Петр", "Алексей", "Сергей", "Дмитрий",
    "Николай", "Андрей", "Михаил", "Владимир", "Егор"
]

LAST_NAMES = [
    "Иванов", "Петров", "Сидоров", "Кузнецов", "Смирнов",
    "Попов", "Васильев", "Новиков", "Федоров", "Морозов"
]

OBJECT_TYPES = ["tree", "plaque", "place"]


def login(email: str, password: str) -> str:
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": email, "password": password},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["access_token"]


def get_headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def find_task(admin_headers: dict, entity_type: str, entity_id: str):
    r = requests.get(
        f"{BASE_URL}/api/admin/moderation/tasks",
        headers=admin_headers,
        params={
            "entity_type": entity_type,
            "status": "pending",
            "limit": 100,
            "offset": 0,
        },
        timeout=30,
    )
    r.raise_for_status()
    items = r.json()["items"]
    for item in items:
        if item["entity_id"] == entity_id:
            return item["id"]
    return None


def approve_task(admin_headers: dict, task_id: str):
    r = requests.post(
        f"{BASE_URL}/api/admin/moderation/tasks/{task_id}/approve",
        headers=admin_headers,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def random_person(i: int):
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    full_name = f"{last} {first} {i}"

    birth_year = random.randint(1930, 1995)
    death_year = random.randint(birth_year + 18, 2024)

    lat = 55.70 + random.random() * 0.25
    lng = 37.45 + random.random() * 0.35

    return {
        "full_name": full_name,
        "gender": random.choice(["male", "female", "unknown"]),
        "life_status": "deceased",
        "birth_date": f"{birth_year}-01-01",
        "death_date": f"{death_year}-01-01",
        "burial_place": f"Тестовое место памяти #{i}",
        "burial_place_lat": round(lat, 6),
        "burial_place_lng": round(lng, 6),
    }


def create_page(user_headers: dict, i: int):
    person = random_person(i)
    payload = {
        "person": person,
        "title": f"Страница памяти #{i}",
        "biography": f"Это автоматически созданная тестовая биография для записи #{i}.",
        "short_description": f"Тестовая страница памяти #{i}.",
        "visibility": "public",
    }
    r = requests.post(
        f"{BASE_URL}/api/pages",
        headers=user_headers,
        json=payload,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def create_qr(user_headers: dict, page_id: str):
    r = requests.post(
        f"{BASE_URL}/api/pages/{page_id}/qr",
        headers=user_headers,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def publish_page(user_headers: dict, page_id: str):
    r = requests.post(
        f"{BASE_URL}/api/pages/{page_id}/publish",
        headers=user_headers,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def create_object(user_headers: dict, page_id: str, i: int, lat: float, lng: float):
    payload = {
        "page_id": page_id,
        "type": "tree",
        "lat": lat,
        "lng": lng,
        "title": f"Объект памяти #{i}",
    }

    r = requests.post(
        f"{BASE_URL}/api/objects",
        headers=user_headers,
        json=payload,
        timeout=30,
    )

    if r.status_code >= 400:
        print("Ошибка создания объекта:")
        print("status =", r.status_code)
        print("body =", r.text)
        return None

    return r.json()


def publish_object(user_headers: dict, object_id: str):
    r = requests.post(
        f"{BASE_URL}/api/objects/{object_id}/publish",
        headers=user_headers,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def main():
    print("Логинимся как пользователь...")
    user_token = login(USER_EMAIL, USER_PASSWORD)
    user_headers = get_headers(user_token)

    print("Логинимся как админ...")
    admin_token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    admin_headers = get_headers(admin_token)

    created = []

    for i in range(1, PAGES_TO_CREATE + 1):
        print(f"\n=== Создаём запись {i}/{PAGES_TO_CREATE} ===")

        page = create_page(user_headers, i)
        page_id = page["id"]
        slug = page["slug"]

        qr = create_qr(user_headers, page_id)
        qr_code = qr["code"]

        publish_page(user_headers, page_id)
        page_task_id = find_task(admin_headers, "page", page_id)
        if page_task_id:
            approve_task(admin_headers, page_task_id)
            print(f"Страница опубликована: {slug}")
        else:
            print(f"Не нашли задачу модерации для страницы {page_id}")

        lat = page["person"]["burial_place_lat"] or 55.75
        lng = page["person"]["burial_place_lng"] or 37.61

        obj = create_object(user_headers, page_id, i, lat, lng)

        object_id = None
        if obj is not None:
            object_id = obj["id"]

            try:
                publish_object(user_headers, object_id)
                object_task_id = find_task(admin_headers, "object", object_id)
                if object_task_id:
                    approve_task(admin_headers, object_task_id)
                    print(f"Объект опубликован: {object_id}")
                else:
                    print(f"Не нашли задачу модерации для объекта {object_id}")
            except Exception as e:
                print(f"Не удалось опубликовать объект {object_id}: {e}")
        else:
            print("Объект пропущен, продолжаем без него.")

        created.append({
            "page_id": page_id,
            "slug": slug,
            "qr_code": qr_code,
            "object_id": object_id,
        })

    print("\nГОТОВО")
    print(f"Создано страниц: {len(created)}")
    print("\nПримеры ссылок:")
    for item in created[:5]:
        print(f"Публичная страница: {BASE_URL}/p/{item['slug']}")
        print(f"QR-ссылка: {BASE_URL}/q/{item['qr_code']}")
        print("---")


if __name__ == "__main__":
    main()
